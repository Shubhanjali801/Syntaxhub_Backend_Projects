const mongoose = require('mongoose');
const Note = require('../models/Note');

// Helper: find a note owned by the current user (returns null if not found/owned)
const findOwnedNote = (id, userId) => Note.findOne({ _id: id, user: userId, isDeleted: false });

// POST /notes  — create a note owned by the current user
exports.createNote = async (req, res, next) => {
  try {
    const { title, content, category } = req.body;
    const note = await Note.create({ title, content, category, user: req.user._id });
    return res.status(201).json({ success: true, data: note });
  } catch (err) {
    return next(err);
  }
};

// GET /notes  — list the current user's notes
// Query: ?archived=true|false  ?category=work
exports.getNotes = async (req, res, next) => {
  try {
    const { archived, category } = req.query;
    const filter = { user: req.user._id, isDeleted: false };
    if (archived === 'true') filter.isArchived = true;
    if (archived === 'false') filter.isArchived = false;
    if (category) filter.category = category.toLowerCase();

    const notes = await Note.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({ success: true, count: notes.length, data: notes });
  } catch (err) {
    return next(err);
  }
};

// GET /notes/:id  — single note (owner only), with author populated (Note -> User)
exports.getNoteById = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid note id' });
    }
    const note = await Note.findOne({
      _id: req.params.id,
      user: req.user._id,
      isDeleted: false,
    }).populate('user', 'username email');

    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }
    return res.status(200).json({ success: true, data: note });
  } catch (err) {
    return next(err);
  }
};

// PUT /notes/:id  — update (owner only)
exports.updateNote = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid note id' });
    }
    const note = await findOwnedNote(req.params.id, req.user._id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    const { title, content, category } = req.body;
    if (title !== undefined) note.title = title;
    if (content !== undefined) note.content = content;
    if (category !== undefined) note.category = category;
    await note.save();

    return res.status(200).json({ success: true, data: note });
  } catch (err) {
    return next(err);
  }
};

// PATCH /notes/:id/archive  — archive or unarchive (owner only)
// Body: { "archived": true|false }  (defaults to true)
exports.archiveNote = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid note id' });
    }
    const note = await findOwnedNote(req.params.id, req.user._id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.isArchived = req.body.archived === undefined ? true : !!req.body.archived;
    await note.save();

    return res.status(200).json({
      success: true,
      message: note.isArchived ? 'Note archived' : 'Note unarchived',
      data: note,
    });
  } catch (err) {
    return next(err);
  }
};

// DELETE /notes/:id  — soft-delete (owner only)
exports.deleteNote = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      return res.status(400).json({ success: false, message: 'Invalid note id' });
    }
    const note = await findOwnedNote(req.params.id, req.user._id);
    if (!note) {
      return res.status(404).json({ success: false, message: 'Note not found' });
    }

    note.isDeleted = true;
    await note.save();

    return res.status(200).json({ success: true, message: 'Note deleted (soft)', data: note });
  } catch (err) {
    return next(err);
  }
};
