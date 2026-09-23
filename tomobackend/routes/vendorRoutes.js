const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { registerVendor } = require('../controllers/vendorController');

router.post('/register', upload.any(), registerVendor);

module.exports = router;
