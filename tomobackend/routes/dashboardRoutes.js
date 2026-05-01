const express = require('express');
const router = express.Router();
const { getDashboardStats } = require('../controllers/dashboardController');

// 📊 Get dashboard statistics for a vendor
router.get('/stats/:vendorId', getDashboardStats);
router.get('/:vendorId', getDashboardStats);

module.exports = router;
