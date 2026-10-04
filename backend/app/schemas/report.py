from pydantic import BaseModel, ConfigDict
from typing import Optional, Dict, Any
from datetime import datetime


class GasAnalysisResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scan_id: str
    contract_name: str
    function_name: str
    reliability: str
    min_gas: Optional[int] = None
    max_gas: Optional[int] = None
    avg_gas: Optional[int] = None
    storage_writes_count: int
    external_calls_count: int
    loops_detected: int
    details: Dict[str, Any] = {}


class ReportResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scan_id: str
    report_type: str
    file_path: Optional[str] = None
    summary_data: Dict[str, Any] = {}
    created_at: datetime
