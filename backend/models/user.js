const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },

    role: {
      type: String,
      enum: ['user', 'admin', 'superadmin'],
      default: 'user',
    },

    // 🔐 Two-Factor Authentication fields
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null },
  },
  { timestamps: true }
);

// Prevent model overwrite errors during hot-reload
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
