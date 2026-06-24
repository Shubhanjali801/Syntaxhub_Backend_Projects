const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const authorize = require('../middleware/authorize');
const { listJobs, triggerJob, getJobLogs } = require('../controllers/jobController');

// Managing/triggering scheduled jobs and reading their logs is admin-only.
router.use(protect, authorize('admin'));

router.get('/', listJobs);
router.get('/logs', getJobLogs);
router.post('/:name/run', triggerJob);

module.exports = router;
