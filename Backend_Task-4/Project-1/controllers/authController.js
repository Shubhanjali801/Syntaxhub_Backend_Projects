const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /auth/signup
// Creates a normal user by default. To bootstrap an admin, send
// { role: "admin", adminSecret: "<ADMIN_SECRET>" } matching the env value.
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password, role, adminSecret } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'username, email and password are required' });
    }

    let assignedRole = 'user';
    if (role === 'admin') {
      if (!process.env.ADMIN_SECRET || adminSecret !== process.env.ADMIN_SECRET) {
        return res
          .status(403)
          .json({ success: false, message: 'Invalid admin secret for admin signup' });
      }
      assignedRole = 'admin';
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: 'A user with this email or username already exists' });
    }

    const user = await User.create({ username, email, password, role: assignedRole });
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'A user with this email or username already exists' });
    }
    return next(err);
  }
};

// POST /auth/login
exports.login = async (req, res, next) => {
  try {
    const { identifier, email, username, password } = req.body;
    const login = identifier || email || username;
    if (!login || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'email/username and password are required' });
    }

    const user = await User.findOne({
      $or: [{ email: login.toLowerCase() }, { username: login }],
    }).select('+password');

    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    if (user.isBlocked) {
      return res.status(403).json({ success: false, message: 'Your account has been blocked' });
    }

    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: { id: user._id, username: user.username, email: user.email, role: user.role },
    });
  } catch (err) {
    return next(err);
  }
};

// GET /auth/me  — current user's profile
exports.getMe = async (req, res, next) => {
  try {
    return res.status(200).json({ success: true, data: req.user });
  } catch (err) {
    return next(err);
  }
};
