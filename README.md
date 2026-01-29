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

✅ 2) Environment Variables:

📁 backend/.env

PORT=5000

MONGO_URI=mongodb://mongo:27017/gele_trekking

JWT_SECRET=your_secret


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

🛠 6) Database Seeder 
-------------------------------------------------------------------------
RUN THIS BEFORE GOING TO ADMIN DASHBOARD:                               |
                                                                        |
docker exec -it geletrekking-backend npm run superadminSeeder.js        |
                                                                        |
-------------------------------------------------------------------------

