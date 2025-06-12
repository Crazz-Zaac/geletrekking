const mongoose = require('mongoose');

const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,   // Make email unique for login
  },
  username: {
    type: String,
    required: true,
    unique: true,   // Unique username (adjust if you don’t want this)
  },
  password: {
    type: String,
    required: true,
  }
});

module.exports = mongoose.model('Admin', adminSchema);
