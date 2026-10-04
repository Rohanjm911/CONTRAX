# CONTRAX REST API Reference

All API routes are prefixed under `/api/v1`.

Interactive Swagger UI documentation is available at `http://localhost:8000/docs`.

---

## 1. Authentication (`/api/v1/auth`)

### `POST /auth/register`
Creates a new auditor account.
```json
{
  "email": "auditor@firm.com",
  "username": "lead_auditor",
  "password": "StrongPassword123!",
  "full_name": "Senior Researcher"
}
```

### `POST /auth/login`
Authenticates credentials and returns JWT bearer token.
```json
{
  "username": "lead_auditor",
  "password": "StrongPassword123!"
}
```

### `GET /auth/me`
Retrieves current profile details (Requires `Authorization: Bearer <token>`).

---

## 2. Projects (`/api/v1/projects`)

### `GET /projects`
Lists all audit project workspaces owned by the user.

### `POST /projects`
Creates a new project.
```json
{
  "name": "DeFi Protocol Audit v2",
  "description": "Smart contract vulnerability analysis for lending protocol"
}
```

### `GET /projects/{id}`
Retrieves project details and associated contracts.

### `DELETE /projects/{id}`
Deletes project and cascades deletions to contracts and scans.

---

## 3. Contracts (`/api/v1/contracts`)

### `POST /contracts/upload` (Multipart Form)
- `project_id`: Target project UUID
- `file`: `.sol` or `.zip` file

### `POST /contracts/import-onchain` (Form Data)
- `project_id`: Target project UUID
- `address`: `0x...` 40-hex-character EVM address
- `network`: `ethereum`, `sepolia`, `polygon`, `arbitrum`, `optimism`, `base`

### `GET /contracts/{id}`
Returns contract record and associated source files.

### `GET /contracts/{id}/ast`
Returns parsed AST tree for interactive AST visualizer.

---

## 4. Scans & Findings (`/api/v1/scans`)

### `POST /scans` (202 Accepted)
Dispatches background vulnerability scan.
```json
{
  "contract_id": "9935fe7a-8b83-4a1f-b5dc-d6eeeb3971c2",
  "scan_type": "SOURCE_CODE"
}
```

### `GET /scans/{id}/status`
Returns real-time progress percentage, stage breakdown, and vulnerability counter breakdown.

### `GET /scans/{id}/findings`
Returns list of normalized security findings.

### `GET /findings/{id}`
Returns complete finding details, impact, and remediation steps.

### `PATCH /findings/{id}/review?status_label=CONFIRMED`
Tags finding as `CONFIRMED` or `FALSE_POSITIVE`.

---

## 5. Gas & Reports (`/api/v1/gas`, `/api/v1/reports`)

### `GET /gas/scan/{scan_id}`
Returns function gas estimation records (SSTORE writes, calls, loops).

### `GET /reports/scan/{scan_id}`
Returns structured audit report in JSON format.

### `GET /reports/scan/{scan_id}/download-pdf`
Streams generated PDF audit report file.
