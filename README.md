# GELE TREKKING (Merged Frontend + Backend)

This repo contains:

- **frontend/** → React + Vite + Tailwind
- **backend/** → Express + MongoDB + JWT auth
- Root scripts to run both together.

## 1) Install

From the project root:

```bash
npm install
```

`postinstall` will automatically run:

- `npm install --prefix backend`
- `npm install --prefix frontend`

## 2) Environment variables

### backend/.env

Make sure these exist (example):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/gele_trekking
JWT_SECRET=your_secret

# Cloudinary (required for uploads)
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

### frontend/.env

```env
VITE_API_URL=http://localhost:5000
```

## 3) Run (development)

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend: http://localhost:5000

## 4) Admin Dashboard

- URL: `http://localhost:5173/admin/login`
- The backend already includes admin/superadmin routes.
  Create an admin/superadmin user using the backend seeder if you don't have one yet.

Admin can manage:
- Settings (site name, logo, contacts)
- Hero section
- Treks
- Blogs
- Gallery
- Testimonials
- About page

## 5) Build + Start (production)

```bash
npm run build
npm run start
```

Backend serves the built frontend from `frontend/dist`.
