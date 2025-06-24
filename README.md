
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
```

3. Create a `.env` file in the backend folder with the following (example):

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/geletrekking
(to use the contact and get the message in gmail add your email and app passcode to make it work here in .env like 
<
EMAIL_USER=your@gmail.com
EMAIL_PASS=yout passcode here
ADMIN_EMAIL=your@gmail.com
> )
{note:- both admin and user mail is same because sending and receiving is done by your@gmail.com}
```

4. Start the backend server:

```bash
npm start
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

