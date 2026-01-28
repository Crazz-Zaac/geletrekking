🌄 GELE TREKKING (Dockerized Fullstack App)

This repository contains a fully Dockerized MERN stack:

frontend/ → React + Vite + Tailwind (served by Nginx in production)

backend/ → Express + MongoDB + JWT auth

mongo/ → MongoDB container

docker-compose.yml → Runs everything together

✅ 1) Requirements

Install:

Docker

Docker Compose

Check:

docker -v
docker-compose -v

✅ 2) Environment Variables
📁 backend/.env
PORT=5000
MONGO_URI=mongodb://mongo:27017/gele_trekking
JWT_SECRET=your_secret

# Cloudinary (required for uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=

📁 frontend/.env
VITE_API_URL=http://localhost:5000

✅ 3) Run Entire App (Development & Production)

From project root:

docker-compose up --build

🌐 Services
Service	URL
Frontend	http://localhost:3000

Backend API	http://localhost:5000

MongoDB	mongodb://localhost:27017
✅ 4) Stop Containers
docker-compose down

🔐 5) Admin Dashboard

Login:
👉 http://localhost:3000/admin/login

Admin can manage:

Settings (site name, logo, contacts)

Hero section

Treks

Blogs

Gallery

Testimonials

About page

Superadmin can manage admins & system settings.

🛠 6) Database Seeder (Optional)

If you use a superadmin seeder:

docker exec -it geletrekking-backend npm run seed

📦 7) Production Deployment

Same setup works on VPS/cloud:

docker-compose up -d --build

🔥 8) Architecture
Browser → Frontend (Nginx) → Backend (Express) → MongoDB


If you want, I can also:
✅ Add Docker healthchecks
✅ Add production env overrides
✅ Add CI/CD GitHub Actions
✅ Add auto HTTPS (Nginx + Certbot)

it's for readme.md give me structure wise so that I can copy and paste that 

Here’s a clean, professional, copy-paste ready README.md structured perfectly for your Docker-based Gele Trekking project 👇

🌄 GELE TREKKING — Fullstack MERN App (Dockerized)

This repository contains a fully Dockerized MERN stack application:

frontend/ → React + Vite + Tailwind (served via Nginx in production)

backend/ → Express + MongoDB + JWT Authentication

mongo/ → MongoDB container

docker-compose.yml → Runs the entire system

📦 Tech Stack

React + Vite + Tailwind

Node.js + Express

MongoDB + Mongoose

JWT Authentication

Docker + Docker Compose

Nginx (frontend production server)

✅ Requirements

Make sure you have installed:

Docker

Docker Compose

Check:

docker -v
docker-compose -v

⚙️ Environment Variables
📁 backend/.env
PORT=5000
MONGO_URI=mongodb://mongo:27017/gele_trekking
JWT_SECRET=your_secret


📁 frontend/.env
VITE_API_URL=http://localhost:5000

🚀 Run the Project (Docker)

From the project root:

docker-compose up --build

🌐 Service URLs
Service	URL
Frontend	http://localhost:3000

Backend API	http://localhost:5000

MongoDB	mongodb://localhost:27017
⛔ Stop Containers
docker-compose down

🔐 Admin Dashboard

Login URL:
👉 http://localhost:3000/admin/login

Admins can manage:

Settings

Hero section

Treks

Blogs

Gallery

Testimonials

About page

Superadmins can manage admins and system configuration.

🛠 Database Seeder 

To create a superadmin user:

docker exec -it geletrekking-backend npm run superadminSeeder.js

📦 Production Deployment
docker-compose up -d --build

🧱 Architecture
Browser → Frontend (Nginx) → Backend (Express) → MongoDB

