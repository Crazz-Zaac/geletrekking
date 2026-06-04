const jwt = require('jsonwebtoken');

const generateToken = (user) => {
  return jwt.sign(
    {
      sub: user._id.toString(),
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '1d',
      issuer: process.env.JWT_ISSUER || 'gele-trekking-admin',
      audience: process.env.JWT_AUDIENCE || 'gele-trekking-admin',
    }
  );
};

module.exports = generateToken;
