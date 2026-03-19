const multer = require('multer');

// Use memory storage - file goes to Cloudinary, not disk
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('শুধু image file দিন'), false);
  }
});

module.exports = upload;
