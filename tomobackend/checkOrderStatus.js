const mongoose = require('mongoose');
const Order = require('./models/Order');
require('dotenv').config();

async function check() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tomox');

  const orders = await Order.find().lean();
  console.log(`--- Total Orders: ${orders.length} ---`);
  const statusCounts = {};
  orders.forEach(o => {
    statusCounts[o.status] = (statusCounts[o.status] || 0) + 1;
  });
  console.log('Order Status Counts:', statusCounts);
  mongoose.disconnect();
}

check();
