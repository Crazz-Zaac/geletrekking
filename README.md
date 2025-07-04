
# GeleTrekking Project Setup Guide

This guide explains how to run the **GeleTrekking** project on your local machine.

---

## Prerequisites

- **Node.js** 
- **MongoDB** 
- **Git**
(make sure this all are installed in your local machine to run)
---

## Clone the Repository

```bash
git clone https://github.com/Crazz-Zaac/geletrekking.git
cd geletrekking
```

---

## Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
npm install dotenv
```

3. Create a `.env` file in the backend folder with the following (example):

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/geletrekking
JWT_SECRET=your_jwt_secret_key
```

4. Start the backend server:

```bash
#save superadmin in db
node superadminSeeder.js
#start the server
node server.js
```

The backend API will be running on [http://localhost:5000](http://localhost:5000).

---

## Frontend Setup

1. Open a new terminal and navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend development server:

```bash
npm run dev
```

The frontend app will be running on [http://localhost:5173].
---

## Notes

- Ensure MongoDB is running locally before starting the backend.
- The frontend communicates with the backend API at `http://localhost:5000`.
- You can change this URL in frontend configuration if needed.
- The project uses these main packages:
  - **Backend**: express, mongoose, cors, dotenv
  - **Frontend**: react, react-router-dom, axios, vite

---

## Troubleshooting

- If you get module not found errors, run `npm install` again.
- If ports are busy, change the ports in `.env` or frontend config.
- For MongoDB connection issues, check your MongoDB server status.

---

