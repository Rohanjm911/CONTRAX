import os
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy.orm import selectinload

from app.db.database import get_db
from app.db.models.report import Report
from app.db.models.scan import Scan
from app.db.models.user import User
from app.schemas.report import ReportResponse
from app.core.authentication import get_current_user
from app.reports.pdf_report import generate_pdf_audit_report

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.get("/scan/{scan_id}", response_model=ReportResponse)
async def get_report_by_scan(
    scan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Report).where(Report.scan_id == scan_id))
    report = res.scalars().first()
    if not report:
        raise HTTPException(status_code=404, detail="Audit report not found for this scan.")
    return report


@router.get("/scan/{scan_id}/download-pdf")
async def download_scan_pdf(
    scan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Generates and streams a PDF audit report for the scan."""
    s_res = await db.execute(
        select(Scan).where(Scan.id == scan_id).options(
            selectinload(Scan.contract),
            selectinload(Scan.findings)
        )
    )
    scan = s_res.scalars().first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan not found")

    contract_info = {
        "name": scan.contract.name,
        "network": scan.contract.network or "Local Upload",
        "compiler_version": scan.contract.compiler_version or "0.8.20",
        "is_verified": scan.contract.is_verified
    }

    findings_list = [
        {
            "severity": f.severity,
            "title": f.title,
            "category": f.category,
            "detector": f.detector,
            "description": f.description,
            "impact": f.impact,
            "source_file": f.source_file,
            "line_number": f.line_number,
            "confidence": f.confidence,
            "remediation": f.remediation
        }
        for f in scan.findings
    ]

    pdf_path = generate_pdf_audit_report(contract_info, findings_list)

    if not os.path.exists(pdf_path):
        raise HTTPException(status_code=500, detail="Failed to compile PDF audit document.")

    return FileResponse(
        path=pdf_path,
        media_type="application/pdf",
        filename=f"CONTRAX_Audit_{scan.contract.name}_{scan_id[:8]}.pdf"
    )
