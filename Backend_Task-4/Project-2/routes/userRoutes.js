const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const {
  listUsers,
  getUser,
  updateUser,
  blockUser,
  unblockUser,
  deleteUser,
} = require('../controllers/userController');

// User management is admin-only; every sensitive action here is audit-logged.
router.use(protect, authorize('admin'));

router.get('/', listUsers);
router.get('/:id', getUser);
router.patch('/:id', updateUser);
router.patch('/:id/block', blockUser);
router.patch('/:id/unblock', unblockUser);
router.delete('/:id', deleteUser);

module.exports = router;
