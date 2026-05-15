# HospitaliaCare - Hospital Appointment Management System

A full-stack MERN (MongoDB, Express.js, React, Node.js) hospital appointment management system with Material-UI dark theme.

<details>
<summary>Table of Contents</summary>

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Quick Start (Local)](#quick-start-local)
- [Docker Deployment](#docker-deployment)
- [Testing](#testing)
- [Jenkins CI/CD Pipeline](#jenkins-cicd-pipeline)
- [Project Structure](#project-structure)
</details>

## Features

- User Authentication (JWT)
- Role-based Access Control (Admin/User)
- Appointment Booking & Management
- Admin Dashboard with Charts
- Doctor Management
- Dark Theme UI
- Pakistani Phone Number Validation

## Tech Stack

**Frontend:** React 18, Material-UI v5, Recharts, Axios, React Router, Vite  
**Backend:** Node.js, Express.js, MongoDB, Mongoose, JWT, bcrypt, express-validator  
**Testing:** Jest, Supertest, Selenium WebDriver, ChromeDriver  
**DevOps:** Docker, Docker Compose, Jenkins (CI/CD)

## Quick Start (Local)

### Prerequisites
- Node.js (v18+)
- MongoDB (local or Atlas)

### Setup

1. **Clone and install dependencies:**
```bash
cd backend
npm install

cd ../frontend
npm install
```

2. **Configure environment:**
Create `.env` file in `backend/` folder:
```
PORT=5000
MONGO_URI=mongodb://localhost:27017/hospital_appointments
JWT_SECRET=your_secret_key_here
NODE_ENV=development
```

3. **Seed Database:**
```bash
cd backend
node seed.js
```

4. **Run Application:**

Terminal 1 — Backend:
```bash
cd backend
npm run dev
```

Terminal 2 — Frontend:
```bash
cd frontend
npm run dev
```

5. **Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000
- Health Check: http://localhost:5000/health

## Docker Deployment

Three separate Dockerfiles are provided — one per service — plus Docker Compose manifests for both production and testing.

### Prerequisites
- Docker Engine 20.10+
- Docker Compose plugin v2+

### Build and run the production stack

From the project root:

```bash
# Build and start all services (MongoDB + Backend + Frontend)
docker compose -f docker-compose.yml up -d --build --wait

# View running services
docker compose -f docker-compose.yml ps

# View logs (tail: last 50 lines)
docker compose -f docker-compose.yml logs --tail=50

# Stop and remove all containers + volumes
docker compose -f docker-compose.yml down -v
```

### Service overview

| Service      | Build context | Image purpose                               | Port |
|--------------|---------------|----------------------------------------------|------|
| `mongodb`    | —             | `mongo:7-jammy` — persistent data via volume | 27017 |
| `backend`    | `backend/`    | `node:20-alpine` + `dumb-init` + Express app | 5000  |
| `frontend`   | `frontend/`   | Multi-stage: `node:20-alpine` build → `nginx:1.26-alpine` serve | 80 |

### Backend Dockerfile (`backend/Dockerfile`)

Two-stage Alpine build:
- **Builder stage** — `node:20-alpine`, installs only production deps (`npm ci --only=production`).
- **Runtime stage** — `node:20-alpine`, installs `dumb-init` (PID-1 signal handler), copies entire source, exposes port 5000, healthcheck via `GET /health`.

### Frontend Dockerfile (`frontend/Dockerfile`)

Multi-stage build (`syntax=docker/dockerfile:1`):
- **Builder stage** — `node:20-alpine`, installs all deps (including devDeps for Vite), runs `npm run build` → emits static files to `dist/`.
- **Runtime stage** — `nginx:1.26-alpine`, replaces default HTML with the `dist/` output + `nginx.conf`.
- `nginx.conf` proxies `/api/` requests to `http://backend:5000` so the frontend container can reach the backend over the internal Docker network.

### Selenium test Dockerfile (`tests/Dockerfile`)

Debian-based Node image (required for system Chromium + chromedriver):
- Installs full Chrome dependency chain + Chromium + `chromium-driver`.
- Copies test scripts (`tests/`) and builds the frontend for E2E use.
- Patches `selenium-webdriver`'s `chromium.js` to use the system `chromedriver`.
- Entrypoint: `node /e2e/tests/test.js`.

### Environment variables

Production values are injected at compose level — **no .env file on the host is needed** for the stack:

```yaml
# backend service
NODE_ENV: production
PORT: 5000
MONGO_URI: mongodb://mongodb:27017/hospital_appointments
JWT_SECRET: <set via CI credential store>
```

To use your own JWT secret locally:

```bash
export JWT_SECRET="your_secure_secret_here"
docker compose -f docker-compose.yml up -d --build --wait
```

## Testing

### Unit Tests (Jest + Supertest + MongoDB Memory Server)

Run against an ephemeral MongoDB container:

```bash
docker compose -f docker-compose.test.yml up -d --wait
npx jest --forceExit --detectOpenHandles --runInBand --coverage
docker compose -f docker-compose.test.yml down -v
```

`docker-compose.test.yml` starts only `mongo:7-jammy` (tmpfs-backed, auto-scrubbed).  
The test container uses `MongoMemoryServer` internally, so no real Mongo data is ever persisted.

### Selenium E2E Tests

The Selenium test image must be used once the backend and frontend are running on the same Docker network:

```bash
docker run --rm --network host \
  -e FRONTEND_URL=http://localhost:5173 \
  -e BACKEND_URL=http://localhost:5000 \
  hospitalia-selenium-tests:<build-number>
```

Tests performed:
1. **Empty-login validation** — verifies the client rejects a submission with blank credentials.
2. **Valid-login navigation** — logs in with real credentials, confirms redirect to the appointments page.
3. **Appointment creation (API-backed)** — reads the JWT from `localStorage`, calls `POST /api/appointments`, verifies the new row appears in the UI.
4. **Logout** — opens the user menu, clicks logout, confirms redirect back to `/login`.

## Jenkins CI/CD Pipeline

`Jenkinsfile` — declarative pipeline, 4 stages as required by the assignment.

### Required Jenkins plugins

| Plugin               | Purpose                                  |
|----------------------|------------------------------------------|
| Git                  | SCM checkout from GitHub                 |
| Pipeline             | Declarative pipeline engine              |
| Docker Pipeline      | `docker build`, `docker compose` steps   |
| Credentials          | Secure storage for `JWT_SECRET_KEY`      |
| GitHub Branch Source | Webhook-triggered builds (optional)      |

### Jenkins environment variables

| Variable               | Description                        |
|------------------------|------------------------------------|
| `GITHUB_CREDENTIALS`   | Jenkins credential ID for GitHub   |
| `JWT_SECRET_KEY`       | Jenkins Secret Text credential ID  |
| `ECR_REGISTRY`         | (optional) ECR URI for image push  |

### Pipeline stages

```
Checkout  ──►  Code Build  ──►  Unit Testing  ──►  Selenium Testing  ──►  Deployment
```

| Stage                         | Action |
|-------------------------------|--------|
| **1. Checkout**               | `checkout([$class: GitSCM, …])` — pulls code from GitHub using the configured credential. |
| **2. Code Build**             | Runs `npm ci` in `backend/`, `frontend/`, `tests/`; then `docker build` for the backend, frontend, and Selenium-test images. |
| **3. Unit Testing**           | Brings up `test-mongo`, installs dev deps (`jest`, `supertest`, `mongodb-memory-server`), runs `npx jest --coverage`; tears down the test DB on `always`. |
| **4. Selenium Testing**       | `docker run --rm --network host` the Selenium image; drives Chrome against `http://localhost:5173` + `http://localhost:5000`. |
| **5. Deployment**             | `docker compose -f docker-compose.yml down -v` → `docker compose -f docker-compose.yml up -d --build --wait`; prints `ps` and last-50 log lines. |

### GitHub Webhook setup

1. In Jenkins: **Manage Jenkins → Configure System → GitHub** → add your GitHub server (credentials pointing to a GitHub PAT with `repo` scope).
2. On the GitHub repo: **Settings → Webhooks → Add webhook**
   - **Payload URL:** `http://<JENKINS_IP>:8080/github-webhook/`
   - **Content type:** `application/json`
   - **Events:** `Just the push event`
   - **Secret:** (match your GitHub webhook secret in Jenkins if configured)
3. On every push to `main`, Jenkins automatically starts the pipeline.

### Running on AWS EC2

1. Launch an Ubuntu EC2 instance (t3.small or larger, port 8080 + 80 open in the security group).
2. Install Docker & Docker Compose:
   ```bash
   curl -fsSL https://get.docker.com | sh
   usermod -aG docker ubuntu
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```
3. Install Jenkins: follow the [official apt-based install guide](https://www.jenkins.io/doc/book/installing/linux/#debianubuntu).
4. In Jenkins, add the **Docker Pipeline** and **Git** plugins, then create a Pipeline job pointing at your GitHub repo and the `Jenkinsfile`.

## Project Structure

```
HospitaliaCare/
├── backend/
│   ├── config/
│   │   └── db.js              # Mongoose connection helper
│   ├── middleware/
│   │   ├── admin.js           # Admin-only route guard
│   │   └── auth.js            # JWT bearer-token authentication
│   ├── models/
│   │   ├── User.js            # Mongoose schema + bcrypt helpers
│   │   ├── Doctor.js          # Doctor schema
│   │   └── Appointment.js     # Appointment schema
│   ├── routes/
│   │   ├── auth.js            # Auth endpoints
│   │   ├── appointments.js    # Appointment CRUD
│   │   ├── doctors.js         # Doctor management
│   │   └── admin.js           # Admin dashboard & user management
│   ├── Dockerfile             # Backend container (Node.js Alpine)
│   ├── .dockerignore          # Excludes node_modules, .env, tests, etc.
│   ├── seed.js                # Database seeder script
│   ├── server.js              # Express app entrypoint
│   ├── package.json
│   └── .env                   # Local dev env (git-ignored)
├── frontend/
│   ├── src/
│   │   ├── components/        # Navbar, route guards
│   │   ├── context/           # AuthContext
│   │   ├── pages/             # Login, Register, Appointments, Admin
│   │   ├── services/          # Axios API client
│   │   └── theme/             # MUI dark theme
│   ├── public/
│   ├── Dockerfile             # Multi-stage: Vite build → Nginx serve
│   ├── .dockerignore          # Excludes node_modules, .env, dist, etc.
│   ├── nginx.conf             # Nginx SPA + /api/ reverse proxy
│   ├── vite.config.js
│   └── package.json
├── tests/
│   ├── test.js                # Selenium E2E test script
│   ├── app.test.js            # Jest unit tests (alternative copy)
│   ├── Dockerfile             # Tests image (Debian + Chrome + chromedriver)
│   └── package.json           # selenium-webdriver dependency
├── docker-compose.yml         # Production stack (MongoDB + Backend + Frontend)
├── docker-compose.test.yml    # Unit-test stack (ephemeral Mongo + Jest runner)
├── Jenkinsfile                # Declarative 5-stage CI/CD pipeline
├── .gitignore
└── README.md
```
