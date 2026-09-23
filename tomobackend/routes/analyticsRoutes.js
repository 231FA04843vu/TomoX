const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const jwt = require('jsonwebtoken');

// Middleware to verify Vendor
const verifyVendor = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme");
    req.vendorId = decoded.id || decoded._id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// 📊 Get comprehensive analytics data for a vendor
router.get('/', verifyVendor, async (req, res) => {
  try {
    const orders = await Order.find({
      vendorId: req.vendorId,
      status: { $in: ['completed', 'delivered'] },
    });

    const salesByDate = {};
    let totalRevenue = 0;
    const itemsCount = {};

    orders.forEach((order) => {
      const date = new Date(order.createdAt).toISOString().split('T')[0];
      const revenue = order.grandTotal || order.totalPrice || 0;
      
      salesByDate[date] = (salesByDate[date] || 0) + revenue;
      totalRevenue += revenue;

      (order.items || []).forEach(item => {
        itemsCount[item.name] = (itemsCount[item.name] || 0) + (item.quantity || 1);
      });
    });

    const labels = Object.keys(salesByDate).sort();
    const data = labels.map((label) => salesByDate[label]);

    // Top selling items
    const topItems = Object.entries(itemsCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([name, count]) => ({ name, count }));

    res.json({ 
      totalOrders: orders.length,
      totalRevenue,
      averageOrderValue: orders.length > 0 ? (totalRevenue / orders.length).toFixed(2) : 0,
      chart: { labels, data },
      topItems
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch analytics data' });
  }
});

module.exports = router;
