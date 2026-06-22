const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /auth/signup
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'username, email and password are required' });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: 'A user with this email or username already exists' });
    }

    const user = await User.create({ username, email, password });
    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: { id: user._id, username: user.username, email: user.email },
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

    const token = generateToken(user._id);
    return res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      data: { id: user._id, username: user.username, email: user.email },
    });
  } catch (err) {
    return next(err);
  }
};

// GET /auth/me  — current user WITH their notes (populate User -> Notes)
exports.getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'notes',
      match: { isDeleted: false },
      select: 'title category isArchived createdAt',
    });
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
};
