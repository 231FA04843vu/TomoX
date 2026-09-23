const mongoose = require("mongoose");

const supportMessageSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: { type: String, default: "" },
  orderId: { type: String, default: "No order ID" },
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', default: null },
  senderType: { type: String, enum: ['customer', 'vendor'], default: 'customer' },
  issueType: { type: String, default: 'General' },
  message: { type: String, required: true },
  status: { type: String, default: "raised" },
  resolvedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model("SupportMessage", supportMessageSchema);
