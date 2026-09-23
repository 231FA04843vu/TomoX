const express = require('express');
const router = express.Router();
const Vendor = require('../models/Vendor');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const authVendor = require('../middleware/authVendor');

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

    res.json({
      vendor: {
        _id: vendor._id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone || "",
        notificationPreferences: normalizeNotificationPreferences(vendor.notificationPreferences),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to load vendor profile' });
  }
});

router.put('/me', authVendor, async (req, res) => {
  try {
    const { name, email, phone, notificationPreferences } = req.body || {};
    const vendor = await Vendor.findById(req.vendorId);
    if (!vendor) {
      return res.status(404).json({ message: 'Vendor not found' });
    }

    if (email && email !== vendor.email) {
      const exists = await Vendor.findOne({ email, _id: { $ne: vendor._id } });
      if (exists) {
        return res.status(400).json({ message: 'Email already in use' });
      }
      vendor.email = email;
    }

    if (name !== undefined) vendor.name = name;
    if (phone !== undefined) vendor.phone = phone;
    if (notificationPreferences && typeof notificationPreferences === 'object') {
      vendor.notificationPreferences = {
        email: notificationPreferences.email !== false,
        sms: notificationPreferences.sms !== false,
      };
    }

    const saved = await vendor.save();
    res.json({
      vendor: {
        _id: saved._id,
        name: saved.name,
        email: saved.email,
        phone: saved.phone || "",
        notificationPreferences: normalizeNotificationPreferences(saved.notificationPreferences),
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Failed to update vendor profile' });
  }
});

module.exports = router;
