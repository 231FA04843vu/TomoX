const express = require("express");
const router = express.Router();
const Vendor = require("../models/Vendor");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const JWT_SECRET = process.env.JWT_SECRET || "your_secret_key"; // keep this in .env

// POST /api/vendor-auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const vendor = await Vendor.findOne({ email });
    if (!vendor) {
      return res.status(404).json({ message: "Vendor not found or not approved" });
    }

    const isMatch = await bcrypt.compare(password, vendor.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: vendor._id, email: vendor.email },
      JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      vendor: {
        id: vendor._id,
        name: vendor.name,
        email: vendor.email,
      },
    });
  } catch (err) {
    console.error("Vendor login failed:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

module.exports = router;
