const mongoose = require('mongoose');
const User = require('../models/User');
const AuditLog = require('../models/AuditLog');
const logAction = require('../utils/audit');

// Guard: validate id + load target user; block self-targeting for destructive ops
const loadTarget = async (req, res, { allowSelf = true } = {}) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).json({ success: false, message: 'Invalid user id' });
    return null;
  }
  if (!allowSelf && req.params.id === String(req.user._id)) {
    res.status(400).json({ success: false, message: 'You cannot perform this action on your own account' });
    return null;
  }
  const target = await User.findById(req.params.id);
  if (!target) {
    res.status(404).json({ success: false, message: 'User not found' });
    return null;
  }
  return target;
};

// GET /admin/users  — list all users
exports.listUsers = async (req, res, next) => {
  try {
    const { role, blocked } = req.query;
    const filter = {};
    if (role) filter.role = role;
    if (blocked === 'true') filter.isBlocked = true;
    if (blocked === 'false') filter.isBlocked = false;

    const users = await User.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: users.length, data: users });
  } catch (err) {
    return next(err);
  }
};

// GET /admin/users/:id
exports.getUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res);
    if (!target) return;
    return res.status(200).json({ success: true, data: target });
  } catch (err) {
    return next(err);
  }
};

// PATCH /admin/users/:id/block
exports.blockUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res, { allowSelf: false });
    if (!target) return;
    target.isBlocked = true;
    await target.save();
    await logAction({ actor: req.user, action: 'BLOCK_USER', target });
    return res.status(200).json({ success: true, message: 'User blocked', data: target });
  } catch (err) {
    return next(err);
  }
};

// PATCH /admin/users/:id/unblock
exports.unblockUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res);
    if (!target) return;
    target.isBlocked = false;
    await target.save();
    await logAction({ actor: req.user, action: 'UNBLOCK_USER', target });
    return res.status(200).json({ success: true, message: 'User unblocked', data: target });
  } catch (err) {
    return next(err);
  }
};

// PATCH /admin/users/:id/promote  — make admin
exports.promoteUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res);
    if (!target) return;
    target.role = 'admin';
    await target.save();
    await logAction({ actor: req.user, action: 'PROMOTE_USER', target, details: 'role -> admin' });
    return res.status(200).json({ success: true, message: 'User promoted to admin', data: target });
  } catch (err) {
    return next(err);
  }
};

// PATCH /admin/users/:id/demote  — make normal user
exports.demoteUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res, { allowSelf: false });
    if (!target) return;
    target.role = 'user';
    await target.save();
    await logAction({ actor: req.user, action: 'DEMOTE_USER', target, details: 'role -> user' });
    return res.status(200).json({ success: true, message: 'User demoted to user', data: target });
  } catch (err) {
    return next(err);
  }
};

// DELETE /admin/users/:id
exports.deleteUser = async (req, res, next) => {
  try {
    const target = await loadTarget(req, res, { allowSelf: false });
    if (!target) return;
    await target.deleteOne();
    await logAction({ actor: req.user, action: 'DELETE_USER', target });
    return res.status(200).json({ success: true, message: 'User deleted', data: target });
  } catch (err) {
    return next(err);
  }
};

// GET /admin/audit  — view admin action audit log
exports.getAuditLogs = async (req, res, next) => {
  try {
    const logs = await AuditLog.find().sort({ createdAt: -1 }).limit(100);
    return res.status(200).json({ success: true, count: logs.length, data: logs });
  } catch (err) {
    return next(err);
  }
};
