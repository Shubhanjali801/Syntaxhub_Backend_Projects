const mongoose = require('mongoose');
const User = require('../models/User');
const logAction = require('../utils/audit');

// Guard: validate id + load target user; optionally block self-targeting.
const loadTarget = async (req, res, { allowSelf = true } = {}) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid user id' });
    return null;
  }
  if (!allowSelf && req.params.id === String(req.user._id)) {
    res
      .status(400)
      .json({ success: false, message: 'You cannot perform this action on your own account' });
    return null;
  }
  const target = await User.findById(req.params.id);
  if (!target) {
    res.status(404).json({ success: false, message: 'User not found' });
    return null;
  }
  return target;
};

// GET /users  — list all users
exports.listUsers = async (req, res, next) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    return next(err);
  }
};

// GET /users/:id
exports.getUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res);
    if (!target) return;
    return res.status(200).json({ success: true, data: target });
  } catch (err) {
    return next(err);
  }
};

// PATCH /users/:id  — sensitive: update profile fields. Logged with a before/after diff.
exports.updateUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res);
    if (!target) return;

    const allowed = ['username', 'email', 'role'];
    const before = {};
    const after = {};
    for (const field of allowed) {
      if (req.body[field] !== undefined && req.body[field] !== target[field]) {
        before[field] = target[field];
        after[field] = req.body[field];
        target[field] = req.body[field];
      }
    }

    if (Object.keys(after).length === 0) {
      return res.status(400).json({ success: false, message: 'No valid fields to update' });
    }

    await target.save();
    await logAction({
      req,
      action: 'UPDATE_USER',
      targetModel: 'User',
      target,
      targetLabel: target.username,
      changes: { before, after },
      details: `Updated fields: ${Object.keys(after).join(', ')}`,
    });

    return res.status(200).json({ success: true, message: 'User updated', data: target });
  } catch (err) {
    return next(err);
  }
};

// PATCH /users/:id/block  — sensitive: block an account.
exports.blockUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res, { allowSelf: false });
    if (!target) return;

    target.isBlocked = true;
    await target.save();
    await logAction({
      req,
      action: 'BLOCK_USER',
      targetModel: 'User',
      target,
      targetLabel: target.username,
      changes: { before: { isBlocked: false }, after: { isBlocked: true } },
    });

    return res.status(200).json({ success: true, message: 'User blocked', data: target });
  } catch (err) {
    return next(err);
  }
};

// PATCH /users/:id/unblock  — sensitive: restore an account.
exports.unblockUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res);
    if (!target) return;

    target.isBlocked = false;
    await target.save();
    await logAction({
      req,
      action: 'UNBLOCK_USER',
      targetModel: 'User',
      target,
      targetLabel: target.username,
      changes: { before: { isBlocked: true }, after: { isBlocked: false } },
    });

    return res.status(200).json({ success: true, message: 'User unblocked', data: target });
  } catch (err) {
    return next(err);
  }
};

// DELETE /users/:id  — sensitive: delete an account.
exports.deleteUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res, { allowSelf: false });
    if (!target) return;

    await target.deleteOne();
    await logAction({
      req,
      action: 'DELETE_USER',
      targetModel: 'User',
      target,
      targetLabel: target.username,
      details: `Deleted user ${target.username} (${target.email})`,
    });

    return res.status(200).json({ success: true, message: 'User deleted', data: target });
  } catch (err) {
    return next(err);
  }
};
