const Article = require('../models/Article');

// GET /search?q=...&tag=...&author=...&mode=text|regex&limit=...
// - mode=text (default): MongoDB $text search, sorted by relevance (textScore)
// - mode=regex: case-insensitive regex over title/body
// Combinable with tag/author filters.
exports.search = async (req, res, next) => {
  try {
    const { q, tag, author, mode } = req.query;

    if (!q || !q.trim()) {
      return res
        .status(400)
        .json({ success: false, message: 'Query parameter "q" is required' });
    }

    const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 20, 1), 100);

    // Additional filters that combine with the search
    const filters = {};
    if (tag) filters.tags = tag.toLowerCase();
    if (author) filters.author = author;

    let results;
    let usedMode;

    if (mode === 'regex') {
      // Regex search over title/body
      const rx = new RegExp(q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      const query = { $and: [{ $or: [{ title: rx }, { body: rx }] }, filters] };
      results = await Article.find(query).sort({ createdAt: -1 }).limit(limit);
      usedMode = 'regex';
    } else {
      // Full-text search sorted by relevance score
      const query = { $text: { $search: q }, ...filters };
      results = await Article.find(query, { score: { $meta: 'textScore' } })
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit);
      usedMode = 'text';
    }

    return res.status(200).json({
      success: true,
      mode: usedMode,
      query: q,
      count: results.length,
      data: results,
    });
  } catch (err) {
    return next(err);
  }
};
