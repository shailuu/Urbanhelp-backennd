const cloudinary = require('cloudinary').v2;

// Log configuration values (avoid logging secrets in production)
console.log("Configuring Cloudinary with cloud name:", process.env.CLOUDINARY_CLOUD_NAME);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Add a simple test to verify configuration
cloudinary.api.ping((error, result) => {
  if (error) {
    console.error("Cloudinary configuration error:", error);
  } else {
    console.log("Cloudinary configured successfully:", result);
  }
});

module.exports = cloudinary;