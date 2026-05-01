const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { registerVendor } = require('../controllers/vendorController');

router.post('/register', upload.single('proof'), registerVendor);

module.exports = router;
