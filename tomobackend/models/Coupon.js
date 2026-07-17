const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true, uppercase: true },
  discountType: { 
    type: String, 
    enum: ['percentage', 'fixed'], 
    required: true 
  },
  discountValue: { type: Number, required: true },
  minOrderAmount: { type: Number, default: 0 },
  maxDiscountAmount: { type: Number, default: null },
  validFrom: { type: Date, default: Date.now },
  validUntil: { type: Date, required: true },
  isActive: { type: Boolean, default: true },
  usageLimit: { type: Number, default: null },
  usedCount: { type: Number, default: 0 },
  title: { type: String, default: '' },
  description: { type: String, default: '' },
  termsAndConditions: { type: [String], default: [] },
  couponType: { 
    type: String, 
    enum: ['flash', 'hot', 'limited', 'welcome', 'save', 'delivery', 'mega', 'standard'],
    default: 'standard'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Coupon', couponSchema);
