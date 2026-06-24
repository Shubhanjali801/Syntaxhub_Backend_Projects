const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Require a valid, non-expired JWT; reject blocked accounts.
const protect = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    if (!header.startsWith('Bearer ')) {
      return res
        .status(401)
        .json({ success: false, message: 'Not authorized, no token provided' });
    }

    const token = header.split(' ')[1];

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(403).json({ success: false, message: 'Token expired' });
      }
      return res.status(401).json({ success: false, message: 'Invalid token' });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    req.user = user;
    next();
  } catch (err) {
    return next(err);
  }
};

module.exports = protect;
