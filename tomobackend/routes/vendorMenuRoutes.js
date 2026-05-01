const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const jwt = require('jsonwebtoken');

// ✅ Middleware to verify Vendor JWT
const verifyVendor = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.vendorId = decoded.id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

// ✅ GET /api/vendors/menu - Get menu
router.get('/menu', verifyVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    res.json(vendor.menu);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST /api/vendors/menu - Add menu item
router.post('/menu', verifyVendor, async (req, res) => {
  const { name, price, image, description } = req.body;

  if (!name || !price || !image) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const vendor = await Vendor.findById(req.vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const newItem = {
      name,
      price,
      image,
      description,
      available: true,
    };

    vendor.menu.push(newItem);
    await vendor.save();

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: "Failed to add item" });
  }
});

// ✅ DELETE /api/vendors/menu/:id - Delete menu item
router.delete('/menu/:id', verifyVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    vendor.menu = vendor.menu.filter(item => item._id.toString() !== req.params.id);
    await vendor.save();

    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item" });
  }
});

// ✅ PUT /api/vendors/menu/:id/toggle - Toggle availability
router.put('/menu/:id/toggle', verifyVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId);
    if (!vendor) return res.status(404).json({ message: "Vendor not found" });

    const item = vendor.menu.id(req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    item.available = !item.available;
    await vendor.save();

    res.json({ message: "Availability toggled", available: item.available });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle availability" });
  }
});

module.exports = router;
