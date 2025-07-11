
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
npm install speakeasy
npm install google-auth-library

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
npm install @react-oauth/google

```
3.     Google OAuth Setup:
To enable Google login in the frontend, you need to provide your Google Client ID as an environment variable.

    Create a file named .env.local inside the frontend folder.

    Add the following line with your Google Client ID:
    ```env

      NEXT_PUBLIC_GOOGLE_CLIENT_ID=416465718761-k6esa7bds8i96cdhssqa916p8l39m70f.apps.googleusercontent.com
    ```

    Note: The prefix NEXT_PUBLIC_ is required to expose the variable to the frontend React app.


4. Start the frontend development server:

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

