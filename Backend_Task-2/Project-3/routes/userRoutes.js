const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const {
  createUser,
  getUser,
  uploadPicture,
  getPicture,
  deletePicture,
} = require('../controllers/userController');

router.post('/', createUser);
router.get('/:id', getUser);

// Profile picture endpoints (field name: `image`)
router.post('/:id/picture', upload.single('image'), uploadPicture);
router.get('/:id/picture', getPicture);
router.delete('/:id/picture', deletePicture);

module.exports = router;
