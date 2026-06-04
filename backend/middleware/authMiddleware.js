const jwt = require('jsonwebtoken');
const User = require('../models/user');

const protect = async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET, {
        issuer: process.env.JWT_ISSUER || 'gele-trekking-admin',
        audience: process.env.JWT_AUDIENCE || 'gele-trekking-admin',
      });

      const userId = decoded.sub || decoded.id;
      const user = await User.findById(userId).select('-password');
      if (!user) return res.status(401).json({ message: 'User not found' });

      if (user.status && user.status !== 'active') {
        return res.status(403).json({ message: 'Account is not active' });
      }

      req.user = user;
      next();
    } catch (err) {
      console.error(err);
      return res.status(401).json({ message: 'Token is not valid' });
    }
  } else {
    return res.status(401).json({ message: 'No token provided' });
  }
};

module.exports = protect;
