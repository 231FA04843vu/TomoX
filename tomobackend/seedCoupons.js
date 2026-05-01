const mongoose = require('mongoose');
const Coupon = require('./models/Coupon');
require('dotenv').config();

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/tomox';

// Helper to create dates relative to now
const addTime = (hours = 0, days = 0) => {
  return new Date(Date.now() + (hours * 60 * 60 * 1000) + (days * 24 * 60 * 60 * 1000));
};

const sampleCoupons = [
  {
    code: 'FLASH30',
    discountType: 'percentage',
    discountValue: 20,
    minOrderAmount: 150,
    maxDiscountAmount: 60,
    validFrom: new Date(),
    validUntil: addTime(0.5), // Expires in 30 minutes
    isActive: true,
    usageLimit: 30,
    usedCount: 18,
    couponType: 'flash',
    description: 'Flash Deal! Get 20% off up to ₹60 - Hurry, expires in 30 mins!'
  },
  {
    code: 'URGENT2H',
    discountType: 'fixed',
    discountValue: 80,
    minOrderAmount: 300,
    maxDiscountAmount: null,
    validFrom: new Date(),
    validUntil: addTime(2), // Expires in 2 hours
    isActive: true,
    usageLimit: 25,
    usedCount: 15,
    couponType: 'hot',
    description: 'Limited Time! Flat ₹80 off - Valid for 2 hours only!'
  },
  {
    code: 'TODAY10H',
    discountType: 'percentage',
    discountValue: 18,
    minOrderAmount: 250,
    maxDiscountAmount: 100,
    validFrom: new Date(),
    validUntil: addTime(10), // Expires in 10 hours
    isActive: true,
    usageLimit: 50,
    usedCount: 22,
    couponType: 'limited',
    description: 'Today\'s Deal! Get 18% off up to ₹100 - ends tonight!'
  },
  {
    code: 'FLASH50',
    discountType: 'percentage',
    discountValue: 15,
    minOrderAmount: 150,
    maxDiscountAmount: 50,
    validFrom: new Date(),
    validUntil: addTime(0, 2), // 2 days - expiring soon!
    isActive: true,
    usageLimit: 50,
    usedCount: 12,
    couponType: 'flash',
    description: 'Flash Sale! Get 15% off up to ₹50 on orders above ₹150'
  },
  {
    code: 'WELCOME50',
    discountType: 'percentage',
    discountValue: 10,
    minOrderAmount: 200,
    maxDiscountAmount: 50,
    validFrom: new Date(),
    validUntil: addTime(0, 30), // 30 days
    isActive: true,
    usageLimit: 100,
    usedCount: 35,
    couponType: 'welcome',
    description: 'Welcome offer! Get 10% off up to ₹50 on orders above ₹200'
  },
  {
    code: 'FLAT100',
    discountType: 'fixed',
    discountValue: 100,
    minOrderAmount: 500,
    maxDiscountAmount: null,
    validFrom: new Date(),
    validUntil: addTime(0, 15), // 15 days
    isActive: true,
    usageLimit: 50,
    usedCount: 8,
    couponType: 'save',
    description: 'Flat ₹100 off on orders above ₹500'
  },
  {
    code: 'SAVE25',
    discountType: 'percentage',
    discountValue: 25,
    minOrderAmount: 400,
    maxDiscountAmount: 150,
    validFrom: new Date(),
    validUntil: addTime(20), // 20 hours - less than a day
    isActive: true,
    usageLimit: 25,
    usedCount: 18,
    couponType: 'hot',
    description: 'Hot Deal! Get 25% off up to ₹150 - ends tomorrow!'
  },
  {
    code: 'FREESHIP',
    discountType: 'fixed',
    discountValue: 30,
    minOrderAmount: 250,
    maxDiscountAmount: null,
    validFrom: new Date(),
    validUntil: addTime(0, 60), // 60 days
    isActive: true,
    usageLimit: null,
    usedCount: 142,
    couponType: 'delivery',
    description: 'Free delivery! Get ₹30 off delivery charges on orders above ₹250'
  },
  {
    code: 'MEGA200',
    discountType: 'fixed',
    discountValue: 200,
    minOrderAmount: 1000,
    maxDiscountAmount: null,
    validFrom: new Date(),
    validUntil: addTime(0, 10), // 10 days
    isActive: true,
    usageLimit: 20,
    usedCount: 3,
    couponType: 'mega',
    description: 'Mega Saver! Flat ₹200 off on orders above ₹1000'
  },
  {
    code: 'BIGSAVE',
    discountType: 'percentage',
    discountValue: 30,
    minOrderAmount: 600,
    maxDiscountAmount: 200,
    validFrom: new Date(),
    validUntil: addTime(0, 3), // 3 days
    isActive: true,
    usageLimit: 30,
    usedCount: 22,
    couponType: 'save',
    description: 'Big Saver! Get 30% off up to ₹200 on orders above ₹600'
  },
  {
    code: 'FLAT50',
    discountType: 'fixed',
    discountValue: 50,
    minOrderAmount: 300,
    maxDiscountAmount: null,
    validFrom: new Date(),
    validUntil: addTime(0, 45), // 45 days
    isActive: true,
    usageLimit: null,
    usedCount: 89,
    couponType: 'standard',
    description: 'Flat ₹50 off on orders above ₹300'
  }
];

async function seedCoupons() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('📦 Connected to MongoDB');

    // Clear existing coupons
    await Coupon.deleteMany({});
    console.log('🗑️  Cleared existing coupons');

    // Insert sample coupons
    const result = await Coupon.insertMany(sampleCoupons);
    console.log(`✅ Successfully seeded ${result.length} coupons`);
    
    console.log('\n📋 Available Coupons:');
    result.forEach(coupon => {
      console.log(`  - ${coupon.code}: ${coupon.description}`);
    });

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding coupons:', error);
    process.exit(1);
  }
}

seedCoupons();
