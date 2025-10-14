require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); // Initialize Express app

// Cron Job: Delete logs daily
require('./cron/deletelog');

// CORS Setup: Allow specific frontend origins
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware to parse JSON bodies
app.use(express.json());

/* =======================
   ROUTE IMPORTS
========================== */


const adminRoutes = require('./routes/Admin/adminRoutes');
const protectedRoutes = require('./routes/protectedRoutes');

const superadminAuthRoutes = require('./routes/superadmin/auth');         // Superadmin and admin login route
const superadminRoutes = require('./routes/superadmin/superadmin');       // Superadmin management routes
const trekRoutes = require("./routes/trekroutes");
const authRoutes = require('./routes/authroutes');




/* =======================
   ROUTE MOUNTING
========================== */
//app.use('/api/auth', authRoutes);                           

app.use('/api/admin', adminRoutes);
app.use('/api/protected', protectedRoutes);

app.use('/api/superadmin/auth', superadminAuthRoutes);
app.use('/api/superadmin', superadminRoutes);
app.use("/api/treks", trekRoutes);
app.use('/api/auth', authRoutes);
/* =======================
   TEST ROUTES
========================== */
app.get('/', (req, res) => {
  res.send('🌍 Geletrekking backend is running!');
});

app.get('/api/contact', (req, res) => {
  res.json({ message: 'GET /api/contact route is reachable!' });
});

/* =======================
   GLOBAL ERROR HANDLER
========================== */
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

/* =======================
   MONGODB + SERVER START
========================== */
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully!');

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

startServer();
