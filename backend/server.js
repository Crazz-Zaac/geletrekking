require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); // Initialize express app

// Middleware — enable BEFORE routes!
app.use(cors({
  origin: 'http://localhost:5173',  // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json()); // parse JSON bodies

// Import routes
const trekRoutes = require('./routes/trekRoutes');
const adminRoutes = require('./routes/Admin/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');  // Only contact POST route for sending email

const aboutUsRoutes = require('./routes/aboutus');
app.use('/api/aboutus', aboutUsRoutes);

// Mount routes
app.use('/api/treks', trekRoutes);          // Trekking related routes
app.use('/api/admin', adminRoutes);          // Other admin routes
app.use('/api/contact', contactRoutes);      // Public contact form POST route for sending email

// Root route for testing backend is running
app.get('/', (req, res) => {
  res.send('Geletrekking backend is running!');
});

// Optional debug route to check if contact route is reachable
app.get('/api/contact', (req, res) => {
  res.json({ message: 'GET /api/contact route is reachable!' });
});

// Generic error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5000;

// Connect to MongoDB and start server
const startServer = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/geletrekking");
    console.log("✅ MongoDB connected successfully!");

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

 
startServer();
