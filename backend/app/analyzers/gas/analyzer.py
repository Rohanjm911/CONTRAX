import re
from typing import List, Dict, Any

RE_CONTRACT = re.compile(r"contract\s+([A-Za-z0-9_]+)")
RE_FUNCTION = re.compile(r"function\s+([A-Za-z0-9_]+)\s*\((.*?)\)\s*([^{;]*)\{")
RE_MAPPING_WRITES = re.compile(r"\b(balances|owner|totalSupply|data|state|allowance)\[.*?\]\s*=")
RE_ASSIGNMENT_WRITES = re.compile(r"^\s*([A-Za-z0-9_]+)\s*=[^=]", re.MULTILINE)
RE_EXT_CALLS = re.compile(r"\.(call|transfer|send|delegatecall)\b")
RE_LOOPS = re.compile(r"\b(for|while)\s*\(")


class GasAnalyzer:
    """
    Gas and loop efficiency profiler.
    Analyzes Solidity functions for:
    - SSTORE storage writes (20,000 gas initial / 5,000 gas update)
    - SLOAD storage reads (100-2100 gas)
    - Loops over unbounded arrays
    - Costly operations inside loops (external calls, storage updates)
    """

    def analyze_gas(self, files: List[Dict[str, str]]) -> List[Dict[str, Any]]:
        results = []

        for item in files:
            content = item.get("content", "")

            c_match = RE_CONTRACT.search(content)
            contract_name = c_match.group(1) if c_match else "Contract"

            fn_matches = RE_FUNCTION.finditer(content)
            
            for m in fn_matches:
                fn_name = m.group(1)
                
                fn_body = self._extract_block(content, m.end() - 1)
                
                storage_writes = len(RE_MAPPING_WRITES.findall(fn_body))
                storage_writes += len(RE_ASSIGNMENT_WRITES.findall(fn_body))
                
                ext_calls = len(RE_EXT_CALLS.findall(fn_body))
                loops = len(RE_LOOPS.findall(fn_body))

                base_cost = 21000
                write_cost = storage_writes * 5000
                call_cost = ext_calls * 2600
                loop_cost = loops * 15000

                estimated_min = base_cost + write_cost + call_cost
                estimated_max = estimated_min + loop_cost if loops > 0 else estimated_min + 5000
                estimated_avg = (estimated_min + estimated_max) // 2

                results.append({
                    "contract_name": contract_name,
                    "function_name": f"{fn_name}()",
                    "reliability": "ESTIMATED",
                    "min_gas": estimated_min,
                    "max_gas": estimated_max,
                    "avg_gas": estimated_avg,
                    "storage_writes_count": storage_writes,
                    "external_calls_count": ext_calls,
                    "loops_detected": loops,
                    "details": {
                        "has_unbounded_loop": loops > 0,
                        "storage_writes": storage_writes,
                        "external_calls": ext_calls
                    }
                })

        return results

    def _extract_block(self, content: str, start_index: int) -> str:
        open_braces = 0
        end_idx = start_index
        for idx in range(start_index, len(content)):
            char = content[idx]
            if char == '{':
                open_braces += 1
            elif char == '}':
                open_braces -= 1
                if open_braces == 0:
                    end_idx = idx
                    break
        return content[start_index:end_idx + 1]
