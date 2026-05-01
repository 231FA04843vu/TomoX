const mongoose = require('mongoose');

const menuItemSchema = mongoose.Schema(
  {
    id: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    price: { type: Number, required: true },
    image: { type: String },
    available: { type: Boolean, default: true }
  },
  { _id: false }
);

const restaurantSchema = mongoose.Schema(
  {
    vendorId: { type: mongoose.Schema.Types.ObjectId, ref: 'Vendor', required: true },
    name: { type: String, required: true },
    location: { type: String, required: true },
    cuisine: { type: [String], required: true },
    logo: { type: String, required: true },
    menu: [menuItemSchema],
    rating: { type: Number, default: 4 }
  },
  { timestamps: true }
);

const Restaurant = mongoose.model('Restaurant', restaurantSchema);

module.exports = Restaurant;
