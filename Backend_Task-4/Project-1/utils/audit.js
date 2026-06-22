const AuditLog = require('../models/AuditLog');

// Write an audit entry. Failures are swallowed so logging never breaks the
// main request flow.
const logAction = async ({ actor, action, target, details = '' }) => {
  try {
    await AuditLog.create({
      actor: actor?._id,
      actorUsername: actor?.username,
      action,
      target: target?._id,
      targetUsername: target?.username,
      details,
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = logAction;
