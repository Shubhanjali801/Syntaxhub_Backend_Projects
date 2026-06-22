const express = require('express');
const router = express.Router();
const { createRecord, seedRecords, getRecords } = require('../controllers/recordController');

router.post('/', createRecord);
router.post('/seed', seedRecords);
router.get('/', getRecords);

module.exports = router;
