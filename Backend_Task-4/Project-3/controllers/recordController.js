const mongoose = require('mongoose');
const Record = require('../models/Record');

// POST /records  — create a record. `expiresAt` is optional; pass a past date to
// make the record immediately stale (handy for testing the cleanup job).
exports.createRecord = async (req, res, next) => {
  try {
    const { title, data, status, expiresAt } = req.body;
    if (!title) {
      return res.status(400).json({ success: false, message: 'title is required' });
    }

    const record = await Record.create({
      title,
      data,
      status,
      expiresAt,
      owner: req.user._id,
    });
    return res.status(201).json({ success: true, message: 'Record created', data: record });
  } catch (err) {
    return next(err);
  }
};

// GET /records  — list records (?status=active|archived, ?stale=true)
exports.listRecords = async (req, res, next) => {
  try {
    const { status, stale } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (stale === 'true') filter.expiresAt = { $lt: new Date() };

    const records = await Record.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: records.length, data: records });
  } catch (err) {
    return next(err);
  }
};

// DELETE /records/:id
exports.deleteRecord = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid record id' });
    }
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) {
      return res.status(404).json({ success: false, message: 'Record not found' });
    }
    return res.status(200).json({ success: true, message: 'Record deleted', data: record });
  } catch (err) {
    return next(err);
  }
};
