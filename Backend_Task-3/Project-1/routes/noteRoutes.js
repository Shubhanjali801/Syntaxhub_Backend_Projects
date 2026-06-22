const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const {
  createNote,
  getNotes,
  getNoteById,
  updateNote,
  archiveNote,
  deleteNote,
} = require('../controllers/noteController');

// All note routes are protected — owner is the authenticated user
router.use(protect);

router.post('/', createNote);
router.get('/', getNotes);
router.get('/:id', getNoteById);
router.put('/:id', updateNote);
router.patch('/:id/archive', archiveNote);
router.delete('/:id', deleteNote);

module.exports = router;
