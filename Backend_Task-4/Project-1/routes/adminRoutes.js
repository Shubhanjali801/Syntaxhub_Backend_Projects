const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const {
  listUsers,
  getUser,
  blockUser,
  unblockUser,
  promoteUser,
  demoteUser,
  deleteUser,
  getAuditLogs,
} = require('../controllers/adminController');

// All admin routes require a valid token AND the admin role
router.use(protect, authorize('admin'));

router.get('/users', listUsers);
router.get('/users/:id', getUser);
router.patch('/users/:id/block', blockUser);
router.patch('/users/:id/unblock', unblockUser);
router.patch('/users/:id/promote', promoteUser);
router.patch('/users/:id/demote', demoteUser);
router.delete('/users/:id', deleteUser);
router.get('/audit', getAuditLogs);

module.exports = router;
