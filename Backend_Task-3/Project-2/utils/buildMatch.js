// Build a MongoDB $match stage filter from query params.
// Supports: author, category, from/to (date range on the `date` field).
const buildMatch = (query = {}) => {
  const match = {};
  if (query.author) match.author = query.author;
  if (query.category) match.category = String(query.category).toLowerCase();

  if (query.from || query.to) {
    match.date = {};
    if (query.from) {
      const d = new Date(query.from);
      if (!isNaN(d)) match.date.$gte = d;
    }
    if (query.to) {
      const d = new Date(query.to);
      if (!isNaN(d)) match.date.$lte = d;
    }
    if (Object.keys(match.date).length === 0) delete match.date;
  }

  return match;
};

module.exports = buildMatch;
