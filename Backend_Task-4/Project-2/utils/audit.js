const AuditLog = require('../models/AuditLog');

// Write an audit-trail entry. Captures WHO (actor), WHAT (action/status/changes),
// WHICH resource (target, linked via targetModel), and request context (ip/method/path).
//
// `req` is optional — when passed, actor and request metadata are pulled from it
// automatically. Failures are swallowed so logging never breaks the request flow.
const logAction = async ({
  req,
  actor,
  action,
  status = 'SUCCESS',
  targetModel,
  target,
  targetLabel,
  changes,
  details = '',
}) => {
  try {
    const who = actor || req?.user;
    await AuditLog.create({
      actor: who?._id,
      actorUsername: who?.username,
      action,
      status,
      targetModel,
      target: target?._id || target,
      targetLabel,
      changes,
      details,
      ip: req?.ip,
      method: req?.method,
      path: req?.originalUrl,
    });
  } catch (err) {
    console.error('Audit log error:', err.message);
  }
};

module.exports = logAction;
