// middlewares/roleMiddleware.js

// Middleware to restrict access based on user roles
const restrictToRoles = (...allowedRoles) => {
  return (req, res, next) => {
    // Make sure req.user exists (authMiddleware should have run before this)
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied: No user role found" });
    }

    // Check if user's role is allowed
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }

    // User has permission
    next();
  };
};

module.exports = restrictToRoles;
