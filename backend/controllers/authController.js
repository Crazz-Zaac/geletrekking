const User = require('../models/user');
const Admin = require('../models/Admin');  // <-- Import Admin model
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });

  try {
    // Try finding user in User collection first
    let user = await User.findOne({ email });

    // If not found, try finding in Admin collection
    if (!user) {
      user = await Admin.findOne({ email });
    }

    if (!user || !['admin', 'superadmin'].includes(user.role)) {
      console.log('Access denied due to role or user not found');
      return res.status(401).json({ message: 'Access denied' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    console.log('Token generated');

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name || user.username,
        email: user.email,
        role: user.role,
      }
    });
  } catch (err) {
    console.error('Login error:', err.stack || err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
