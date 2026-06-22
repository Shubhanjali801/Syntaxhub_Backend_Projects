const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const File = require('../models/File');

// POST /upload  — upload an image, save metadata to MongoDB
exports.uploadFile = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

    const file = await File.create({
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      url,
      mimetype: req.file.mimetype,
      size: req.file.size,
    });

    return res.status(201).json({ success: true, data: file });
  } catch (err) {
    return next(err);
  }
};

// GET /files  — list all uploaded files
exports.getFiles = async (req, res, next) => {
  try {
    const files = await File.find().sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: files.length, data: files });
  } catch (err) {
    return next(err);
  }
};

// GET /files/:id  — return a file's metadata + URL
exports.getFileById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid file id' });
    }
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }
    return res.status(200).json({ success: true, data: file });
  } catch (err) {
    return next(err);
  }
};

// DELETE /files/:id  — remove from disk and DB
exports.deleteFile = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid file id' });
    }
    const file = await File.findById(req.params.id);
    if (!file) {
      return res.status(404).json({ success: false, message: 'File not found' });
    }

    // Remove the file from disk if it still exists
    fs.promises.unlink(file.path).catch(() => {});

    await file.deleteOne();
    return res.status(200).json({ success: true, message: 'File deleted', data: file });
  } catch (err) {
    return next(err);
  }
};
