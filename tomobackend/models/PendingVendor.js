const mongoose = require("mongoose");

const pendingVendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, default: "" },
  password: { type: String, required: true },
  proofDocument: { type: String }, // URL or file path
  status: { type: String, default: "pending" } // pending, approved, rejected
}, { timestamps: true });

module.exports = mongoose.model("PendingVendor", pendingVendorSchema);
