from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


class ScanCreate(BaseModel):
    contract_id: str
    scan_type: Optional[str] = "SOURCE_CODE"


class ScanStatusResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    contract_id: str
    status: str
    current_stage: str
    progress_percentage: int
    stage_breakdown: Dict[str, str]
    critical_count: int
    high_count: int
    medium_count: int
    low_count: int
    informational_count: int
    elapsed_time: float
    error_message: Optional[str] = None
    created_at: datetime
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None


class FindingResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    scan_id: str
    title: str
    severity: str
    confidence: str
    category: str
    detector: str
    description: str
    impact: str
    contract_name: Optional[str] = None
    function_name: Optional[str] = None
    source_file: str
    line_number: Optional[int] = None
    source_range: Optional[Dict[str, Any]] = None
    code_snippet: Optional[str] = None
    detection_tool: str
    remediation: str
    references: List[str] = []
    is_reviewed: str
    created_at: datetime
