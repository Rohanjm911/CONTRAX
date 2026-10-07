from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models.finding import Finding
from app.db.models.user import User
from app.schemas.scan import FindingResponse
from app.core.authentication import get_current_user

router = APIRouter(prefix="/findings", tags=["Findings"])

@router.get("", response_model=List[FindingResponse])
async def list_findings(
    scan_id: Optional[str] = Query(None, description="Filter findings by scan ID"),
    severity: Optional[str] = Query(None, description="Filter findings by severity level"),
    limit: int = Query(500, ge=1, le=1000, description="Maximum number of findings to retrieve"),
    offset: int = Query(0, ge=0, description="Offset for pagination"),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Retrieves security findings across scans with optional filtering and pagination."""
    query = select(Finding)
    if scan_id:
        query = query.where(Finding.scan_id == scan_id)
    if severity:
        query = query.where(Finding.severity == severity.upper())
    query = query.order_by(Finding.created_at.desc()).offset(offset).limit(limit)
    res = await db.execute(query)
    return res.scalars().all()


@router.get("/{finding_id}", response_model=FindingResponse)
async def get_finding(
    finding_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Finding).where(Finding.id == finding_id))
    finding = res.scalars().first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")
    return finding


@router.patch("/{finding_id}/review", response_model=FindingResponse)
async def review_finding(
    finding_id: str,
    status_label: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(Finding).where(Finding.id == finding_id))
    finding = res.scalars().first()
    if not finding:
        raise HTTPException(status_code=404, detail="Finding not found")

    finding.is_reviewed = status_label
    await db.commit()
    await db.refresh(finding)
    return finding
