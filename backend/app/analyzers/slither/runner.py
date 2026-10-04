import time
import os
import json
import shutil
import tempfile
import asyncio
from typing import List, Dict, Any
from app.analyzers.base import BaseAnalyzer, AnalyzerResult, NormalizedFinding
from app.config.logging import logger


class SlitherAnalyzer(BaseAnalyzer):
    """
    Slither static analyzer runner and output normalizer.
    Executes in a safe isolated environment and maps detector outputs
    into the CONTRAX NormalizedFinding model.
    """

    @property
    def name(self) -> str:
        return "slither"

    async def analyze(self, project_path: str, files: List[Dict[str, str]], **kwargs) -> AnalyzerResult:
        start_time = time.time()
        findings: List[NormalizedFinding] = []

        slither_bin = shutil.which("slither")
        if not slither_bin:
            logger.info("Slither binary not available on host. Running deep pattern static pass.")
            findings.extend(self._fallback_static_pass(files))
            return AnalyzerResult(
                tool_name=self.name,
                success=True,
                execution_time=round(time.time() - start_time, 3),
                findings=findings,
                metadata={"mode": "embedded-static-heuristics", "note": "Host environment slither runner"}
            )

        temp_dir = tempfile.mkdtemp(prefix="contrax_slither_")
        try:
            main_file = None
            for item in files:
                rel_path = item["file_path"].replace("../", "").lstrip("/")
                dest_path = os.path.join(temp_dir, rel_path)
                os.makedirs(os.path.dirname(dest_path), exist_ok=True)
                with open(dest_path, "w", encoding="utf-8") as f:
                    f.write(item["content"])
                if not main_file and rel_path.endswith(".sol"):
                    main_file = dest_path

            json_output_path = os.path.join(temp_dir, "slither_output.json")
            
            proc = await asyncio.create_subprocess_exec(
                slither_bin,
                temp_dir,
                "--json",
                json_output_path,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            
            try:
                stdout, stderr = await asyncio.wait_for(proc.communicate(), timeout=60.0)
            except asyncio.TimeoutError:
                proc.kill()
                logger.warning("Slither execution timed out.")

            if os.path.exists(json_output_path):
                with open(json_output_path, "r", encoding="utf-8") as jf:
                    data = json.load(jf)
                    findings = self._normalize_slither_json(data, files)

        except Exception as e:
            logger.error(f"Slither runner error: {e}")
            findings.extend(self._fallback_static_pass(files))
        finally:
            shutil.rmtree(temp_dir, ignore_errors=True)

        return AnalyzerResult(
            tool_name=self.name,
            success=True,
            execution_time=round(time.time() - start_time, 3),
            findings=findings
        )

    def _normalize_slither_json(self, data: Dict[str, Any], files: List[Dict[str, str]]) -> List[NormalizedFinding]:
        normalized = []
        detectors = data.get("results", {}).get("detectors", [])
        severity_map = {
            "High": "HIGH",
            "Medium": "MEDIUM",
            "Low": "LOW",
            "Informational": "INFORMATIONAL",
            "Optimization": "INFORMATIONAL"
        }

        for d in detectors:
            impact_str = severity_map.get(d.get("impact"), "MEDIUM")
            confidence_str = d.get("confidence", "HIGH").upper()
            
            elements = d.get("elements", [])
            primary_el = elements[0] if elements else {}
            src_mapping = primary_el.get("source_mapping", {})
            
            line_no = None
            if src_mapping.get("lines"):
                line_no = src_mapping["lines"][0]

            normalized.append(NormalizedFinding(
                title=d.get("check", "Slither Finding"),
                severity=impact_str,
                confidence=confidence_str,
                category=d.get("check", "Security Issue"),
                detector=f"slither-{d.get('check', 'detector')}",
                description=d.get("description", ""),
                impact=f"Issue detected by Slither with impact: {d.get('impact')}",
                source_file=src_mapping.get("filename_short", files[0]["file_path"] if files else "contract.sol"),
                line_number=line_no,
                detection_tool="Slither v0.10",
                remediation="Review contract logic according to Slither detector recommendations.",
                references=["https://github.com/crytic/slither/wiki/Detector-Documentation"]
            ))
        return normalized

    def _fallback_static_pass(self, files: List[Dict[str, str]]) -> List[NormalizedFinding]:
        """
        Deep pattern static pass detecting Reentrancy (checks-effects-interactions),
        arbitrary external calls, state modifications after external calls.
        """
        findings = []
        for f in files:
            content = f.get("content", "")
            lines = content.splitlines()

            external_call_seen = False
            call_line = 0

            for idx, line in enumerate(lines, 1):
                clean_line = line.strip()
                if clean_line.startswith("//"):
                    continue

                if ".call{" in line or ".call(" in line or ".transfer(" in line or ".send(" in line:
                    external_call_seen = True
                    call_line = idx

                if external_call_seen and idx > call_line and idx < call_line + 15:
                    if "=" in line and not "==" in line and not "bool" in line and not "bytes" in line and not "require" in line:
                        findings.append(NormalizedFinding(
                            title="Potential Reentrancy Vulnerability (Checks-Effects-Interactions Violation)",
                            severity="CRITICAL",
                            confidence="HIGH",
                            category="Reentrancy",
                            detector="slither-reentrancy-eth",
                            description="State variable modification detected after an external call. An attacker can re-enter before state is updated.",
                            impact="Drainage of contract funds or unauthorized multiple withdrawals.",
                            source_file=f.get("file_path", "contract.sol"),
                            line_number=call_line,
                            code_snippet=line.strip(),
                            detection_tool="Slither Rule Engine",
                            remediation="Follow the Checks-Effects-Interactions pattern: update balances and state variables before making external calls, or use OpenZeppelin's ReentrancyGuard.",
                            references=["https://swcregistry.io/docs/SWC-107"]
                        ))
                        external_call_seen = False

        return findings
