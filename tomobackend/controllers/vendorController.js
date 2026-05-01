// controllers/vendorController.js
const PendingVendor = require('../models/PendingVendor');
const bcrypt = require('bcryptjs');

exports.registerVendor = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const file = req.file;

    if (!name || !email || !password || !file) {
      return res.status(400).json({ message: "All fields including proof file are required." });
    }

    const existing = await PendingVendor.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: "Email already submitted for approval." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newVendor = new PendingVendor({
      name,
      email,
      password: hashedPassword,
      phone,
      proofDocument: file.path,
    });

    await newVendor.save();
    res.status(201).json({ message: "Vendor request submitted for verification." });
  } catch (err) {
    console.error("Vendor registration error:", err);
    res.status(500).json({ message: "Server error during registration." });
  }
};
