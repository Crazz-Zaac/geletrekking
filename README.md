GeleTrekking Project Setup Guide (Next.js frontend + Express backend)
Prerequisites

    Node.js

    MongoDB

    Git

Clone the Repository

git clone https://github.com/Crazz-Zaac/geletrekking.git
cd geletrekking

Backend Setup

    Navigate to backend folder:

cd backend

    Install dependencies:

npm install

    Backend main packages used (listed for your info; these should already be in package.json):

    express — backend web framework

    mongoose — MongoDB ODM

    cors — to allow cross-origin requests

    dotenv — load environment variables

    bcryptjs — password hashing

    jsonwebtoken — JWT auth tokens

    nodemailer — for sending emails (optional)

    Create .env file with content like:

PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/geletrekking
{
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_app_passcode
ADMIN_EMAIL=your@gmail.com
}("not needed now cause we haven't done contact in this next.js")
    Start backend server:

npm start

API runs at http://localhost:5000.
Frontend Setup (Next.js)

    Navigate to frontend folder:

cd frontend

    Install dependencies:

npm install

    Frontend main packages you should have in package.json:

    react — React core

    react-dom — React DOM renderer

    next — Next.js framework

    axios — HTTP client (optional; you can also use fetch API)

    js-cookie — (optional) cookie handling for auth

    swr — (optional) React data fetching hooks

    dotenv — (for env vars in Next.js)

    These should be in your package.json. If not, install with:

npm install react react-dom next axios js-cookie swr dotenv

    Start frontend dev server:

npm run dev

Frontend runs at http://localhost:3000.
Notes

    MongoDB must be running locally before starting backend.

    Frontend connects to backend at http://localhost:5000 (change URLs if needed).

    You can use .env.local in your frontend to store variables like:

NEXT_PUBLIC_API_URL=http://localhost:5000

and use process.env.NEXT_PUBLIC_API_URL in your code to avoid hardcoding URLs.
Troubleshooting

    Run npm install if packages are missing.

    Change ports in .env files if conflicts.

    Check MongoDB service status if connection errors occur.