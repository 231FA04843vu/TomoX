const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authVendor = require('../middleware/authVendor');
const PendingVendor = require('../models/PendingVendor');
const Restaurant = require('../models/restaurantModel');

const normalizeNotificationPreferences = (raw) => ({
  email: raw?.email !== false,
  sms: raw?.sms !== false,
});

// ✅ Vendor OTP Routes
router.post('/send-otp', (req, res) => {
  const { phone } = req.body;
  console.log("==============================");
  console.log("🚀 Send OTP API Hit");
  console.log("➡️ Phone:", phone);
  console.log("==============================");
  // Mock sending OTP
  res.json({ success: true, message: 'OTP sent successfully' });
});

router.post('/verify-otp', async (req, res) => {
  const { phone, otp } = req.body;
  console.log("==============================");
  console.log("🚀 Verify OTP API Hit");
  console.log("➡️ Phone:", phone, "OTP:", otp);
  console.log("==============================");

  if (otp !== '111111') {
    return res.status(401).json({ message: 'Invalid OTP' });
  }

  try {
    const vendor = await Vendor.findOne({ phone });
    console.log("🔍 Vendor found by phone:", vendor);

    if (!vendor) {
      // Check if they are pending approval
      const pendingVendor = await PendingVendor.findOne({ phone });
      if (pendingVendor) {
        return res.json({
          isPending: true,
          vendor: pendingVendor
        });
      }

      // User not found -> go to onboarding
      return res.json({
        isNewUser: true,
        phone,
      });
    }

    const token = jwt.sign(
      { _id: vendor._id, email: vendor.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log("🔐 Token Generated for:", vendor.email);

    res.json({
      isNewUser: false,
      token,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone || "",
        notificationPreferences: normalizeNotificationPreferences(vendor.notificationPreferences),
      },
    });

  } catch (err) {
    console.error("💥 Server Error:", err);
    res.status(500).json({ message: 'Server error during OTP verification' });
  }
});

// ✅ Legacy Vendor Login Route (Email/Password)
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  console.log("==============================");
  console.log("🚀 Login API Hit");
  console.log("➡️ Email:", email);
  console.log("==============================");

  try {
    const vendor = await Vendor.findOne({ email });
    console.log("🔍 Vendor found:", vendor);

    if (!vendor) {
      const pendingVendor = await PendingVendor.findOne({ email });
      if (pendingVendor) {
        return res.json({
          isPending: true,
          vendor: pendingVendor
        });
      }
      return res.status(404).json({ message: 'Vendor not found' });
    }

    console.log("🔑 Stored Password Hash:", vendor.password);

    const passwordHash = vendor.password.startsWith('$2y$')
      ? vendor.password.replace('$2y$', '$2b$')
      : vendor.password;

    const isMatch = await bcrypt.compare(password, passwordHash);
    console.log("✅ Password Match Result:", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { _id: vendor._id, email: vendor.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    console.log("🔐 Token Generated:", token);

    res.json({
      token,
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone || "",
        notificationPreferences: normalizeNotificationPreferences(vendor.notificationPreferences),
      },
    });

    console.log("✅ Login Successful for:", email);
    console.log("==============================");
  } catch (err) {
    console.error("💥 Server Error:", err);
    res.status(500).json({ message: 'Server error during login' });
  }
});

router.get('/me', authVendor, async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.vendorId).select('-password');
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    res.json({ vendor });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load vendor profile' });
  }
});

router.put('/me', authVendor, async (req, res) => {
  try {
    const updateData = req.body || {};
    const vendor = await Vendor.findById(req.vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    // Explicitly prevent updating restricted fields per user request
    const restrictedFields = ['_id', 'id', 'password'];
    
    for (const key in updateData) {
      if (!restrictedFields.includes(key)) {
        if (key === 'notificationPreferences' && typeof updateData[key] === 'object') {
          vendor.notificationPreferences = {
            email: updateData[key].email !== false,
            sms: updateData[key].sms !== false,
          };
        } else {
          vendor[key] = updateData[key];
        }
      }
    }

    const saved = await vendor.save();
    
    // Sync to Restaurant model if it exists
    const restaurant = await Restaurant.findOne({ vendorId: vendor._id });
    if (restaurant) {
      if (updateData.restaurantName) restaurant.name = updateData.restaurantName;
      if (updateData.restaurantAddress) restaurant.location = updateData.restaurantAddress;
      if (updateData.coordinates) restaurant.coordinates = updateData.coordinates;
      await restaurant.save();
    }
    
    // Convert to plain object and remove password
    const savedObj = saved.toObject();
    delete savedObj.password;
    
    res.json({ vendor: savedObj });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update vendor profile' });
  }
});

router.delete('/me', authVendor, async (req, res) => {
  try {
    const vendorId = req.vendorId;
    
    // Find and delete the vendor
    const vendor = await Vendor.findByIdAndDelete(vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }
    
    // Delete the associated restaurant to remove it from the customer app
    await Restaurant.findOneAndDelete({ vendorId });
    
    res.json({ message: 'Account and associated restaurant deleted successfully' });
  } catch (err) {
    console.error("Delete account error:", err);
    res.status(500).json({ message: 'Failed to delete account' });
  }
});

module.exports = router;
