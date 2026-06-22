const fs = require('fs');
const mongoose = require('mongoose');
const User = require('../models/User');

// Helper: remove a file from disk, ignoring errors
const removeFromDisk = (filePath) => {
  if (filePath) fs.promises.unlink(filePath).catch(() => {});
};

// POST /users  — create a user (so we have someone to attach a picture to)
exports.createUser = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    const user = await User.create({ name, email });
    return res.status(201).json({ success: true, data: user });
  } catch (err) {
    if (err.code === 11000) {
      return res
        .status(409)
        .json({ success: false, message: 'A user with this email already exists' });
    }
    return next(err);
  }
};

// GET /users/:id  — get a user (includes profilePicture metadata)
exports.getUser = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    return next(err);
  }
};

// POST /users/:id/picture  — upload/replace the user's profile picture
exports.uploadPicture = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }

    const user = await User.findById(req.params.id);
    if (!user) {
      // No user — clean up the just-uploaded file so it doesn't orphan on disk
      if (req.file) removeFromDisk(req.file.path);
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }

    // If a picture already exists, remove the old file from disk (replace)
    if (user.profilePicture && user.profilePicture.path) {
      removeFromDisk(user.profilePicture.path);
    }

    const url = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    user.profilePicture = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      path: req.file.path,
      url,
      mimetype: req.file.mimetype,
      size: req.file.size,
      uploadedAt: new Date(),
    };
    await user.save();

    return res.status(200).json({ success: true, data: user });
  } catch (err) {
    if (req.file) removeFromDisk(req.file.path);
    return next(err);
  }
};

// GET /users/:id/picture  — return the picture's URL + metadata
exports.getPicture = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.profilePicture) {
      return res
        .status(404)
        .json({ success: false, message: 'This user has no profile picture' });
    }
    return res.status(200).json({ success: true, data: user.profilePicture });
  } catch (err) {
    return next(err);
  }
};

// DELETE /users/:id/picture  — remove file from disk and clear the field
exports.deletePicture = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid user id' });
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    if (!user.profilePicture) {
      return res
        .status(404)
        .json({ success: false, message: 'This user has no profile picture' });
    }

    removeFromDisk(user.profilePicture.path);
    user.profilePicture = null;
    await user.save();

    return res.status(200).json({ success: true, message: 'Profile picture removed', data: user });
  } catch (err) {
    return next(err);
  }
};
