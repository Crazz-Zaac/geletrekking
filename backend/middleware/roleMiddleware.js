// middlewares/roleMiddleware.js

const normalizeRole = (role) => {
  if (role === 'admin') return 'editor';
  return role;
}

const ROLE_PERMISSIONS = {
  superadmin: new Set(['manage_users', 'manage_settings', 'manage_security', 'manage_content']),
  editor: new Set(['manage_content']),
}

// Middleware to restrict access based on user roles
const restrictToRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: "Access denied: No user role found" });
    }

    const role = normalizeRole(req.user.role);
    const allowed = allowedRoles.map(normalizeRole);
    if (!allowed.includes(role)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }

    next();
  };
};

const requirePermission = (...permissions) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ message: 'Access denied: No user role found' });
    }

    const role = normalizeRole(req.user.role);
    const allowed = ROLE_PERMISSIONS[role] || new Set();

    const hasAll = permissions.every((perm) => allowed.has(perm));
    if (!hasAll) {
      return res.status(403).json({ message: 'Access denied: insufficient permissions' });
    }

    next();
  };
};

module.exports = {
  restrictToRoles,
  requirePermission,
  normalizeRole,
};
