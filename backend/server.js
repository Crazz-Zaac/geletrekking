require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

/* =========================================================
   1. CORS CONFIGURATION
   ---------------------------------------------------------
   - Allows requests from trusted origins only.
   - Includes both local and Docker network access.
========================================================= */

const allowedOrigins = [
  'http://localhost:3000',   // Local browser (host machine)
  'http://backend:5000',     // Docker internal (optional)
  'http://geletrekking-frontend:3000' // Docker container name access
];

if (process.env.FRONTEND_URL) {
  allowedOrigins.push(process.env.FRONTEND_URL);
}

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without origin (server-to-server, Postman, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

/* =========================================================
   2. MIDDLEWARE
========================================================= */
app.use(express.json());

/* =========================================================
   3. ROUTES IMPORT
========================================================= */
const adminRoutes = require('./routes/Admin/adminRoutes');
const protectedRoutes = require('./routes/protectedRoutes');
const superadminAuthRoutes = require('./routes/superadmin/auth');
const superadminRoutes = require('./routes/superadmin/superadmin');
const trekRoutes = require('./routes/trekroutes');
const authRoutes = require('./routes/authroutes');

/* =========================================================
   4. ROUTES MOUNTING
========================================================= */
app.use('/api/admin', adminRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/superadmin/auth', superadminAuthRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use('/api/treks', trekRoutes);
app.use('/api/auth', authRoutes);

/* =========================================================
   5. TEST ROUTES
========================================================= */
app.get('/', (req, res) => {
  res.send('Geletrekking backend is running.');
});

app.get('/api/contact', (req, res) => {
  res.json({ message: 'GET /api/contact route is reachable.' });
});

/* =========================================================
   6. ERROR HANDLING MIDDLEWARE
========================================================= */
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

/* =========================================================
   7. DATABASE CONNECTION & SERVER STARTUP
========================================================= */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB connected successfully.');

    // Important: Listen on all interfaces for Docker networking
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();
