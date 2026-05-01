const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// 📊 Get sales data for a vendor
router.get('/sales/:vendorId', async (req, res) => {
  try {
    const orders = await Order.find({
      vendorId: req.params.vendorId,
      status: 'delivered',
    });

    const salesByDate = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      salesByDate[date] = (salesByDate[date] || 0) + order.totalPrice;
    });

    const labels = Object.keys(salesByDate).sort();
    const data = labels.map((label) => salesByDate[label]);

    res.json({ labels, data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch sales data' });
  }
});

module.exports = router;
