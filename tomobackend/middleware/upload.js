const multer = require('multer');
const path = require('path');
const { getUploadSubdir } = require('../utils/uploadsPath');

// File storage configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, getUploadSubdir('proofs'));
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + '-' + file.originalname;
    cb(null, uniqueName);
  },
});

// File filter (accept only images or pdfs)
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['.png', '.jpg', '.jpeg', '.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedTypes.includes(ext)) cb(null, true);
  else cb(new Error('Only images and PDFs are allowed'));
};

const upload = multer({ storage, fileFilter });

module.exports = upload;
