const express = require('express');
const router = express.Router();
const {
  byCategory,
  byMonth,
  byAuthor,
  summary,
} = require('../controllers/analyticsController');

router.get('/by-category', byCategory);
router.get('/by-month', byMonth);
router.get('/by-author', byAuthor);
router.get('/summary', summary);

module.exports = router;
