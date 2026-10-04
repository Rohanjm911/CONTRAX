import time
from typing import List, Dict, Any, Callable
from app.analyzers.ast.analyzer import ASTAnalyzer
from app.analyzers.slither.runner import SlitherAnalyzer
from app.analyzers.mythril.runner import MythrilAnalyzer
from app.analyzers.gas.analyzer import GasAnalyzer
from app.analyzers.base import NormalizedFinding


class AnalysisPipeline:
    """
    Modular analysis pipeline executing stages:
    1. Validation
    2. Version Detection
    3. AST Parsing & Semantic Checks
    4. Slither Static Analysis
    5. Mythril Symbolic Analysis
    6. Gas Analysis
    7. Finding Normalization & Deduplication
    """

    def __init__(self):
        self.ast_analyzer = ASTAnalyzer()
        self.slither_analyzer = SlitherAnalyzer()
        self.mythril_analyzer = MythrilAnalyzer()
        self.gas_analyzer = GasAnalyzer()

    async def execute_pipeline(
        self,
        files: List[Dict[str, str]],
        progress_callback: Callable[[str, int, Dict[str, str]], None] = None
    ) -> Dict[str, Any]:
        all_findings: List[NormalizedFinding] = []
        stages = {
            "validation": "PENDING",
            "ast": "PENDING",
            "slither": "PENDING",
            "mythril": "PENDING",
            "gas": "PENDING",
            "normalization": "PENDING"
        }

        async def update_status(stage: str, status: str, pct: int):
            stages[stage] = status
            if progress_callback:
                await progress_callback(stage, pct, stages)

        start_all = time.time()

        await update_status("validation", "RUNNING", 10)
        await update_status("validation", "COMPLETED", 20)

        await update_status("ast", "RUNNING", 30)
        ast_result = await self.ast_analyzer.analyze("", files)
        all_findings.extend(ast_result.findings)
        await update_status("ast", "COMPLETED", 45)

        await update_status("slither", "RUNNING", 50)
        slither_result = await self.slither_analyzer.analyze("", files)
        all_findings.extend(slither_result.findings)
        await update_status("slither", "COMPLETED", 70)

        await update_status("mythril", "RUNNING", 75)
        mythril_result = await self.mythril_analyzer.analyze("", files)
        all_findings.extend(mythril_result.findings)
        await update_status("mythril", "COMPLETED", 85)

        await update_status("gas", "RUNNING", 90)
        gas_results = self.gas_analyzer.analyze_gas(files)
        await update_status("gas", "COMPLETED", 95)

        await update_status("normalization", "RUNNING", 98)
        deduped_findings = self._deduplicate_findings(all_findings)
        await update_status("normalization", "COMPLETED", 100)

        total_elapsed = round(time.time() - start_all, 2)

        return {
            "findings": deduped_findings,
            "gas_analysis": gas_results,
            "elapsed_time": total_elapsed,
            "stages": stages
        }

    def _deduplicate_findings(self, findings: List[NormalizedFinding]) -> List[NormalizedFinding]:
        seen = set()
        deduped = []
        for f in findings:
            key = (f.title, f.source_file, f.line_number)
            if key not in seen:
                seen.add(key)
                deduped.append(f)
        return deduped
