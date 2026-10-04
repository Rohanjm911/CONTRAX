# CONTRAX System Architecture

> **"See the flaw before they do."**

CONTRAX is designed around a multi-tier, modular microservice architecture engineered for high-throughput smart contract static analysis, symbolic execution, and on-chain verification.

---

## 1. High-Level Topology

```
+--------------------------------------------------------------+
|                    CONTRAX Web Frontend                      |
| (Next.js 14 / TypeScript / Tailwind Dual-Tone / Monaco)       |
+------------------------------+-------------------------------+
                               |  REST / WebSockets
                               v
+--------------------------------------------------------------+
|                   FastAPI API Gateway Layer                  |
| (Authentication, File Ingestion Guard, Project Orchestrator) |
+------------------------------+-------------------------------+
                               |
            +------------------+------------------+
            |                                     |
            v                                     v
+-----------------------+             +-----------------------+
|  PostgreSQL Database  |             |  Redis Message Queue  |
|  (Normalized Models)  |             |  (Async Worker Tasks) |
+-----------------------+             +-----------+-----------+
                                                  |
                    +-----------------------------+-----------------------------+
                    |                             |                             |
                    v                             v                             v
         +--------------------+        +--------------------+        +--------------------+
         | AST & Static Engine|        | Slither Sandbox    |        | Mythril Symbolic   |
         | (Visitor / Rules)  |        | (Crytic Detectors) |        | (EVM Path Finding) |
         +---------+----------+        +---------+----------+        +---------+----------+
                   |                             |                             |
                   +-----------------------------+-----------------------------+
                                                 |
                                                 v
                                  +------------------------------+
                                  | Finding Normalizer & Correlator
                                  +------------------------------+
                                                 |
                                                 v
                                  +------------------------------+
                                  | PDF & JSON Report Generator  |
                                  +------------------------------+
```

---

## 2. Core Subsystems

### A. File Ingestion & Security Gateway
- Strict size limits (`20MB` for raw uploads, `100MB` decompressed memory guard).
- Zip-bomb defense and path traversal (`../`) canonicalization sanitizers.
- Dynamic Solidity compiler pragma extraction (`pragma solidity ^0.8.x`).

### B. Analyzer Subsystem
- **AST Visitor**: Parses abstract syntax trees without needing to compile entire repositories, flagging dangerous low-level calls, `tx.origin` authentication, and deprecated opcodes.
- **Slither Runner**: Wraps Slither detectors in an isolated sandbox runner, normalizing output into standardized `NormalizedFinding` structures.
- **Mythril Symbolic Engine**: Analyzes execution traces to identify unprotected ether flows and reentrancy vectors.
- **Gas & Loop Profiler**: Statically measures storage slots (`SSTORE`), external cross-contract calls, and loop execution bounds.

### C. Finding Normalization & Correlation
- Correlates findings across detectors to prevent duplicate alerts.
- Assigns unified `CRITICAL`, `HIGH`, `MEDIUM`, `LOW`, and `INFORMATIONAL` tiers.
- Maps findings to line numbers and exact source code ranges for direct Monaco editor highlighting.
