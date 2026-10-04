from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
from pydantic import BaseModel


class NormalizedFinding(BaseModel):
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


class AnalyzerResult(BaseModel):
    tool_name: str
    success: bool
    execution_time: float
    error_message: Optional[str] = None
    findings: List[NormalizedFinding] = []
    metadata: Dict[str, Any] = {}


class BaseAnalyzer(ABC):
    """Abstract base interface for all CONTRAX security analyzers."""
    
    @property
    @abstractmethod
    def name(self) -> str:
        """Name of the analyzer (e.g. slither, mythril, ast, gas)."""
        pass

    @abstractmethod
    async def analyze(self, project_path: str, files: List[Dict[str, str]], **kwargs) -> AnalyzerResult:
        """
        Executes analysis on the target project/files.
        Must return normalized findings without crashing caller.
        """
        pass
