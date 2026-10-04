from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.db.database import get_db
from app.db.models.gas_analysis import GasAnalysis
from app.db.models.user import User
from app.schemas.report import GasAnalysisResponse
from app.core.authentication import get_current_user

router = APIRouter(prefix="/gas", tags=["Gas Analysis"])


@router.get("/scan/{scan_id}", response_model=List[GasAnalysisResponse])
async def get_gas_analysis_by_scan(
    scan_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    res = await db.execute(select(GasAnalysis).where(GasAnalysis.scan_id == scan_id))
    items = res.scalars().all()
    return items
