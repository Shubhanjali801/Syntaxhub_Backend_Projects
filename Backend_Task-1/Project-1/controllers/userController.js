const mongoose = require('mongoose');
const User = require('../models/User');

// POST /users  — Create a user
exports.createUser = async (req, res, next) => {
  try {
    const { name, email, age } = req.body;
    const user = await User.create({ name, email, age });
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    // Duplicate email (unique index)
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'A user with this email already exists' });
    }
    return next(err);
  }
};

// GET /users  — List all users
exports.getUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    return next(err);
  }
};

// GET /users/:id  — Get a single user
exports.getUserById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
};

// PUT /users/:id  — Update a user
exports.updateUser = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const { name, email, age } = req.body;
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, age },
      { new: true, runValidators: true }
    );
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'A user with this email already exists' });
    }
    return next(err);
  }
};

// DELETE /users/:id  — Delete a user
exports.deleteUser = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res
      .status(200)
      .json({ success: true, message: 'User deleted', data: user });
  } catch (err) {
    return next(err);
  }
};
