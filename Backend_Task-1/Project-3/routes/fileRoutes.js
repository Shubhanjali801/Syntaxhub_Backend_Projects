const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  uploadFile,
  getFiles,
  getFileById,
  deleteFile,
} = require('../controllers/fileController');

// `image` is the form-data field name
router.post('/upload', upload.single('image'), uploadFile);
router.get('/files', getFiles);
router.get('/files/:id', getFileById);
router.delete('/files/:id', deleteFile);

module.exports = router;
