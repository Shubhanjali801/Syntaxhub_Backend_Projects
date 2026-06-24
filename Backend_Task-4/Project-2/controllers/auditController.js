const mongoose = require('mongoose');
const AuditLog = require('../models/AuditLog');
const { AUDIT_ACTIONS } = require('../models/AuditLog');

// GET /audit  — fetch the audit trail (admin only).
// Filters: ?user=<id> ?action=<ACTION> ?status=SUCCESS|FAILURE
//          ?targetModel=User ?target=<id> ?from=<date> ?to=<date>
// Paging:  ?page=1 ?limit=20   |   Linking: ?populate=true to expand actor/target
exports.getLogs = async (req, res, next) => {
  try {
    const { user, action, status, targetModel, target, from, to, populate } = req.query;
    const filter = {};

    if (user) {
      if (!mongoose.isValidObjectId(user)) {
        return res.status(400).json({ success: false, message: 'Invalid user id' });
      }
      filter.actor = user;
    }
    if (action) {
      if (!AUDIT_ACTIONS.includes(action)) {
        return res.status(400).json({
          success: false,
          message: `Invalid action. Allowed: ${AUDIT_ACTIONS.join(', ')}`,
        });
      }
      filter.action = action;
    }
    if (status) filter.status = status.toUpperCase();
    if (targetModel) filter.targetModel = targetModel;
    if (target) {
      if (!mongoose.isValidObjectId(target)) {
        return res.status(400).json({ success: false, message: 'Invalid target id' });
      }
      filter.target = target;
    }

    // Date range on createdAt (the "when"). `to` is inclusive of the whole day
    // when a bare date is supplied.
    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const f = new Date(from);
        if (isNaN(f)) {
          return res.status(400).json({ success: false, message: 'Invalid "from" date' });
        }
        filter.createdAt.$gte = f;
      }
      if (to) {
        const t = new Date(to);
        if (isNaN(t)) {
          return res.status(400).json({ success: false, message: 'Invalid "to" date' });
        }
        if (!/T/.test(to)) t.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = t;
      }
    }

    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);
    const skip = (page - 1) * limit;

    let query = AuditLog.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit);
    if (populate === 'true') {
      query = query
        .populate('actor', 'username email role')
        .populate('target', 'username email role');
    }

    const [logs, total] = await Promise.all([query, AuditLog.countDocuments(filter)]);

    return res.status(200).json({
      success: true,
      count: logs.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      data: logs,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /audit/:id  — fetch a single log entry, with actor/target expanded.
exports.getLog = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid log id' });
    }
    const log = await AuditLog.findById(req.params.id)
      .populate('actor', 'username email role')
      .populate('target', 'username email role');
    if (!log) {
      return res.status(404).json({ success: false, message: 'Log entry not found' });
    }
    return res.status(200).json({ success: true, data: log });
  } catch (err) {
    return next(err);
  }
};

// GET /audit/stats  — counts grouped by action (handy admin summary).
exports.getStats = async (req, res, next) => {
  try {
    const byAction = await AuditLog.aggregate([
      { $group: { _id: '$action', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const total = await AuditLog.countDocuments();
    return res.status(200).json({ success: true, total, byAction });
  } catch (err) {
    return next(err);
  }
};
