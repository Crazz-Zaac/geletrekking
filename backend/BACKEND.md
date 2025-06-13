Backend Project Structure
1. Overview

This backend is built with Node.js, Express, and MongoDB. It provides REST APIs to manage trekking data (treks).

2. 📁 Folder Structure

/backend
│
├── /controllers # Logic for handling API requests
│ ├── trekController.js
│ └── contactController.js
│
├── /models # Mongoose schemas
│ ├── Trek.js
│ └── Contact.js
│
├── /routes # Express route definitions
│ ├── trekRoutes.js
│ └── contactRoutes.js
│
├── .env # Environment variables (DB URI, PORT, etc.)
├── server.js # Main entry point of the backend server
└── package.json


---
### ✅ Trek Endpoints

- **GET** `/api/treks`  
  - Fetch all treks

- **POST** `/api/treks`  
  - Create a new trek  
  - Expects: `{ name, location, duration }`

---

### ✅ Contact Form Endpoints

- **POST** `/api/contact`  
  - Save a contact form message  
  - Expects:  
    ```json
    {
      "name": "Your Name",
      "email": "your@email.com",
      "subject": "Optional subject",
      "message": "Your message here"
    }
    ```
  - Validates required fields: `name`, `email`, `message`
  - Saves data to MongoDB
  - Responds with success or error status

---

4. 💾 Database
- Connection string is stored securely in `.env`.

### Example Local Connection

mongodb://127.0.0.1:27017/geletrekking


### Trek Schema (`Trek.js`)
```js
name: String (required)
location: String (required)
duration: String (required)

Contact Schema (Contact.js)

name: String (required)
email: String (required)
subject: String (optional)
message: String (required)
createdAt: Date (default: Date.now)

