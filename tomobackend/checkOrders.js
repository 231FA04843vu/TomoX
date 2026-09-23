const mongoose = require('mongoose');
const Order = require('./models/Order');
const Vendor = require('./models/Vendor');
const Restaurant = require('./models/restaurantModel');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tomox');

  const orders = await Order.find().lean();
  console.log(`--- Total Orders: ${orders.length} ---`);
  orders.slice(0, 3).forEach(o => console.log('Order ID:', o._id, 'VendorId:', o.vendorId));

  const vendors = await Vendor.find().lean();
  console.log(`\n--- Total Vendors: ${vendors.length} ---`);
  vendors.slice(0, 3).forEach(v => console.log('Vendor ID:', v._id, 'Email:', v.email));

  const rests = await Restaurant.find().lean();
  console.log(`\n--- Total Restaurants: ${rests.length} ---`);
  rests.slice(0, 3).forEach(r => console.log('Restaurant ID:', r._id, 'VendorId:', r.vendorId, 'Name:', r.name));

  mongoose.disconnect();
}

check();
