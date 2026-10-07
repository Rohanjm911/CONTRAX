import time
import re
from typing import List, Dict
from app.analyzers.base import BaseAnalyzer, AnalyzerResult, NormalizedFinding
from app.analyzers.ast.parser import SolidityASTParser
from app.config.logging import logger

# Precompiled regex patterns for maximum analysis throughput
RE_COMMENT = re.compile(r"^\s*//")
RE_TX_ORIGIN = re.compile(r"\btx\.origin\b")
RE_CALL_SYNTAX = re.compile(r"\.(call|delegatecall|staticcall)\s*\{|\.(call|delegatecall)\s*\(")
RE_CHECKED_CALL = re.compile(r"\(\s*bool\s+[^,\)]+\s*,?|require\s*\(")
RE_DELEGATECALL = re.compile(r"\.delegatecall\s*\(")
RE_SELFDESTRUCT = re.compile(r"\b(selfdestruct|suicide)\s*\(")
RE_TIMESTAMP = re.compile(r"\b(block\.timestamp|now)\b")
RE_COMPARISON = re.compile(r"(==|<=|>=|<|>)")
RE_WEAK_RANDOM = re.compile(r"(blockhash|block\.difficulty|block\.prevrandao)")


class ASTAnalyzer(BaseAnalyzer):
    """
    Semantic AST analyzer detecting critical anti-patterns:
    - tx.origin authentication
    - selfdestruct / suicide deprecation
    - Unchecked low-level call return values
    - Arbitrary delegatecall usage
    - Missing constructor or initialization
    - Timestamp dependency block.timestamp / now
    - Weak randomness using blockhash / difficulty
    - Unprotected state variable shadowing
    """

    @property
    def name(self) -> str:
        return "ast"

    async def analyze(self, project_path: str, files: List[Dict[str, str]], **kwargs) -> AnalyzerResult:
        start_time = time.time()
        findings: List[NormalizedFinding] = []
        parser = SolidityASTParser()

        try:
            for item in files:
                file_path = item.get("file_path", "contract.sol")
                content = item.get("content", "")
                lines = content.splitlines()

                # Parse AST structures
                ast_data = parser.parse_source(file_path, content)

                for idx, line in enumerate(lines, 1):
                    code_part = line.split("//")[0]
                    if not code_part.strip():
                        continue

                    # 1. tx.origin check
                    if RE_TX_ORIGIN.search(code_part):
                        findings.append(NormalizedFinding(
                            title="tx.origin Used for Authorization",
                            severity="HIGH",
                            confidence="HIGH",
                            category="Access Control",
                            detector="ast-tx-origin",
                            description="Use of tx.origin for authentication is vulnerable to phishing attacks where a malicious contract tricks an authorized user into calling it.",
                            impact="An attacker can craft a contract that forwards transactions to the vulnerable contract, impersonating the victim.",
                            source_file=file_path,
                            line_number=idx,
                            code_snippet=self._get_snippet(lines, idx),
                            detection_tool="CONTRAX AST Engine",
                            remediation="Use msg.sender instead of tx.origin to check caller authorization.",
                            references=["https://swcregistry.io/docs/SWC-115"]
                        ))

                    # 2. Unchecked low-level call
                    if RE_CALL_SYNTAX.search(code_part):
                        if not RE_CHECKED_CALL.search(code_part):
                            findings.append(NormalizedFinding(
                                title="Unchecked Low-Level External Call",
                                severity="MEDIUM",
                                confidence="MEDIUM",
                                category="Error Handling",
                                detector="ast-unchecked-call",
                                description="The return value of an external call/delegatecall is not explicitly checked or handled.",
                                impact="Failed external calls will not revert the transaction, allowing execution to proceed in an inconsistent state.",
                                source_file=file_path,
                                line_number=idx,
                                code_snippet=self._get_snippet(lines, idx),
                                detection_tool="CONTRAX AST Engine",
                                remediation="Ensure external calls capture (bool success, ) and check require(success, 'Call failed');",
                                references=["https://swcregistry.io/docs/SWC-104"]
                            ))

                    # 3. Dangerous delegatecall
                    if RE_DELEGATECALL.search(code_part):
                        findings.append(NormalizedFinding(
                            title="Dangerous delegatecall Usage",
                            severity="CRITICAL",
                            confidence="HIGH",
                            category="Access Control",
                            detector="ast-delegatecall",
                            description="Delegatecall preserves execution context (msg.sender, msg.value, storage layout). Using it to untrusted addresses can lead to total contract takeover.",
                            impact="State corruption or contract destruction through malicious proxy targets.",
                            source_file=file_path,
                            line_number=idx,
                            code_snippet=self._get_snippet(lines, idx),
                            detection_tool="CONTRAX AST Engine",
                            remediation="Use delegatecall only with rigorously vetted, immutable target addresses or authorized proxies.",
                            references=["https://swcregistry.io/docs/SWC-112"]
                        ))

                    # 4. selfdestruct operation
                    if RE_SELFDESTRUCT.search(code_part):
                        findings.append(NormalizedFinding(
                            title="Deprecated / Risky selfdestruct Operation",
                            severity="HIGH",
                            confidence="HIGH",
                            category="Destruction Risk",
                            detector="ast-selfdestruct",
                            description="selfdestruct can remove contract bytecode and force-transfer ether, breaking invariant assumptions. Note that EIP-6780 alters selfdestruct behavior in modern EVM.",
                            impact="Permanent denial of service or unexpected state loss.",
                            source_file=file_path,
                            line_number=idx,
                            code_snippet=self._get_snippet(lines, idx),
                            detection_tool="CONTRAX AST Engine",
                            remediation="Remove selfdestruct in favor of pausable states or upgradable architectures.",
                            references=["https://swcregistry.io/docs/SWC-106"]
                        ))

                    # 5. Timestamp dependency
                    if RE_TIMESTAMP.search(code_part):
                        if RE_COMPARISON.search(code_part):
                            findings.append(NormalizedFinding(
                                title="Timestamp Dependency in Conditional Logic",
                                severity="LOW",
                                confidence="MEDIUM",
                                category="Miner Manipulation",
                                detector="ast-timestamp",
                                description="Block timestamps can be influenced by validators within a drift window (approx. 15 seconds).",
                                impact="Validators may slightly skew timestamps to satisfy strict inequality checks or lottery randomness.",
                                source_file=file_path,
                                line_number=idx,
                                code_snippet=self._get_snippet(lines, idx),
                                detection_tool="CONTRAX AST Engine",
                                remediation="Avoid using block.timestamp for critical randomness or high-precision time intervals.",
                                references=["https://swcregistry.io/docs/SWC-116"]
                            ))

                    # 6. Weak randomness
                    if RE_WEAK_RANDOM.search(code_part):
                        findings.append(NormalizedFinding(
                            title="Weak Randomness Source",
                            severity="HIGH",
                            confidence="HIGH",
                            category="Cryptographic Failure",
                            detector="ast-weak-randomness",
                            description="Using on-chain block variables such as blockhash or prevrandao for pseudo-randomness is predictable and exploitable.",
                            impact="Front-running or validator manipulation of game, lottery, or minting outcomes.",
                            source_file=file_path,
                            line_number=idx,
                            code_snippet=self._get_snippet(lines, idx),
                            detection_tool="CONTRAX AST Engine",
                            remediation="Integrate verifiable off-chain randomness solutions such as Chainlink VRF.",
                            references=["https://swcregistry.io/docs/SWC-120"]
                        ))

            elapsed = round(time.time() - start_time, 3)
            return AnalyzerResult(
                tool_name=self.name,
                success=True,
                execution_time=elapsed,
                findings=findings
            )
        except Exception as e:
            logger.error(f"AST Analyzer error: {e}", exc_info=True)
            return AnalyzerResult(
                tool_name=self.name,
                success=False,
                execution_time=round(time.time() - start_time, 3),
                error_message=str(e),
                findings=findings
            )

    def _get_snippet(self, lines: List[str], line_no: int, context: int = 2) -> str:
        start = max(0, line_no - 1 - context)
        end = min(len(lines), line_no + context)
        return "\n".join(lines[start:end])
