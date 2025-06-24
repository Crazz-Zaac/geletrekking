require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express(); // Initialize express app

const allowedOrigins = ['http://localhost:3000', 'http://localhost:5173'];  // Add your frontend URLs here

// Middleware — enable BEFORE routes!
app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin like mobile apps or curl
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json()); // parse JSON bodies

// Import routes
const userAuth = require('./routes/userAuth');
const trekRoutes = require('./routes/trekRoutes');
const adminRoutes = require('./routes/Admin/adminRoutes');
const contactRoutes = require('./routes/contactRoutes');
const aboutUsRoutes = require('./routes/aboutus');
const protectedRoutes = require('./routes/protectedRoutes');  // New protected routes

// Mount routes
app.use('/api/userauth', userAuth);
app.use('/api/aboutus', aboutUsRoutes);
app.use('/api/treks', trekRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/protected', protectedRoutes);   // Mount the protected routes here

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
    await mongoose.connect(process.env.MONGO_URI);
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
