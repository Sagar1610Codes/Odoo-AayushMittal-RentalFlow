const cloudinaryService = require('../utils/cloudinary.service');
const { ApiError } = require('../utils/errors');
const pool = require('../config/database');

/**
 * Upload user profile image
 */
const uploadUserProfileImage = async (req, res, next) => {
  try {
    if (!req.file) {
      throw new ApiError('No file uploaded', 400);
    }

    const userId = req.user.id;

    // Get current profile image to delete old one
    const userResult = await pool.query(
      'SELECT profile_image FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError('User not found', 404);
    }

    const oldProfileImage = userResult.rows[0].profile_image;

    // Upload new image to Cloudinary
    const uploadResult = await cloudinaryService.uploadImage(
      req.file.buffer,
      'users',
      `user_${userId}`
    );

    // Update user profile image in database
    await pool.query(
      'UPDATE users SET profile_image = $1, updated_at = NOW() WHERE id = $2',
      [uploadResult.url, userId]
    );

    // Delete old image from Cloudinary if exists
    if (oldProfileImage) {
      const oldPublicId = cloudinaryService.extractPublicId(oldProfileImage);
      if (oldPublicId) {
        await cloudinaryService.deleteImage(oldPublicId).catch(err => {
          console.error('Failed to delete old profile image:', err);
        });
      }
    }

    res.status(200).json({
      success: true,
      data: {
        imageUrl: uploadResult.url,
        publicId: uploadResult.public_id
      },
      message: 'Profile image uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete user profile image
 */
const deleteUserProfileImage = async (req, res, next) => {
  try {
    const userId = req.user.id;

    // Get current profile image
    const userResult = await pool.query(
      'SELECT profile_image FROM users WHERE id = $1',
      [userId]
    );

    if (userResult.rows.length === 0) {
      throw new ApiError('User not found', 404);
    }

    const profileImage = userResult.rows[0].profile_image;

    if (!profileImage) {
      throw new ApiError('No profile image to delete', 400);
    }

    // Delete from Cloudinary
    const publicId = cloudinaryService.extractPublicId(profileImage);
    if (publicId) {
      await cloudinaryService.deleteImage(publicId);
    }

    // Update database
    await pool.query(
      'UPDATE users SET profile_image = NULL, updated_at = NOW() WHERE id = $1',
      [userId]
    );

    res.status(200).json({
      success: true,
      message: 'Profile image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload product images
 */
const uploadProductImages = async (req, res, next) => {
  try {
    if (!req.files || req.files.length === 0) {
      throw new ApiError('No files uploaded', 400);
    }

    const { productId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Verify product ownership
    const productResult = await pool.query(
      'SELECT vendor_id, images FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      throw new ApiError('Product not found', 404);
    }

    const product = productResult.rows[0];

    if (userRole !== 'ADMIN' && product.vendor_id !== userId) {
      throw new ApiError('Not authorized to upload images for this product', 403);
    }

    // Upload all images to Cloudinary
    const uploadPromises = req.files.map((file, index) =>
      cloudinaryService.uploadImage(
        file.buffer,
        'products',
        `product_${productId}_${Date.now()}_${index}`
      )
    );

    const uploadResults = await Promise.all(uploadPromises);
    const imageUrls = uploadResults.map(result => result.url);

    // Get existing images
    const existingImages = product.images || [];
    const updatedImages = [...existingImages, ...imageUrls];

    // Update product images in database
    await pool.query(
      'UPDATE products SET images = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(updatedImages), productId]
    );

    res.status(200).json({
      success: true,
      data: {
        uploadedImages: imageUrls,
        allImages: updatedImages
      },
      message: 'Product images uploaded successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Delete product image
 */
const deleteProductImage = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const { imageUrl } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    if (!imageUrl) {
      throw new ApiError('Image URL is required', 400);
    }

    // Verify product ownership
    const productResult = await pool.query(
      'SELECT vendor_id, images FROM products WHERE id = $1',
      [productId]
    );

    if (productResult.rows.length === 0) {
      throw new ApiError('Product not found', 404);
    }

    const product = productResult.rows[0];

    if (userRole !== 'ADMIN' && product.vendor_id !== userId) {
      throw new ApiError('Not authorized to delete images from this product', 403);
    }

    const existingImages = product.images || [];
    
    if (!existingImages.includes(imageUrl)) {
      throw new ApiError('Image not found in product', 404);
    }

    // Delete from Cloudinary
    const publicId = cloudinaryService.extractPublicId(imageUrl);
    if (publicId) {
      await cloudinaryService.deleteImage(publicId);
    }

    // Remove from array
    const updatedImages = existingImages.filter(img => img !== imageUrl);

    // Update database
    await pool.query(
      'UPDATE products SET images = $1, updated_at = NOW() WHERE id = $2',
      [JSON.stringify(updatedImages), productId]
    );

    res.status(200).json({
      success: true,
      data: {
        remainingImages: updatedImages
      },
      message: 'Product image deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadUserProfileImage,
  deleteUserProfileImage,
  uploadProductImages,
  deleteProductImage
};
