const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
  customerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
    }
  ],
  // Billing breakdown
  itemsSubtotal: { type: Number, required: true },
  couponCode: { type: String, default: '' },
  couponDiscount: { type: Number, default: 0 },
  deliveryCharges: { type: Number, default: 0 },
  distance: { type: Number, default: 0 }, // in kilometers
  tip: { type: Number, default: 0 },
  gst: { type: Number, default: 0 },
  totalDiscount: { type: Number, default: 0 },
  grandTotal: { type: Number, required: true },
  
  // Legacy field for backward compatibility
  totalPrice: { type: Number, required: true },
  
  paymentMethod: { type: String, default: 'cod' },
  customerName: String,
  customerAddress: String,
  customerPhone: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'out_for_delivery', 'rejected', 'delivered', 'completed'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Order', orderSchema);
