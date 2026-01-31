const { cloudinary } = require('../config/cloudinary');
const { ApiError } = require('./errors');
const streamifier = require('streamifier');

/**
 * Upload image to Cloudinary from buffer
 * @param {Buffer} fileBuffer - File buffer
 * @param {string} folder - Cloudinary folder (e.g., 'users' or 'products')
 * @param {string} publicId - Optional public ID for the image
 * @returns {Promise<Object>} - Upload result with URL and public_id
 */
const uploadImage = (fileBuffer, folder = 'rental-erp', publicId = null) => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: `${process.env.CLOUDINARY_FOLDER || 'rental-erp'}/${folder}`,
      resource_type: 'image',
      allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
      transformation: [
        { width: 1200, height: 1200, crop: 'limit' },
        { quality: 'auto', fetch_format: 'auto' }
      ]
    };

    if (publicId) {
      uploadOptions.public_id = publicId;
      uploadOptions.overwrite = true;
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) {
          reject(new ApiError(`Image upload failed: ${error.message}`, 500));
        } else {
          resolve({
            url: result.secure_url,
            public_id: result.public_id,
            width: result.width,
            height: result.height,
            format: result.format
          });
        }
      }
    );

    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};

/**
 * Delete image from Cloudinary
 * @param {string} publicId - Public ID of the image to delete
 * @returns {Promise<Object>} - Delete result
 */
const deleteImage = async (publicId) => {
  try {
    if (!publicId) {
      throw new ApiError('Public ID is required', 400);
    }

    const result = await cloudinary.uploader.destroy(publicId);
    
    if (result.result !== 'ok' && result.result !== 'not found') {
      throw new ApiError('Image deletion failed', 500);
    }

    return result;
  } catch (error) {
    throw new ApiError(`Image deletion failed: ${error.message}`, 500);
  }
};

/**
 * Delete multiple images from Cloudinary
 * @param {Array<string>} publicIds - Array of public IDs to delete
 * @returns {Promise<Object>} - Delete result
 */
const deleteImages = async (publicIds) => {
  try {
    if (!publicIds || publicIds.length === 0) {
      return { deleted: [] };
    }

    const result = await cloudinary.api.delete_resources(publicIds);
    return result;
  } catch (error) {
    throw new ApiError(`Batch image deletion failed: ${error.message}`, 500);
  }
};

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary image URL
 * @returns {string|null} - Public ID or null
 */
const extractPublicId = (url) => {
  if (!url || typeof url !== 'string') return null;
  
  try {
    const regex = /\/v\d+\/(.+)\.\w+$/;
    const match = url.match(regex);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
};

module.exports = {
  uploadImage,
  deleteImage,
  deleteImages,
  extractPublicId
};
