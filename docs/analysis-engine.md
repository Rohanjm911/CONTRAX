# CONTRAX Analysis Engine Specification

> **Tagline:** *"See the flaw before they do."*

The CONTRAX Analysis Engine combines three complementary analysis approaches:

---

## 1. Solidity AST Visitor Engine (`app/analyzers/ast/`)

Unlike conventional compilers that reject code when dependencies or imports are missing, the CONTRAX AST Visitor operates directly on raw or partial Solidity source codes:
- **Contract / Interface Extraction**: Maps contract declaration blocks and base inheritance chains.
- **State Variable Hierarchy**: Identifies visibility, mutability (`constant`, `immutable`), and data types.
- **Detector Passes**:
  - `ast-tx-origin`: Flags `tx.origin` used in authorization blocks (SWC-115).
  - `ast-unchecked-call`: Identifies low-level external calls without return value validation (SWC-104).
  - `ast-delegatecall`: Detects arbitrary `delegatecall` usages vulnerable to proxy takeovers (SWC-112).
  - `ast-selfdestruct`: Flags usage of deprecated `selfdestruct` / `suicide` opcodes (SWC-106).
  - `ast-timestamp`: Detects critical state dependency on `block.timestamp` (SWC-116).
  - `ast-weak-randomness`: Warns against predictable block variables for random seeds (SWC-120).

---

## 2. Slither Integration & Sandbox Runner (`app/analyzers/slither/`)

Slither is the industry-standard static analyzer created by Trail of Bits:
- Runs in an isolated temporary container or directory.
- Captures Slither JSON detector output and maps impacts:
  - `High` -> `HIGH`
  - `Medium` -> `MEDIUM`
  - `Low` -> `LOW`
  - `Informational` -> `INFORMATIONAL`
- Normalizes source location mappings to file paths, starting lines, and code snippets.
- Includes embedded fallback heuristics for reentrancy violations (checks-effects-interactions violations) when running in lightweight environments without the full Slither binary.

---

## 3. Mythril Symbolic Execution Engine (`app/analyzers/mythril/`)

Mythril uses concolic analysis and taint analysis on EVM bytecode to uncover deep reachable paths:
- Tests for unrestricted ether flow (SWC-105).
- Identifies integer arithmetic anomalies and uninitialized storage pointers.

---

## 4. EVM Gas & Efficiency Profiler (`app/analyzers/gas/`)

Statically analyzes function blocks for high-gas operations:
- `SSTORE` storage writes (5,000 - 20,000 gas).
- External calls to other addresses (2,600 gas base).
- For / while loops over dynamic arrays (warning for potential block gas limit denial-of-service).
- Always explicitly labels reliability as `ESTIMATED`, `SIMULATED`, `OBSERVED`, or `UNAVAILABLE` without fabricating data.
