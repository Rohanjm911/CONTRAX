# CONTRAX Deployment Guide

---

## 1. Production Docker Compose Deployment

The recommended production deployment topology uses Docker Compose with isolated networks:

```bash
docker compose up -d --build
```

### Resource Allocation Limits
Set memory and CPU limits in `docker-compose.yml` for analyzer containers:
```yaml
deploy:
  resources:
    limits:
      cpus: '2.0'
      memory: 2048M
```

---

## 2. Reverse Proxy (Nginx) Configuration

Sample Nginx block forwarding traffic to Next.js frontend (port 3000) and FastAPI backend (port 8000):

```nginx
server {
    listen 80;
    server_name contrax.yourdomain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Backend API & WebSockets
    location /api/ {
        proxy_pass http://localhost:8000/api/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }
}
```

---

## 3. Database Migration with Alembic

When updating database models:

```bash
cd backend
alembic revision --autogenerate -m "schema update"
alembic upgrade head
```

---

## 4. Health Checks

- Backend Health: `GET http://localhost:8000/`
- API Docs: `GET http://localhost:8000/docs`
- Frontend: `GET http://localhost:3000/`
