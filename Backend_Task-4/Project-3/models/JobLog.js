const mongoose = require('mongoose');

// One row per job execution — the audit/result trail for scheduled work.
// Records what ran, how it was triggered, whether it succeeded, how long it
// took, and any result payload or error message.
const jobLogSchema = new mongoose.Schema(
  {
    job: { type: String, required: true }, // job name, e.g. deleteStaleRecords
    trigger: { type: String, enum: ['scheduled', 'manual'], default: 'scheduled' },
    status: { type: String, enum: ['running', 'success', 'failure'], default: 'running' },
    startedAt: { type: Date, default: Date.now },
    finishedAt: { type: Date },
    durationMs: { type: Number },
    result: { type: mongoose.Schema.Types.Mixed }, // job-specific summary on success
    error: { type: String }, // error message on failure
    triggeredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // set for manual runs
  },
  { timestamps: true }
);

jobLogSchema.index({ job: 1, createdAt: -1 });
jobLogSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('JobLog', jobLogSchema);
