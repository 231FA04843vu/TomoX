// routes/pendingVendors.js
const express = require("express");
const router = express.Router();
const PendingVendor = require("../models/PendingVendor");

// GET all pending vendors
router.get("/", async (req, res) => {
  try {
    const vendors = await PendingVendor.find();
    res.json(vendors);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch pending vendors" });
  }
});

// DELETE a pending vendor (Reject)
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await PendingVendor.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.json({ message: "Vendor rejected and deleted." });
  } catch (err) {
    res.status(500).json({ error: "Rejection failed" });
  }
});

module.exports = router;
