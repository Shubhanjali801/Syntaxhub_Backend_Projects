const mongoose = require('mongoose');

// A sample resource that the scheduled "delete stale records" job operates on.
// A record is considered stale once `expiresAt` is in the past (or, if no
// expiry is set, once it is older than STALE_RECORD_DAYS — see the job).
const recordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    data: {
      type: String,
      default: '',
    },
    status: {
      type: String,
      enum: ['active', 'archived'],
      default: 'active',
    },
    expiresAt: {
      type: Date,
    },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Record', recordSchema);
