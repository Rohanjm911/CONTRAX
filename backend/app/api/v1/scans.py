import asyncio
from datetime import datetime, timezone
from typing import List, Dict
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db, AsyncSessionLocal
from app.db.models.scan import Scan
from app.db.models.contract import Contract
from app.db.models.finding import Finding
from app.db.models.gas_analysis import GasAnalysis
from app.db.models.report import Report
from app.db.models.user import User
from app.schemas.scan import ScanCreate, ScanStatusResponse, FindingResponse
from app.core.authentication import get_current_user
from app.analyzers.pipeline import AnalysisPipeline
from app.reports.json_report import generate_json_audit_report
from app.config.logging import logger

router = APIRouter(prefix="/scans", tags=["Scans"])


async def run_scan_background_task(scan_id: str):
    """
    Background worker function that executes analysis pipeline asynchronously
    without blocking HTTP requests, updating Scan and Findings in the database.
    """
    logger.info(f"Starting background scan job: {scan_id}")
    async with AsyncSessionLocal() as db:
        res = await db.execute(
            select(Scan).where(Scan.id == scan_id).options(
                selectinload(Scan.contract).selectinload(Contract.source_files)
            )
        )
        scan = res.scalars().first()
        if not scan:
            logger.error(f"Scan {scan_id} not found in worker.")
            return

        scan.status = "RUNNING"
        scan.started_at = datetime.now(timezone.utc)
        scan.current_stage = "Starting Pipeline"
        await db.commit()

        files = []
        for sf in scan.contract.source_files:
            files.append({"file_path": sf.file_path, "content": sf.content})

        pipeline = AnalysisPipeline()

        async def stage_callback(stage: str, pct: int, stages_dict: Dict[str, str]):
            scan.current_stage = f"Running {stage.upper()}"
            scan.progress_percentage = pct
            scan.stage_breakdown = stages_dict
            await db.commit()

        try:
            results = await pipeline.execute_pipeline(files, progress_callback=stage_callback)

            critical = high = medium = low = info = 0
            for f in results["findings"]:
                if f.severity == "CRITICAL": critical += 1
                elif f.severity == "HIGH": high += 1
                elif f.severity == "MEDIUM": medium += 1
                elif f.severity == "LOW": low += 1
                else: info += 1

                finding_db = Finding(
                    scan_id=scan.id,
                    title=f.title,
                    severity=f.severity,
                    confidence=f.confidence,
                    category=f.category,
                    detector=f.detector,
                    description=f.description,
                    impact=f.impact,
                    contract_name=f.contract_name or scan.contract.name,
                    function_name=f.function_name,
                    source_file=f.source_file,
                    line_number=f.line_number,
                    source_range=f.source_range,
                    code_snippet=f.code_snippet,
                    detection_tool=f.detection_tool,
                    remediation=f.remediation,
                    references=f.references
                )
                db.add(finding_db)

            for g in results["gas_analysis"]:
                gas_db = GasAnalysis(
                    scan_id=scan.id,
                    contract_name=g["contract_name"],
                    function_name=g["function_name"],
                    reliability=g["reliability"],
                    min_gas=g["min_gas"],
                    max_gas=g["max_gas"],
                    avg_gas=g["avg_gas"],
                    storage_writes_count=g["storage_writes_count"],
                    external_calls_count=g["external_calls_count"],
                    loops_detected=g["loops_detected"],
                    details=g["details"]
                )
                db.add(gas_db)

            scan.status = "COMPLETED"
            scan.current_stage = "Scan Finished"
            scan.progress_percentage = 100
            scan.critical_count = critical
            scan.high_count = high
            scan.medium_count = medium
            scan.low_count = low
            scan.informational_count = info
            scan.elapsed_time = results["elapsed_time"]
            scan.completed_at = datetime.now(timezone.utc)
            scan.stage_breakdown = results["stages"]

            contract_meta = {
                "name": scan.contract.name,
                "network": scan.contract.network or "Source Upload",
                "address": scan.contract.address,
                "compiler_version": scan.contract.compiler_version,
                "is_verified": scan.contract.is_verified
            }
            json_report_data = generate_json_audit_report(
                contract_meta,
                [f.model_dump() for f in results["findings"]],
                results["gas_analysis"],
                results["stages"],
                results["elapsed_time"]
            )
            report_json = Report(
                scan_id=scan.id,
                report_type="JSON",
                summary_data=json_report_data
            )
            db.add(report_json)

            await db.commit()
            logger.info(f"Scan {scan_id} completed successfully with {len(results['findings'])} findings.")

        except Exception as e:
            logger.error(f"Scan {scan_id} failed: {e}", exc_info=True)
            scan.status = "FAILED"
            scan.error_message = str(e)
            scan.completed_at = datetime.now(timezone.utc)
            await db.commit()


@router.post("", response_model=ScanStatusResponse, status_code=status.HTTP_202_ACCEPTED)
async def create_scan(
    scan_in: ScanCreate,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Initiates an asynchronous smart contract vulnerability scan."""
    c_res = await db.execute(select(Contract).where(Contract.id == scan_in.contract_id))
    contract = c_res.scalars().first()
    if not contract:
        raise HTTPException(status_code=404, detail="Target contract not found.")

    scan = Scan(
        contract_id=contract.id,
        scan_type=scan_in.scan_type,
        status="PENDING",
        current_stage="Queued",
        progress_percentage=0,
        stage_breakdown={
            "validation": "PENDING",
            "ast": "PENDING",
            "slither": "PENDING",
            "mythril": "PENDING",
            "gas": "PENDING",
            "normalization": "PENDING"
        }
    )
    db.add(scan)
    await db.commit()
    await db.refresh(scan)

    background_tasks.add_task(run_scan_background_task, scan.id)

    return scan


@router.get("", response_model=List[ScanStatusResponse])
async def list_scans(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves all vulnerability scans ordered by date."""
    res = await db.execute(select(Scan).order_by(Scan.created_at.desc()))
    return res.scalars().all()


@router.get("/{scan_id}", response_model=ScanStatusResponse)
async def get_scan(
    scan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = res.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.get("/{scan_id}/status", response_model=ScanStatusResponse)
async def get_scan_status(
    scan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Scan).where(Scan.id == scan_id))
    scan = res.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")
    return scan


@router.get("/{scan_id}/findings", response_model=List[FindingResponse])
async def get_scan_findings(
    scan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Finding).where(Finding.scan_id == scan_id))
    findings = res.scalars().all()
    return findings
