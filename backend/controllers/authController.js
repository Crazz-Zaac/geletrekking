const User = require('../models/user');  // <-- Add this line
const bcrypt = require('bcryptjs');
const generateToken = require('../utils/generateToken');

exports.login = async (req, res) => {
  const { email, password } = req.body;
  console.log('Login attempt:', { email });  // Log incoming email

  try {
    const user = await User.findOne({ email });
    console.log('User found:', user ? true : false);

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
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err.stack || err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
