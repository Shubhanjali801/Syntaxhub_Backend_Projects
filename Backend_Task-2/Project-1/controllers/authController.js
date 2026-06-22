const User = require('../models/User');
const generateToken = require('../utils/generateToken');

// POST /auth/signup  — register a new user
exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'username, email and password are required' });
    }

    // Reject duplicates with a clear message
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

// POST /auth/login  — verify credentials and issue a JWT
exports.login = async (req, res, next) => {
  try {
    const { identifier, email, username, password } = req.body;
    // Accept email, username, or a generic "identifier" field
    const login = identifier || email || username;

    if (!login || !password) {
      return res
        .status(400)
        .json({ success: false, message: 'email/username and password are required' });
    }

    // password has select:false, so explicitly select it
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

// GET /auth/me  — protected: return the current user's profile
exports.getMe = async (req, res, next) => {
  try {
    // req.user is set by the auth middleware
    return res.status(200).json({ success: true, data: req.user });
  } catch (err) {
    return next(err);
  }
};
