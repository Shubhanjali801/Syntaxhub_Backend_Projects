const express = require('express');
const router = express.Router();
const protect = require('../middleware/authMiddleware');
const { createRecord, listRecords, deleteRecord } = require('../controllers/recordController');

// Records are the data the scheduled jobs act on. Any authenticated user may
// manage them.
router.use(protect);

router.post('/', createRecord);
router.get('/', listRecords);
router.delete('/:id', deleteRecord);

module.exports = router;
