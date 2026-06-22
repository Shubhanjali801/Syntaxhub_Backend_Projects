const express = require('express');
const router = express.Router();
const { createArticle, seedArticles, getArticles } = require('../controllers/articleController');

router.post('/', createArticle);
router.post('/seed', seedArticles);
router.get('/', getArticles);

module.exports = router;
