const mongoose = require('mongoose');

// A generic analytics record: think of it as a note/post/transaction with a
// category, author, a numeric amount (for sums) and an event date (for
// time-based grouping).
const recordSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      lowercase: true,
      default: 'general',
      index: true,
    },
    author: {
      type: String,
      trim: true,
      default: 'anonymous',
      index: true,
    },
    amount: {
      type: Number,
      default: 0,
      min: [0, 'Amount cannot be negative'],
    },
    date: {
      type: Date,
      default: Date.now, // event date used for per-month analytics
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Record', recordSchema);
