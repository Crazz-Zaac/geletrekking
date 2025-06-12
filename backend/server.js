const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); // Initialize express app

// Middleware — enable BEFORE routes!
app.use(cors({
  origin: 'http://localhost:5173',  // your frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json()); // parse JSON bodies

// Import routes
const trekRoutes = require('./routes/trekRoutes');
const adminRoutes = require('./routes/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');  // <-- new contact routes

// Use routes AFTER middleware
app.use('/api/admin', adminRoutes);
app.use('/api/treks', trekRoutes);
app.use('/api', contactRoutes);  // <-- contact routes added

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
