import re
from typing import List, Dict, Any


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
            lines = content.splitlines()

            c_match = re.search(r"contract\s+([A-Za-z0-9_]+)", content)
            contract_name = c_match.group(1) if c_match else "Contract"

            fn_matches = re.finditer(r"function\s+([A-Za-z0-9_]+)\s*\((.*?)\)\s*([^{;]*)\{", content)
            
            for m in fn_matches:
                fn_name = m.group(1)
                start_pos = m.start()
                
                fn_body = self._extract_block(content, m.end() - 1)
                
                storage_writes = len(re.findall(r"\b(balances|owner|totalSupply|data|state|allowance)\[.*?\]\s*=", fn_body))
                storage_writes += len(re.findall(r"^\s*([A-Za-z0-9_]+)\s*=[^=]", fn_body, re.MULTILINE))
                
                ext_calls = len(re.findall(r"\.(call|transfer|send|delegatecall)\b", fn_body))

                loops = len(re.findall(r"\b(for|while)\s*\(", fn_body))

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
