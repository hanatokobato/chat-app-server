const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_KEY,
  api_secret: process.env.CLOUDINARY_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: (req, file) => 'img/users',
    allowed_formats: (req, file) => {
      return ['jpg', 'png', 'jpeg'];
    },
    public_id: (req, file) => {
      return `user-${req.currentUser._id}-${Date.now()}`;
    },
  },
});

exports.cloudinaryStorage = storage;
