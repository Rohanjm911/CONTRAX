# CONTRAX - Packages, Dependencies & Recommended Extensions

> **"See the flaw before they do."**  
> Complete catalog of all runtime packages, development dependencies, system binaries, and editor extensions required or recommended for CONTRAX.

---

## ⚡ One-Click Startup Scripts (Root Directory)

| Script | Purpose | Operating System |
| :--- | :--- | :--- |
| [`start_contrax.bat`](file:///d:/projects%20and%20certificates/projects/block/Contrax/start_contrax.bat) | One-click environment check, FastAPI daemon spawn, Next.js dev server spawn, and automatic browser launch (`http://localhost:3000`) | Windows (cmd/pwsh) |
| [`stop_contrax.bat`](file:///d:/projects%20and%20certificates/projects/block/Contrax/stop_contrax.bat) | Clean one-click process termination for ports 8000 (Backend) and 3000 (Frontend) | Windows (cmd/pwsh) |

---

## 🐍 Backend Python Packages (`backend/requirements.txt`)

### Core Framework & API
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `fastapi` | `>=0.110.0` | High-performance async web framework for REST & WebSocket endpoints |
| `uvicorn[standard]` | `>=0.29.0` | ASGI server implementation with uvloop and httptools |
| `pydantic` | `>=2.6.0` | Robust data parsing, schema validation, and finding structures |
| `pydantic-settings`| `>=2.2.0` | Environment settings and secret management |
| `python-multipart` | `>=0.0.9` | Secure file upload and streaming form data ingestion |

### Database & ORM
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `sqlalchemy[asyncio]` | `>=2.0.28` | Async ORM and database abstraction layer |
| `aiosqlite` | `>=0.20.0` | Async SQLite driver for zero-dependency standalone local runs (Default) |
| `asyncpg` | `>=0.29.0` | High-speed async driver for PostgreSQL |
| `alembic` | `>=1.13.1` | Database migration engine |
| `greenlet` | `>=3.0.3` | Coroutine engine required by SQLAlchemy asyncio |

### Security & Cryptographic Hashing
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `hashlib` (Standard Library) | Built-in | PBKDF2-HMAC-SHA256 password hashing (100% compatible across Python 3.10 through 3.14) |
| `python-jose[cryptography]` | `>=3.3.0` | JWT encoding, decoding, token validation |
| `passlib` | Optional | Legacy password hashing adapter |

### Background Tasks & Queues
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `asyncio` (Standard Library) | Built-in | In-memory non-blocking asynchronous pipeline runner (Zero-dependency local execution) |
| `redis` | `>=5.0.3` | Async Redis client for distributed cache and state |
| `celery` | `>=5.3.6` | Distributed asynchronous task queue for multi-worker deployments |

### Web3 & Blockchain
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `web3` | `>=6.16.0` | Ethereum & EVM RPC interaction, bytecode retrieval, ABI decode |
| `eth-utils` | `>=2.3.1` | Ethereum utility functions (address checksums, hex parsing) |
| `httpx` | `>=0.27.0` | Async HTTP client for Block Explorer APIs (Etherscan, Arbiscan) |

### Smart Contract & Static Analysis
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `py-solc-x` | `>=2.0.2` | Solidity compiler version management and AST generation |
| `slither-analyzer` | `>=0.10.1` | Static analysis framework for Solidity detectors |
| `mythril` | Optional | Symbolic execution engine for EVM bytecode security |

### Report Generation & Utilities
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `reportlab` | `>=4.1.0` | Programmatic PDF report generation (Dual-tone audit documents) |
| `jinja2` | `>=3.1.3` | Templating engine for audit reports |

### Testing & Code Quality
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `pytest` | `>=8.1.0` | Test runner for test suites |
| `pytest-asyncio` | `>=0.23.5`| Async test fixture support |
| `httpx` | `>=0.27.0` | Async test client for FastAPI routes |

---

## 💻 Frontend Dependencies (`frontend/package.json`)

### Core Runtime
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `next` | `^14.2.0` | React framework with App Router, SSR, and API routes |
| `react` | `^18.3.0` | UI component library |
| `react-dom` | `^18.3.0` | React DOM renderer |

### UI, Code Editor & Interactive Visualizations
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `@monaco-editor/react` | `^4.6.0` | Monaco Editor for interactive Solidity source inspection |
| `monaco-editor` | `^0.47.0` | Underlying VS Code editor engine |
| `lucide-react` | `^0.363.0`| Apple-inspired minimalist UI icon set |
| `tailwind-merge` | `^2.2.2` | Safe class utility merge |
| `clsx` | `^2.1.0` | Conditional CSS class composer |

### Development Dependencies
| Package | Version | Purpose |
| :--- | :--- | :--- |
| `typescript` | `^5.4.0` | Static typing system |
| `@types/node` | `^20.11.0` | Node.js type definitions |
| `@types/react` | `^18.3.0` | React type definitions |
| `tailwindcss` | `^3.4.1` | Utility-first CSS configured for Midnight Navy theme |
| `postcss` | `^8.4.38` | CSS processor |
| `autoprefixer`| `^10.4.19`| CSS vendor prefixer |

---

## 🧩 Recommended VS Code / Cursor Extensions

1. **Python (`ms-python.python`)**: IntelliSense, syntax highlighting, and debugging for Python backend.
2. **Pylance (`ms-python.vscode-pylance`)**: Fast, rich type checking for Python.
3. **Solidity (`JuanBlanco.solidity`)** or **Nomic Foundation Solidity (`NomicFoundation.hardhat-solidity`)**: Solidity language support, syntax highlighting, and compiler validation.
4. **Tailwind CSS IntelliSense (`bradlc.vscode-tailwindcss`)**: Autocomplete and hover linting for CSS classes.
5. **ESLint (`dbaeumer.vscode-eslint`)**: Code quality and linting for Next.js / TypeScript.
6. **Prettier - Code Formatter (`esbenp.prettier-vscode`)**: Consistent code formatting across frontend files.
7. **Docker (`ms-azuretools.vscode-docker`)**: Dockerfile and docker-compose management.
8. **Thunder Client (`rangav.vscode-thunder-client`)** or **Postman**: In-IDE API testing for FastAPI routes.
