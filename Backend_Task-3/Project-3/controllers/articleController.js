const Article = require('../models/Article');

// POST /articles  — create an article
exports.createArticle = async (req, res, next) => {
  try {
    const { title, body, author, tags } = req.body;
    const article = await Article.create({ title, body, author, tags });
    return res.status(201).json({ success: true, data: article });
  } catch (err) {
    return next(err);
  }
};

// POST /articles/seed  — bulk insert (handy for testing search)
exports.seedArticles = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body.articles;
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Provide an array of articles (or { articles: [...] })' });
    }
    const inserted = await Article.insertMany(items);
    return res.status(201).json({ success: true, count: inserted.length, data: inserted });
  } catch (err) {
    return next(err);
  }
};

// GET /articles  — list all
exports.getArticles = async (req, res, next) => {
  try {
    const articles = await Article.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: articles.length, data: articles });
  } catch (err) {
    return next(err);
  }
};
