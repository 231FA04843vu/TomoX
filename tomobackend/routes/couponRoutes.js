const express = require('express');
const router = express.Router();
const Coupon = require('../models/Coupon');
const authUser = require('../middleware/authUser');

// Validate coupon code
router.post('/validate', authUser, async (req, res) => {
  try {
    const { code, orderAmount } = req.body;
    
    if (!code) {
      return res.status(400).json({ message: 'Coupon code is required' });
    }

    const coupon = await Coupon.findOne({ 
      code: code.toUpperCase(),
      isActive: true 
    });

    if (!coupon) {
      return res.status(404).json({ message: 'Invalid coupon code' });
    }

    // Check if coupon is expired
    const now = new Date();
    if (now < coupon.validFrom || now > coupon.validUntil) {
      return res.status(400).json({ message: 'Coupon has expired' });
    }

    // Check usage limit
    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return res.status(400).json({ message: 'Coupon usage limit reached' });
    }

    // Check minimum order amount
    if (orderAmount < coupon.minOrderAmount) {
      return res.status(400).json({ 
        message: `Minimum order amount of ₹${coupon.minOrderAmount} required` 
      });
    }

    // Calculate discount
    let discountAmount = 0;
    if (coupon.discountType === 'percentage') {
      discountAmount = (orderAmount * coupon.discountValue) / 100;
      if (coupon.maxDiscountAmount && discountAmount > coupon.maxDiscountAmount) {
        discountAmount = coupon.maxDiscountAmount;
      }
    } else {
      discountAmount = coupon.discountValue;
    }

    return res.json({
      valid: true,
      code: coupon.code,
      discountAmount: Math.round(discountAmount),
      description: coupon.description
    });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to validate coupon' });
  }
});

// Get all active coupons (public for app sliders/offers)
router.get('/active', async (req, res) => {
  try {
    const now = new Date();
    const coupons = await Coupon.find({
      isActive: true,
      validFrom: { $lte: now },
      validUntil: { $gte: now },
      $or: [{ usageLimit: null }, { $expr: { $lt: ['$usedCount', '$usageLimit'] } }],
    }).select('code discountType discountValue minOrderAmount maxDiscountAmount description couponType validUntil usedCount usageLimit');

    return res.json(coupons);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch coupons' });
  }
});

// Company Admin: list all coupons
router.get('/all', async (req, res) => {
  try {
    const coupons = await Coupon.find().sort({ createdAt: -1 });
    return res.json(coupons);
  } catch (err) {
    return res.status(500).json({ message: 'Failed to fetch all coupons' });
  }
});

// Company Admin: create coupon
router.post('/', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      code: String(req.body.code || '').toUpperCase().trim(),
    };
    const coupon = await Coupon.create(payload);
    return res.status(201).json(coupon);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to create coupon' });
  }
});

// Company Admin: update coupon
router.put('/:id', async (req, res) => {
  try {
    const payload = {
      ...req.body,
      code: req.body.code ? String(req.body.code).toUpperCase().trim() : undefined,
    };

    const coupon = await Coupon.findByIdAndUpdate(req.params.id, payload, { new: true, runValidators: true });
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    return res.json(coupon);
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update coupon' });
  }
});

// Company Admin: delete coupon
router.delete('/:id', async (req, res) => {
  try {
    const coupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!coupon) return res.status(404).json({ message: 'Coupon not found' });

    return res.json({ message: 'Coupon deleted successfully' });
  } catch (err) {
    return res.status(500).json({ message: 'Failed to delete coupon' });
  }
});

module.exports = router;
