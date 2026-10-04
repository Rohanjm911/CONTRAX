# CONTRAX - How To Run Guide

> **"See the flaw before they do."**  
> Complete local, one-click, Docker, and hybrid deployment instructions for the CONTRAX platform.

---

## ⚡ Quickstart: One-Click Launch (Windows)

For instant local execution without manually launching multiple terminals:

1. **Start the Platform:** Double-click [`start_contrax.bat`](file:///d:/projects%20and%20certificates/projects/block/Contrax/start_contrax.bat) (or run `./start_contrax.bat` from terminal).
   - Automatically verifies Python 3.10+ and Node.js.
   - Spawns the FastAPI backend daemon on `http://127.0.0.1:8000`.
   - Spawns the Next.js frontend dev server on `http://localhost:3000`.
   - Automatically opens your default web browser to the CONTRAX Security Console.
2. **Stop the Platform:** Double-click [`stop_contrax.bat`](file:///d:/projects%20and%20certificates/projects/block/Contrax/stop_contrax.bat) to terminate backend and frontend processes cleanly.

---

## 📋 Prerequisites

Before running CONTRAX manually or on Linux/macOS, ensure you have the following installed:

1. **Python**: `3.10+` (tested on Python 3.11, 3.12, 3.14)
2. **Node.js**: `v18.0.0+` (v20+ or v24+ LTS recommended) and `npm`
3. **Database**: SQLite (default lightweight local mode) or PostgreSQL 14+
4. **Queue**: Redis (optional; in-memory asynchronous execution is enabled by default)
5. **Docker** *(Optional, for containerized multi-container topology)*

---

## ⚙️ Step 1: Environment Configuration

Copy the example environment file in the project root:

```bash
cp .env.example .env
```

Key environment configurations in `.env`:

```env
# Application
ENVIRONMENT=development
DEBUG=True
SECRET_KEY=contrax-super-secret-development-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Database & Cache
# Lightweight SQLite for standalone offline execution (Default):
DATABASE_URL=sqlite+aiosqlite:///./contrax.db
# Or PostgreSQL for team deployments:
# DATABASE_URL=postgresql+asyncpg://postgres:postgres@localhost:5432/contrax_db

# Sandbox Security Controls
MAX_UPLOAD_SIZE=20971520      # 20 MB
SCAN_TIMEOUT=300             # 5 minutes
```

---

## 🐍 Step 2: Running the Backend Manually (FastAPI)

1. Open a terminal in the `backend` directory:
   ```bash
   cd backend
   ```

2. Create and activate a Python virtual environment:
   - **Windows (PowerShell):**
     ```powershell
     python -m venv venv
     .\venv\Scripts\activate
     ```
   - **Linux / macOS:**
     ```bash
     python3 -m venv venv
     source venv/bin/activate
     ```

3. Install backend dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Initialize the database schema:
   ```bash
   python -m app.db.init_db
   ```

5. Start the FastAPI development server:
   ```bash
   python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
   ```

6. Interactive API documentation:
   - Swagger UI: `http://127.0.0.1:8000/docs`
   - ReDoc: `http://127.0.0.1:8000/redoc`
   - OpenAPI Schema: `http://127.0.0.1:8000/openapi.json`

---

## 💻 Step 3: Running the Frontend Manually (Next.js)

1. Open a new terminal in the `frontend` directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the Next.js dev server:
   ```bash
   npm run dev
   ```

4. Open your browser:
   - Access CONTRAX Security Console at `http://localhost:3000`

---

## 🐳 Step 4: Running with Docker Compose (Full Stack)

To launch the full production topology (Postgres, Redis, Backend, Worker, Frontend, and Nginx):

```bash
docker compose up --build -d
```

Check service status:
```bash
docker compose ps
docker compose logs -f
```

---

## 🧪 Step 5: Running Tests

To verify test suites across AST parsing, security detectors, analyzer normalization, and API endpoints:

```bash
cd backend
pytest tests/unit/ -v
```

All 6 core analyzer unit tests will execute and confirm pipeline integrity.

---

## 🛑 Troubleshooting

- **Port Conflicts**: If port 8000 or 3000 is occupied, execute [`stop_contrax.bat`](file:///d:/projects%20and%20certificates/projects/block/Contrax/stop_contrax.bat) or run `netstat -ano | findstr :8000` to locate and terminate the process.
- **Python 3.14 Compatibility**: CONTRAX uses standard library PBKDF2-HMAC-SHA256 for cryptographic password hashing, eliminating passlib/bcrypt incompatibility bugs on modern Python versions.
- **CORS Configuration**: Ensure `ALLOWED_ORIGINS` in `.env` includes `http://localhost:3000`.
- **Database Fallback**: CONTRAX uses async SQLite `contrax.db` by default so no external database installation or setup is needed to start analyzing contracts immediately.
