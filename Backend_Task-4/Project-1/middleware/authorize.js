// Role-based access control. Usage: authorize('admin') or authorize('admin','moderator')
// Must run after `protect` (which sets req.user).
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied: requires role [${allowedRoles.join(', ')}]`,
      });
    }
    next();
  };
};

module.exports = authorize;
