const express = require('express');
const router = express.Router();
const Restaurant = require('../models/restaurantModel');
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

// ✅ GET /api/vendor-menu/menu - Get menu
router.get('/menu', verifyVendor, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ vendorId: req.vendorId });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    res.json(restaurant.menu || []);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ POST /api/vendor-menu/menu - Add menu item
router.post('/menu', verifyVendor, async (req, res) => {
  const { name, price, image, description, category } = req.body;

  if (!name || !price) {
    return res.status(400).json({ message: "Name and price are required" });
  }

  try {
    const restaurant = await Restaurant.findOne({ vendorId: req.vendorId });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const newItem = {
      id: Date.now().toString(),
      name,
      price: Number(price),
      image: image || '',
      description: description || '',
      category: category || 'General',
      available: true,
    };

    restaurant.menu.push(newItem);
    await restaurant.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('menu-updated', { restaurantId: restaurant._id, vendorId: req.vendorId });
    }

    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ message: "Failed to add item" });
  }
});

// ✅ DELETE /api/vendor-menu/menu/:id - Delete menu item
router.delete('/menu/:id', verifyVendor, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ vendorId: req.vendorId });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    restaurant.menu = restaurant.menu.filter(item => item.id !== req.params.id && item._id?.toString() !== req.params.id);
    await restaurant.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('menu-updated', { restaurantId: restaurant._id, vendorId: req.vendorId });
    }

    res.json({ message: "Item deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete item" });
  }
});

// ✅ PUT /api/vendor-menu/menu/:id/toggle - Toggle availability
router.put('/menu/:id/toggle', verifyVendor, async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ vendorId: req.vendorId });
    if (!restaurant) return res.status(404).json({ message: "Restaurant not found" });

    const item = restaurant.menu.find(i => i.id === req.params.id || i._id?.toString() === req.params.id);
    if (!item) return res.status(404).json({ message: "Menu item not found" });

    item.available = !item.available;
    await restaurant.save();

    const io = req.app.get('io');
    if (io) {
      io.emit('menu-updated', { restaurantId: restaurant._id, vendorId: req.vendorId });
    }

    res.json({ message: "Availability toggled", available: item.available });
  } catch (err) {
    res.status(500).json({ message: "Failed to toggle availability" });
  }
});

module.exports = router;
