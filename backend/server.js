require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// ✅ Import cron job to delete log files daily
require('./cron/deleteLogs.js');

const app = express(); // Initialize Express app

// ✅ CORS Setup
const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (like mobile apps, curl)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json()); // Enable JSON request body parsing

// ✅ Import routes
const userAuth = require('./routes/userAuth');
const trekRoutes = require('./routes/trekRoutes');
const adminRoutes = require('./routes/Admin/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const aboutUsRoutes = require('./routes/aboutus');
const protectedRoutes = require('./routes/protectedRoutes');
const superadminRoutes = require('./routes/superadmin/superadmin');

// ✅ Mount routes
app.use('/api/userauth', userAuth);
app.use('/api/aboutus', aboutUsRoutes);
app.use('/api/treks', trekRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/protected', protectedRoutes);
app.use('/api/superadmin', superadminRoutes);

// ✅ Root route
app.get('/', (req, res) => {
  res.send('Geletrekking backend is running!');
});

// ✅ Optional test route
app.get('/api/contact', (req, res) => {
  res.json({ message: 'GET /api/contact route is reachable!' });
});

// ✅ Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// ✅ MongoDB + Server start
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
