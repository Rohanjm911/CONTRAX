import re
from typing import Dict, Any, List

RE_PRAGMA = re.compile(r"pragma\s+solidity\s+([^;]+);")
RE_IMPORT = re.compile(r'import\s+["\']([^"\']+)["\'];')
RE_CONTRACT_DEF = re.compile(
    r"(contract|interface|library|abstract\s+contract)\s+([A-Za-z0-9_]+)(?:\s+is\s+([A-Za-z0-9_,\s]+))?\s*\{"
)
RE_STATE_VAR = re.compile(
    r"^\s*(address|uint\d*|int\d*|bool|bytes\d*|string|mapping\s*\([^;]+\))\s+(public|private|internal)?\s*(immutable|constant)?\s*([A-Za-z0-9_]+)\s*(?:=\s*[^;]+)?;",
    re.MULTILINE
)
RE_MODIFIER = re.compile(r"modifier\s+([A-Za-z0-9_]+)\s*\((.*?)\)", re.MULTILINE)
RE_EVENT = re.compile(r"event\s+([A-Za-z0-9_]+)\s*\((.*?)\)\s*;", re.MULTILINE)
RE_FUNC_DEF = re.compile(
    r"(function|constructor|receive|fallback)\s*([A-Za-z0-9_]*)\s*\((.*?)\)\s*([^{;]*)(?:\{|;)",
    re.MULTILINE
)


class SolidityASTParser:
    """
    Parser that inspects Solidity code structure, generating AST-like hierarchies
    of contracts, state variables, modifiers, events, and functions with source ranges.
    """

    def parse_source(self, filename: str, content: str) -> Dict[str, Any]:
        """
        Parses Solidity source code into a structured AST representation.
        """
        ast = {
            "file": filename,
            "contracts": [],
            "pragmas": [],
            "imports": []
        }

        lines = content.splitlines()

        for idx, line in enumerate(lines, 1):
            pragma_match = RE_PRAGMA.search(line)
            if pragma_match:
                ast["pragmas"].append({
                    "version": pragma_match.group(1).strip(),
                    "line": idx
                })

            import_match = RE_IMPORT.search(line)
            if import_match:
                ast["imports"].append({
                    "path": import_match.group(1),
                    "line": idx
                })

        for match in RE_CONTRACT_DEF.finditer(content):
            contract_type = match.group(1).strip()
            contract_name = match.group(2).strip()
            inherits = [i.strip() for i in match.group(3).split(",")] if match.group(3) else []
            start_pos = match.start()
            start_line = content[:start_pos].count("\n") + 1

            contract_body, end_line = self._extract_matching_block(content, match.end() - 1, start_line)

            contract_node = {
                "name": contract_name,
                "type": contract_type,
                "inherits": inherits,
                "startLine": start_line,
                "endLine": end_line,
                "stateVariables": self._parse_state_variables(contract_body, start_line),
                "modifiers": self._parse_modifiers(contract_body, start_line),
                "events": self._parse_events(contract_body, start_line),
                "functions": self._parse_functions(contract_body, start_line)
            }
            ast["contracts"].append(contract_node)

        return ast

    def _extract_matching_block(self, content: str, start_index: int, start_line: int):
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
        block_text = content[start_index:end_idx + 1]
        line_count = block_text.count("\n")
        return block_text, start_line + line_count

    def _parse_state_variables(self, block: str, base_line: int) -> List[Dict[str, Any]]:
        vars_list = []
        for m in RE_STATE_VAR.finditer(block):
            line_offset = block[:m.start()].count("\n")
            vars_list.append({
                "type": m.group(1).strip(),
                "visibility": m.group(2) or "internal",
                "mutability": m.group(3) or "mutable",
                "name": m.group(4).strip(),
                "line": base_line + line_offset
            })
        return vars_list

    def _parse_modifiers(self, block: str, base_line: int) -> List[Dict[str, Any]]:
        mods = []
        for m in RE_MODIFIER.finditer(block):
            line_offset = block[:m.start()].count("\n")
            mods.append({
                "name": m.group(1).strip(),
                "params": m.group(2).strip(),
                "line": base_line + line_offset
            })
        return mods

    def _parse_events(self, block: str, base_line: int) -> List[Dict[str, Any]]:
        events = []
        for m in RE_EVENT.finditer(block):
            line_offset = block[:m.start()].count("\n")
            events.append({
                "name": m.group(1).strip(),
                "params": m.group(2).strip(),
                "line": base_line + line_offset
            })
        return events

    def _parse_functions(self, block: str, base_line: int) -> List[Dict[str, Any]]:
        funcs = []
        for m in RE_FUNC_DEF.finditer(block):
            fn_kind = m.group(1).strip()
            fn_name = m.group(2).strip() or fn_kind
            params = m.group(3).strip()
            attributes = m.group(4).strip()
            line_offset = block[:m.start()].count("\n")
            
            visibility = "public"
            for v in ["public", "external", "internal", "private"]:
                if v in attributes:
                    visibility = v
                    break

            mutability = "nonpayable"
            for mut in ["view", "pure", "payable"]:
                if mut in attributes:
                    mutability = mut
                    break

            funcs.append({
                "name": fn_name,
                "kind": fn_kind,
                "parameters": params,
                "visibility": visibility,
                "mutability": mutability,
                "line": base_line + line_offset
            })
        return funcs
