from pydantic import BaseModel, ConfigDict
from typing import Optional, List, Any
from datetime import datetime


class SourceFileCreate(BaseModel):
    file_path: str
    content: str


class SourceFileResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    file_path: str
    content: str
    file_size: int
    sha256_hash: str
    created_at: datetime


class ContractCreate(BaseModel):
    project_id: str
    name: str
    compiler_version: Optional[str] = None
    solidity_pragma: Optional[str] = None
    address: Optional[str] = None
    network: Optional[str] = None
    source_files: Optional[List[SourceFileCreate]] = []


class ContractResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: str
    project_id: str
    name: str
    compiler_version: Optional[str] = None
    solidity_pragma: Optional[str] = None
    address: Optional[str] = None
    network: Optional[str] = None
    is_verified: bool
    optimization_used: Optional[bool] = None
    abi: Optional[Any] = None
    created_at: datetime
    source_files: Optional[List[SourceFileResponse]] = []
