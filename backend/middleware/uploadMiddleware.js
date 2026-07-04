const multer = require('multer');
const sharp = require('sharp');
const streamifier = require('streamifier');
const cloudinary = require('../config/cloudinary');

// Use memory storage (no temp files on disk)
const storage = multer.memoryStorage();

// File filter - only images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

// Multer instance
const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // Allowed file size up to 10MB since server compresses it down!
  fileFilter,
});

/**
 * Upload an optimized buffer to Cloudinary using a stream
 * @param {Buffer} buffer - File buffer from multer memoryStorage
 * @param {string} folder - Cloudinary folder name
 * @returns {Promise<{url: string, publicId: string}>}
 */
const uploadToCloudinary = async (buffer, folder = 'elite-fashion/products') => {
  let optimizedBuffer = buffer;
  try {
    // Compress and resize image using sharp
    optimizedBuffer = await sharp(buffer)
      .resize({ width: 800, height: 1067, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 80 })
      .toBuffer();
  } catch (error) {
    console.error('Sharp compression failed, fallback to original buffer:', error.message);
  }

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'image',
      },
      (error, result) => {
        if (error) return reject(error);
        resolve({ url: result.secure_url, publicId: result.public_id });
      }
    );
    streamifier.createReadStream(optimizedBuffer).pipe(uploadStream);
  });
};

/**
 * Delete an image from Cloudinary by publicId
 * @param {string} publicId
 */
const deleteFromCloudinary = async (publicId) => {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Failed to delete image ${publicId}:`, error.message);
  }
};

module.exports = { upload, uploadToCloudinary, deleteFromCloudinary };
