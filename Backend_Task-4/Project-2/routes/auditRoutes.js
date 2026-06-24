const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { getLogs, getLog, getStats } = require('../controllers/auditController');

// Log-fetching endpoints are secured: valid token AND admin role.
router.use(protect, authorize('admin'));

router.get('/', getLogs);
router.get('/stats', getStats);
router.get('/:id', getLog);

module.exports = router;
