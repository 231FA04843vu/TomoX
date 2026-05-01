const mongoose = require('mongoose');

const vendorRequestSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  proofFile: { type: String }, // uploaded document path
  approved: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('VendorRequest', vendorRequestSchema);
