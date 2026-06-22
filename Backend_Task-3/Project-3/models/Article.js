const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
    },
    body: {
      type: String,
      required: [true, 'Body is required'],
      trim: true,
    },
    author: {
      type: String,
      trim: true,
      default: 'anonymous',
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

// Full-text index over searchable fields (title weighted higher than body)
articleSchema.index(
  { title: 'text', body: 'text' },
  { weights: { title: 5, body: 1 }, name: 'TextSearchIndex' }
);

module.exports = mongoose.model('Article', articleSchema);
