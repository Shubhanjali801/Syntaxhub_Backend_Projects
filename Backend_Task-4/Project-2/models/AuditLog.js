const mongoose = require('mongoose');

// Actions we record. Centralised so controllers and filters stay consistent.
const AUDIT_ACTIONS = [
  'CREATE_USER',
  'UPDATE_USER',
  'DELETE_USER',
  'BLOCK_USER',
  'UNBLOCK_USER',
  'LOGIN',
];

// Audit trail entry: WHO did WHAT, to WHICH resource, and WHEN.
// `target` is a dynamic reference (refPath) so a log can be linked back to the
// original document in any collection named by `targetModel`.
const auditLogSchema = new mongoose.Schema(
  {
    // WHO
    actor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    actorUsername: { type: String }, // denormalised so logs survive user deletion

    // WHAT
    action: { type: String, enum: AUDIT_ACTIONS, required: true },
    status: { type: String, enum: ['SUCCESS', 'FAILURE'], default: 'SUCCESS' },

    // WHICH resource (optional link back to the original document)
    targetModel: { type: String, enum: ['User'] },
    target: { type: mongoose.Schema.Types.ObjectId, refPath: 'targetModel' },
    targetLabel: { type: String }, // denormalised name/email of the target

    // Extra context
    changes: { type: mongoose.Schema.Types.Mixed }, // { before, after } diff
    details: { type: String, default: '' },
    ip: { type: String },
    method: { type: String },
    path: { type: String },
  },
  { timestamps: true } // createdAt acts as the "WHEN"
);

// Common query paths: newest-first listing, and filtering by actor or action.
auditLogSchema.index({ createdAt: -1 });
auditLogSchema.index({ actor: 1, createdAt: -1 });
auditLogSchema.index({ action: 1, createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

module.exports = AuditLog;
module.exports.AUDIT_ACTIONS = AUDIT_ACTIONS;
