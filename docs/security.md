# CONTRAX Security Model & Threat Assessment

---

## 1. Threat Profile: Untrusted Smart Contract Inputs

Smart contract source code uploaded by users must be treated as **hostile and untrusted**. Attacks targeting audit platforms often include:

1. **ZIP Bomb / Decompression Attacks**: Archives designed to decompress into hundreds of gigabytes, exhausting disk space.
2. **Directory Traversal (Zip Slip)**: Filenames like `../../../../etc/shadow` attempting to overwrite system binaries.
3. **Malicious Dependency Scripts**: Malicious `npm postinstall` or `hardhat.config.js` scripts executing arbitrary shell commands upon build.
4. **Denial of Service via Symbolic Timeouts**: Contracts specifically designed to create infinite symbolic execution trees in Mythril.

---

## 2. Sandboxing & Isolation Guarantees

CONTRAX implements multi-layered isolation:

- **No Arbitrary Script Execution**: CONTRAX does **NOT** run user-supplied `npm run build`, `make`, or build scripts on the host. Analysis is performed purely through AST tokenization, AST visitor traversals, and containerized Slither/Mythril invocations.
- **Decompression Quotas**: Maximum upload size is strictly capped at `20MB`, with a strict extraction limit of `100MB` and 250 files maximum. Any archive violating these bounds is immediately aborted.
- **Isolated Network Policy**: Dedicated analysis containers run with network interfaces disabled (`--network none`) to prevent exfiltration of internal keys or SSRF attacks against internal infrastructure.
- **Timeout Caps**: Hard timeout limit of 300 seconds enforced across all analyzer subprocesses.

---

## 3. Credential & Data Protection

- Passwords hashed using bcrypt / Argon2.
- JWT tokens signed with HS256 and configurable secret rotation.
- Internal databases (PostgreSQL, Redis) are isolated within internal Docker virtual networks without exposing ports to public interfaces.
- Explorer API keys and RPC secrets are kept strictly server-side and never forwarded to client browsers.
