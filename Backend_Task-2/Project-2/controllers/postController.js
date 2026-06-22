const mongoose = require('mongoose');
const Post = require('../models/Post');

// POST /posts  — Create a blog post
exports.createPost = async (req, res, next) => {
  try {
    const { title, body, author, tags } = req.body;
    const post = await Post.create({ title, body, author, tags });
    return res.status(201).json({ success: true, data: post });
  } catch (err) {
    return next(err);
  }
};

// GET /posts  — List with filtering, sorting and pagination
// Query: ?tag=node&author=john&from=2024-01-01&to=2024-12-31&sort=newest&page=1&limit=10
exports.getPosts = async (req, res, next) => {
  try {
    const { tag, author, from, to, sort } = req.query;

    // Build filter
    const filter = {};
    if (tag) filter.tags = tag.toLowerCase();
    if (author) filter.author = author;

    // Date range on createdAt
    if (from || to) {
      filter.createdAt = {};
      if (from) {
        const d = new Date(from);
        if (!isNaN(d)) filter.createdAt.$gte = d;
      }
      if (to) {
        const d = new Date(to);
        if (!isNaN(d)) filter.createdAt.$lte = d;
      }
      if (Object.keys(filter.createdAt).length === 0) delete filter.createdAt;
    }

    // Pagination
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 100);
    const skip = (page - 1) * limit;

    // Sorting: newest (default) or oldest
    const sortOption = sort === 'oldest' ? { createdAt: 1 } : { createdAt: -1 };

    const [posts, total] = await Promise.all([
      Post.find(filter).sort(sortOption).skip(skip).limit(limit),
      Post.countDocuments(filter),
    ]);

    return res.status(200).json({
      success: true,
      count: posts.length,
      total,
      page,
      pages: Math.ceil(total / limit) || 1,
      data: posts,
    });
  } catch (err) {
    return next(err);
  }
};

// GET /posts/:id  — Get a single post by ID
exports.getPostById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid post id' });
    }
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return res.status(200).json({ success: true, data: post });
  } catch (err) {
    return next(err);
  }
};

// PUT /posts/:id  — Update a post
exports.updatePost = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid post id' });
    }
    const { title, body, author, tags } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { title, body, author, tags },
      { new: true, runValidators: true }
    );
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return res.status(200).json({ success: true, data: post });
  } catch (err) {
    return next(err);
  }
};

// DELETE /posts/:id  — Delete a post
exports.deletePost = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid post id' });
    }
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }
    return res.status(200).json({ success: true, message: 'Post deleted', data: post });
  } catch (err) {
    return next(err);
  }
};
