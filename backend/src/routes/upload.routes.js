const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/upload.controller');
const { authenticate } = require('../middleware/auth.middleware');
const { uploadSingle, uploadMultiple } = require('../middleware/upload.middleware');

// User profile image routes
router.post(
  '/user/profile-image',
  authenticate,
  uploadSingle('profileImage'),
  uploadController.uploadUserProfileImage
);

router.delete(
  '/user/profile-image',
  authenticate,
  uploadController.deleteUserProfileImage
);

// Product images routes
router.post(
  '/product/:productId/images',
  authenticate,
  uploadMultiple('productImages', 5),
  uploadController.uploadProductImages
);

router.delete(
  '/product/:productId/image',
  authenticate,
  uploadController.deleteProductImage
);

module.exports = router;
