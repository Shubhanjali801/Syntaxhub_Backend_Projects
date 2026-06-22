const Record = require('../models/Record');
const buildMatch = require('../utils/buildMatch');

// GET /analytics/by-category  — count + sum/avg amount grouped by category
// Filters: ?author=&from=&to=
exports.byCategory = async (req, res, next) => {
  try {
    const match = buildMatch(req.query);
    const data = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
        },
      },
      { $project: { _id: 0, category: '$_id', count: 1, totalAmount: 1, avgAmount: { $round: ['$avgAmount', 2] } } },
      { $sort: { count: -1, category: 1 } },
    ]);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    return next(err);
  }
};

// GET /analytics/by-month  — count + sum grouped by year-month of `date`
// Filters: ?author=&category=&from=&to=
exports.byMonth = async (req, res, next) => {
  try {
    const match = buildMatch(req.query);
    const data = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          period: {
            $concat: [
              { $toString: '$_id.year' },
              '-',
              {
                $cond: [
                  { $lt: ['$_id.month', 10] },
                  { $concat: ['0', { $toString: '$_id.month' }] },
                  { $toString: '$_id.month' },
                ],
              },
            ],
          },
          count: 1,
          totalAmount: 1,
        },
      },
      { $sort: { year: 1, month: 1 } },
    ]);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    return next(err);
  }
};

// GET /analytics/by-author  — count + sum grouped by author
exports.byAuthor = async (req, res, next) => {
  try {
    const match = buildMatch(req.query);
    const data = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: '$author',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
      { $project: { _id: 0, author: '$_id', count: 1, totalAmount: 1 } },
      { $sort: { count: -1, author: 1 } },
    ]);
    return res.status(200).json({ success: true, count: data.length, data });
  } catch (err) {
    return next(err);
  }
};

// GET /analytics/summary  — overall totals
exports.summary = async (req, res, next) => {
  try {
    const match = buildMatch(req.query);
    const [result] = await Record.aggregate([
      { $match: match },
      {
        $group: {
          _id: null,
          totalRecords: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          minAmount: { $min: '$amount' },
          maxAmount: { $max: '$amount' },
        },
      },
      {
        $project: {
          _id: 0,
          totalRecords: 1,
          totalAmount: 1,
          avgAmount: { $round: ['$avgAmount', 2] },
          minAmount: 1,
          maxAmount: 1,
        },
      },
    ]);

    return res.status(200).json({
      success: true,
      data: result || { totalRecords: 0, totalAmount: 0, avgAmount: 0, minAmount: 0, maxAmount: 0 },
    });
  } catch (err) {
    return next(err);
  }
};
