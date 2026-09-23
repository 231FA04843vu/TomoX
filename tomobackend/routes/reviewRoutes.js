const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Restaurant = require('../models/restaurantModel');
const jwt = require('jsonwebtoken');

// Middleware to verify User
const verifyUser = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "changeme");
    req.userId = decoded.id || decoded._id;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

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

// POST /api/reviews - Create a review
router.post('/', verifyUser, async (req, res) => {
  try {
    const { orderId, restaurantId, vendorId, rating, comment, customerName } = req.body;
    
    // Check if review already exists
    const existing = await Review.findOne({ orderId });
    if (existing) {
      return res.status(400).json({ message: "Review already submitted for this order" });
    }

    const review = new Review({
      orderId,
      restaurantId,
      vendorId,
      customerId: req.userId,
      customerName,
      rating: Number(rating),
      comment
    });

    await review.save();

    // Update restaurant average rating
    const allReviews = await Review.find({ restaurantId });
    const avgRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0) / allReviews.length;
    await Restaurant.findByIdAndUpdate(restaurantId, { rating: avgRating });

    // Emit to vendor
    const io = req.app.get('io');
    if (io) {
      io.to(`vendor:${vendorId}`).emit('new-review', review);
    }

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ message: "Failed to create review", error: err.message });
  }
});

// GET /api/reviews/vendor - Get reviews for a vendor
router.get('/vendor', verifyVendor, async (req, res) => {
  try {
    const reviews = await Review.find({ vendorId: req.vendorId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch reviews" });
  }
});

// PUT /api/reviews/:id/resolve - Resolve a review (Vendor)
router.put('/:id/resolve', verifyVendor, async (req, res) => {
  try {
    const { reply } = req.body;
    const review = await Review.findOneAndUpdate(
      { _id: req.params.id, vendorId: req.vendorId },
      { isResolved: true, reply },
      { new: true }
    );
    if (!review) return res.status(404).json({ message: "Review not found" });
    res.json(review);
  } catch (err) {
    res.status(500).json({ message: "Failed to resolve review" });
  }
});

module.exports = router;
