const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { getUploadsRoot } = require('../utils/uploadsPath');
const {
  hasCloudinaryConfig,
  uploadBufferToCloudinary,
} = require('../utils/cloudinaryStorage');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
});

// ✅ Upload Route (Fixed)
router.post('/', upload.single('image'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: 'No file uploaded' });
  }

  try {
    if (hasCloudinaryConfig()) {
      const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      const result = await uploadBufferToCloudinary({
        buffer: req.file.buffer,
        folder: 'tomox/uploads',
        publicId: unique,
        resourceType: 'image',
      });

      return res.json({
        url: result.secure_url,
        publicId: result.public_id,
        provider: 'cloudinary',
      });
    }

    const uploadsRoot = getUploadsRoot();
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const fileName = unique + path.extname(req.file.originalname);
    fs.writeFileSync(path.join(uploadsRoot, fileName), req.file.buffer);

    const filePath = `${req.protocol}://${req.get('host')}/uploads/${fileName}`;
    return res.json({ url: filePath, provider: 'local' });
  } catch (error) {
    return res.status(500).json({ error: 'Upload failed', details: error.message });
  }
});

module.exports = router;
