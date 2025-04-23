const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../utils/cloudinary');

// Debug cloudinary configuration
console.log("Initializing Cloudinary storage with:", {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME,
  folder: 'services'
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'services',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }]
  }
});

// Create parser with detailed error handling
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Accept only image files
    if (file.mimetype.startsWith('image/')) {
      console.log(`File accepted: ${file.originalname}, mimetype: ${file.mimetype}`);
      cb(null, true);
    } else {
      console.log(`File rejected: ${file.originalname}, mimetype: ${file.mimetype}`);
      cb(new Error('Only image files are allowed!'), false);
    }
  }
});

module.exports = upload;