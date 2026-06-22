const mongoose = require('mongoose');

const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      minlength: [2, 'Title must be at least 2 characters'],
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
    },
    author: {
      type: String,
      required: [true, 'Author is required'],
      trim: true,
      index: true,
    },
    tags: {
      type: [String],
      default: [],
      set: (tags) =>
        Array.isArray(tags) ? tags.map((t) => String(t).trim().toLowerCase()).filter(Boolean) : [],
      index: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Post', postSchema);
