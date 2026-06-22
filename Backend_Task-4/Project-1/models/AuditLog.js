const mongoose = require('mongoose');

// Minimal audit log of admin actions (who did what, to whom, when).
const auditLogSchema = new mongoose.Schema(
  {
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorUsername: { type: String },
    action: { type: String, required: true }, // e.g. BLOCK_USER, PROMOTE_USER
    target: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    targetUsername: { type: String },
    details: { type: String, default: '' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditLog', auditLogSchema);
