# Gele Trekking - Setup Guide

A fully Dockerized MERN (MongoDB, Express, React, Node.js) stack application for trek booking and management.

## Stack Overview

```
Frontend  → React + Vite + Tailwind CSS (Nginx in production)
Backend   → Express.js + Node.js with JWT authentication
Database  → MongoDB with authentication
Services  → Docker Compose orchestration
```

## Prerequisites

Before running this project on a new machine, ensure you have:

- **Docker** (v20.10+) - [Install Docker](https://docs.docker.com/get-docker/)
- **Docker Compose** (v2.0+) - Usually included with Docker Desktop
- **Git** - For cloning the repository
- ~2GB of free disk space for Docker images and volumes

### Verify Installation

```bash
docker --version
docker compose --version
```

## Quick Start (Using Docker) ⚡

### 1. Clone the Repository

```bash
git clone https://github.com/Crazz-Zaac/geletrekking.git
cd geletrekking
```

### 2. Start All Services

```bash
cd docker
docker compose up -d --build
```

This command will:
- Build the frontend (React + Vite)
- Build the backend (Express.js)
- Start MongoDB with authentication
- Start Mongo Express (database admin UI)
- Automatically seed the superadmin user

### 3. Access the Application

| Service | URL | Credentials |
|---------|-----|-------------|
| **Frontend** | http://localhost:3000 | - |
| **Backend API** | http://localhost:5000 | - |
| **Mongo Express** | http://localhost:8081 | `sherap` / `sherap123` |

### 4. Login to Dashboard
Use the credentials you set in `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD` to login

### 5. Stop Services

```bash
cd docker
docker compose down
```

To also remove data volumes:

```bash
docker compose down -v
```

## Local Development (Without Docker)

### Prerequisites

- **Node.js** v18+ and npm/pnpm
- **MongoDB** running locally on port 27017

### 1. Install Dependencies

```bash
# Root directory
npm install

# Backend dependencies
cd backend
npm install --legacy-peer-deps

# Frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment Variables

Create/update `.env` files:
  - Copy `backend/.env.example` to `backend/.env`
  - Fill in your configuration values

**`backend/.env`** (for local development):
```dotenv
# MongoDB Configuration (no URL encoding needed!)
MONGO_USERNAME=your_username
MONGO_PASSWORD=your_password
MONGO_HOST=localhost              # Use 'localhost' for local, 'mongo' for Docker
MONGO_PORT=27017
MONGO_DATABASE=geletrekking
MONGO_AUTH_SOURCE=admin

# Application Config
SUPERADMIN_EMAIL=superadmin@geletrekking.com
SUPERADMIN_PASSWORD=your_password
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=http://localhost:5173
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:3000
```

### 3. Start the Application

From the root directory:

```bash
# Run both backend and frontend concurrently
npm run dev
```

Or run them separately:

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

**Frontend**: http://localhost:5173
**Backend**: http://localhost:5000

## Project Structure

```
geletrekking/
├── backend/                 # Express.js server
│   ├── config/             # Database, Cloudinary config
│   ├── controllers/        # Route handlers
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API endpoints
│   ├── middleware/         # Auth, role-based middleware
│   ├── utils/              # Helper functions
│   ├── server.js           # Entry point
│   ├── superadminSeeder.js # Creates superadmin user
│   ├── entrypoint.sh       # Docker entry script
│   └── .env               # Environment variables
│
├── frontend/               # React + Vite application
│   ├── client/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route pages
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utilities & API client
│   │   └── App.tsx         # Main component
│   ├── vite.config.ts
│   └── tailwind.config.ts
│
├── docker/                 # Docker configuration
│   ├── Dockerfile.backend  # Backend image
│   ├── Dockerfile.frontend # Frontend image
│   ├── docker-compose.yml  # Orchestration
│   └── nginx.conf          # Production Nginx config
│
└── README.md              # This file
```

## Key Features

- ✅ **JWT Authentication** - Secure user login and token management
- ✅ **Role-Based Access Control** - Superadmin, admin, and user roles
- ✅ **MongoDB Authentication** - Database security with credentials
- ✅ **Auto-Seeding** - Superadmin user created on first run
- ✅ **Email Integration** - Gmail SMTP for notifications
- ✅ **Responsive UI** - Tailwind CSS for modern design
- ✅ **Production Ready** - Nginx reverse proxy configuration
- ✅ **Database Admin UI** - Mongo Express for easy data management

## Environment Variables Reference

### Backend (`backend/.env`)

**✅ RECOMMENDED: Use individual MongoDB components** (automatically URL-encoded)

```dotenv
# MongoDB Configuration
MONGO_USERNAME=sherap
MONGO_PASSWORD=P@ssw0rd!          # Special characters handled automatically!
MONGO_HOST=mongo                   # 'mongo' for Docker, 'localhost' for local
MONGO_PORT=27017
MONGO_DATABASE=geletrekking
MONGO_AUTH_SOURCE=admin

# MongoDB initialization (Docker only)
MONGO_INITDB_ROOT_USERNAME=sherap
MONGO_INITDB_ROOT_PASSWORD=P@ssw0rd!

# Server Configuration
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
FRONTEND_URL=http://localhost:3000

# Authentication
JWT_SECRET=your_jwt_secret_key_here
SUPERADMIN_EMAIL=superadmin@geletrekking.com
SUPERADMIN_PASSWORD=sherap

# Email Configuration
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password

# Database Admin (Mongo Express)
ME_CONFIG_BASICAUTH_USERNAME=sherap
ME_CONFIG_BASICAUTH_PASSWORD=sherap123
ME_CONFIG_MONGODB_SERVER=mongo
ME_CONFIG_MONGODB_PORT=27017
```

**⚠️ LEGACY: Direct MONGO_URI** (requires manual URL encoding)

```dotenv
# Only use if you need full control over connection string
MONGO_URI=mongodb://sherap:P%40ssw0rd%21@mongo:27017/geletrekking?authSource=admin
```

## Common Tasks

### View Docker Logs

```bash
# Backend logs
docker logs geletrekking-backend -f

# MongoDB logs
docker logs geletrekking-mongo -f

# All services
docker logs -f
```

### Access MongoDB Shell

```bash
docker exec -it geletrekking-mongo mongosh -u sherap -p 'P@ssw0rd!' --authenticationDatabase admin geletrekking
```

### Rebuild Containers

```bash
cd docker
docker compose down -v
docker compose up -d --build
```

### Check Container Status

```bash
docker compose ps
```

## Troubleshooting

### MongoDB Authentication Failed

**Issue**: `Authentication failed` error when connecting to MongoDB

**Solution**: 
- Ensure `MONGO_URI` includes URL-encoded credentials (@ = `%40`, ! = `%21`)
- Rebuild containers: `docker compose down -v && docker compose up -d --build`

### Backend Connection Error

**Issue**: Backend can't connect to MongoDB

**Solution**:
- Use `mongo` as hostname (not localhost) in Docker environment
- Verify `.env` file is in `backend/` directory
- Check MongoDB container is running: `docker ps | grep mongo`

### Port Already in Use

**Issue**: Port 3000, 5000, or 27017 already in use

**Solution**:
```bash
# Find process using port
lsof -i :3000

# Or change ports in docker-compose.yml
```

### Superadmin User Not Created

**Issue**: Can't login with superadmin credentials

**Solution**:
- Check backend logs: `docker logs geletrekking-backend`
- Verify `.env` has `SUPERADMIN_EMAIL` and `SUPERADMIN_PASSWORD`
- Recreate containers: `docker compose down -v && docker compose up -d --build`

### Special Characters in Password Cause Connection Issues

**Issue**: MongoDB URI fails with special characters like `@` or `!`

**Solution**:
- **RECOMMENDED**: Use individual MongoDB variables (`MONGO_USERNAME`, `MONGO_PASSWORD`) - encoding is automatic!
- **LEGACY**: If using `MONGO_URI`, manually URL-encode special characters:
  - `@` → `%40`
  - `!` → `%21`
  - `:` → `%3A`
  - Example: `P@ssw0rd!` becomes `P%40ssw0rd%21`

## Production Deployment

For production:

1. Update environment variables in `.env`
2. Set `NODE_ENV=production` in backend `.env`
3. Remove port mappings or use a reverse proxy
4. Enable HTTPS/SSL
5. Update `ALLOWED_ORIGINS` with production domains
6. Change default passwords
7. Set strong `JWT_SECRET`
8. Update `FRONTEND_URL` to production domain

## API Documentation

Backend API runs on `http://localhost:5000`

Main routes:
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `GET /api/treks` - List all treks
- `GET /api/about` - About page content
- `GET /api/gallery` - Gallery items
- `POST /api/admin/...` - Admin routes
- `POST /api/superadmin/...` - Superadmin routes

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes
3. Commit: `git commit -m "Add your feature"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

## License

This project is private and owned by Crazz-Zaac.

## Support

For issues or questions, contact the development team or create an issue on GitHub.

---
