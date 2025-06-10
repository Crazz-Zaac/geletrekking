Backend Project Structure
1. Overview

This backend is built with Node.js, Express, and MongoDB. It provides REST APIs to manage trekking data (treks).
2. Folder Structure

/backend
  /controllers    # Logic for handling API requests (e.g., trekController.js)
  /models         # Mongoose schemas (e.g., Trek.js)
  /routes         # Express route definitions (e.g., trekRoutes.js)
  server.js       # Main entry point of the backend server

3. Technologies Used

    Node.js & Express for server and routing

    MongoDB with Mongoose for database and ODM

    CORS for cross-origin requests

    Nodemon (optional) for development

4. API Endpoints

    GET /api/treks — Fetch all treks

    POST /api/treks — Create a new trek

5. Database

    MongoDB is used as the database

    Connected locally at mongodb://127.0.0.1:27017/geletrekking (replace with your actual database name)

    Trek schema contains fields like name, location, and duration

6. Server Setup

    Server listens on port 5000 (default)

    MongoDB connection established before server starts

    Proper error handling for database connection failures

7. How to Run Backend

npm install
node server.js

8. Current Status

    Backend server is running and connected to MongoDB

    Basic APIs for getting and creating trek data are working

    Tested with Postman / frontend and confirmed data retrieval and insertion

9. Next Steps

    Add more API endpoints (update, delete)

    Add authentication if needed

    Improve error handling and validation

    Connect frontend with backend fully