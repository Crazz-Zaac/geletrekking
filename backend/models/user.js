const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String },
    email: { type: String, required: true, unique: true },
    password: { type: String },

    role: {
      type: String,
      enum: ['superadmin', 'editor', 'admin'],
      default: 'editor',
    },

    status: {
      type: String,
      enum: ['active', 'suspended', 'disabled'],
      default: 'active',
    },
    suspendedAt: { type: Date, default: null },
    suspendedReason: { type: String, default: null },

    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null },
    lastLoginAt: { type: Date, default: null },
    lastLoginIp: { type: String, default: null },

    // 🔐 Two-Factor Authentication fields
    twoFactorEnabled: { type: Boolean, default: false },
    twoFactorSecret: { type: String, default: null },
    twoFactorTempSecret: { type: String, default: null },
    twoFactorSecretEnc: { type: String, default: null },
    twoFactorTempSecretEnc: { type: String, default: null },
  },
  { timestamps: true }
);

// Prevent model overwrite errors during hot-reload
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
