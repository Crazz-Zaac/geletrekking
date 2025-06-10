const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); // ✅ This must be declared BEFORE using it

// Import routes
const trekRoutes = require('./routes/trekRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/treks", trekRoutes);

const PORT = process.env.PORT || 5000;

// ✅ Connect to MongoDB and start the server
const startServer = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/geletrekking"); // or any DB name you want
    console.log("✅ MongoDB connected successfully!");

    // ✅ Now start the server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ MongoDB connection failed:", err.message);
    process.exit(1);
  }
};

startServer();
