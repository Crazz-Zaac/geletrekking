# 🏔️ GeleTrekking – Docker Setup Guide

This guide explains how to run the **GeleTrekking** project using **Docker** (no need to install Node.js or MongoDB locally).

---

## 🧩 Prerequisites

Make sure the following are installed on your system:

- [Docker](https://www.docker.com/get-started)  
- [Git](https://git-scm.com/downloads)

You **do not need** to manually install Node.js, MongoDB, or npm anymore — Docker handles that for you.

---

## 🚀 Clone the Repository

```bash
git clone https://github.com/Crazz-Zaac/geletrekking.git
cd geletrekking
```

---

## 🐳 Run the Project with Docker

All services (backend, frontend, MongoDB) are managed using **Docker Compose**.

1. Build and start containers:

```bash
docker compose -f docker/docker-compose.yml up --build
```

2. Once everything is running:

   - **Frontend:** [http://localhost:3000](http://localhost:3000)  
   - **Backend:** [http://localhost:5000](http://localhost:5000)  
   - **MongoDB:** `mongodb://admin:admin123@localhost:27017/`

---

## ⚙️ Environment Configuration

Create a `.env` file inside the `backend/` folder with the following values:

```env
PORT=5000
MONGO_URI=mongodb://admin:admin123@mongo:27017/geletrekking
JWT_SECRET=your_jwt_secret_key
```

> Note:  
> Use `mongo` (the Docker container name) instead of `localhost` inside Docker.

---

## 🔑 Frontend Environment Setup

Create a `.env.local` file inside the `frontend/` folder:

```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=416465718761-k6esa7bds8i96cdhssqa916p8l39m70f.apps.googleusercontent.com
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000
```

---
## 🔑 Superadmin Access

When you first run the backend, a default **superadmin** account is automatically seeded.

| Role | Email | Password |
|------|--------|-----------|
| Superadmin | `superadmin@geletrekking.com` | `superadmin123` |

Use this account to log in at:  
👉 [http://localhost:3000/etalogin](http://localhost:3000/etalogin)

## 🧠 Useful Docker Commands

| Command | Description |
|----------|--------------|
| `docker compose ps` | List running containers |
| `docker compose down` | Stop and remove all containers |
| `docker compose stop` | Stop containers (without removing them) |
| `docker compose start` | Restart stopped containers |
| `docker logs <container_name>` | View logs of a container |
| `docker exec -it <container_name> sh` | Open shell inside a container |

Example:
```bash
docker exec -it geletrekking-backend sh
```

---

## 🧰 Developer Notes

- You can edit your **frontend** and **backend** code directly — Docker watches for file changes automatically.
- All dependencies are installed inside Docker containers.
- MongoDB data is persisted using Docker volumes (so data won’t be lost on restart).

---

## 🧹 Troubleshooting

- **Module Not Found Errors:**  
  Run a rebuild → `docker compose -f docker/docker-compose.yml up --build`
- **Port Conflicts:**  
  Ensure ports `3000`, `5000`, and `27017` are free before running Docker.
- **Database Connection Issues:**  
  Check MongoDB logs or container status → `docker compose ps`

---

## 💡 Local (Non-Docker) Alternative (Optional)

If you still want to run manually:

### Backend
```bash
cd backend
npm install
node superadminSeeder.js
node server.js
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

---

## ✅ Summary

| Service | Port | Description |
|----------|------|--------------|
| Frontend | 3000 | Next.js (Vite) client |
| Backend | 5000 | Express API server |
| MongoDB | 27017 | Database |
