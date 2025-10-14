const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  role: {
    type: String,
    enum: ['user', 'admin', 'superadmin'],
    default: 'user',
  },
}, { timestamps: true });

// This prevents "OverwriteModelError" when the model is compiled multiple times
const User = mongoose.models.User || mongoose.model('User', userSchema);

module.exports = User;
