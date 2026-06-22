const Record = require('../models/Record');
const buildMatch = require('../utils/buildMatch');

// POST /records  — create a record
exports.createRecord = async (req, res, next) => {
  try {
    const { title, category, author, amount, date } = req.body;
    const record = await Record.create({ title, category, author, amount, date });
    return res.status(201).json({ success: true, data: record });
  } catch (err) {
    return next(err);
  }
};

// POST /records/seed  — bulk insert (handy for testing analytics)
exports.seedRecords = async (req, res, next) => {
  try {
    const items = Array.isArray(req.body) ? req.body : req.body.records;
    if (!Array.isArray(items) || items.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: 'Provide an array of records (or { records: [...] })' });
    }
    const inserted = await Record.insertMany(items);
    return res.status(201).json({ success: true, count: inserted.length, data: inserted });
  } catch (err) {
    return next(err);
  }
};

// GET /records  — list with optional filters (author, category, from/to)
exports.getRecords = async (req, res, next) => {
  try {
    const filter = buildMatch(req.query);
    const records = await Record.find(filter).sort({ date: -1 });
    return res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    return next(err);
  }
};
