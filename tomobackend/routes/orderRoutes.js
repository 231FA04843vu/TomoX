const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Order = require('../models/Order');
const User = require('../models/User');
const Restaurant = require('../models/restaurantModel');
const authUser = require('../middleware/authUser');
const authVendor = require('../middleware/authVendor');
const sendOrderConfirmationEmail = require('../utils/sendOrderConfirmationEmail');
const sendOrderStatusEmail = require('../utils/sendOrderStatusEmail');

// ✅ Customer App — Place an order
router.post('/', authUser, async (req, res) => {
  try {
    const { 
      vendorId, 
      items, 
      customerAddress,
      itemsSubtotal,
      couponCode,
      couponDiscount,
      deliveryCharges,
      distance,
      tip,
      gst,
      totalDiscount,
      grandTotal,
      paymentMethod
    } = req.body;
    
    if (!vendorId || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Invalid order payload' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const normalizedItems = items.map((item) => ({
      name: item.name,
      price: Number(item.price || 0),
      quantity: Number(item.quantity || 0),
    }));

    const calculatedSubtotal = normalizedItems.reduce(
      (acc, item) => acc + item.price * item.quantity,
      0
    );

    const order = await Order.create({
      vendorId,
      customerId: req.userId,
      items: normalizedItems,
      itemsSubtotal: itemsSubtotal || calculatedSubtotal,
      couponCode: couponCode || '',
      couponDiscount: couponDiscount || 0,
      deliveryCharges: deliveryCharges || 0,
      distance: distance || 0,
      tip: tip || 0,
      gst: gst || 0,
      totalDiscount: totalDiscount || 0,
      grandTotal: grandTotal || calculatedSubtotal,
      totalPrice: grandTotal || calculatedSubtotal, // For backward compatibility
      paymentMethod: paymentMethod || 'cod',
      customerName: user.name || user.email,
      customerAddress: customerAddress || '',
      customerPhone: user.phone || '',
    });
    // Emit socket event to vendor for new order notification
    const io = req.app.get('io');
    if (io) {
      io.to(`vendor:${vendorId}`).emit('new-order', {
        orderId: order._id,
        customerName: order.customerName,
        itemCount: normalizedItems.length,
        grandTotal: order.grandTotal,
        createdAt: order.createdAt
      });
    }


    // If coupon was used, increment usage count
    if (couponCode) {
      const Coupon = require('../models/Coupon');
      await Coupon.findOneAndUpdate(
        { code: couponCode.toUpperCase() },
        { $inc: { usedCount: 1 } }
      );
    }

    // Send order confirmation email (async, don't wait for it)
    if (user.email) {
      // Fetch restaurant details for email
      Restaurant.findOne({ vendorId })
        .then(restaurant => {
          const emailData = {
            email: user.email,
            name: user.name || user.email.split('@')[0],
            orderId: order._id,
            restaurantName: restaurant?.name || 'Partner Restaurant',
            restaurantLocation: restaurant?.location || '',
            items: normalizedItems,
            billing: {
              itemsSubtotal: order.itemsSubtotal,
              couponCode: order.couponCode,
              couponDiscount: order.couponDiscount,
              deliveryCharges: order.deliveryCharges,
              distance: order.distance,
              tip: order.tip,
              gst: order.gst,
              grandTotal: order.grandTotal,
            },
            address: order.customerAddress,
            phone: order.customerPhone,
            paymentMethod: order.paymentMethod,
            orderDate: order.createdAt,
          };
          return sendOrderConfirmationEmail(emailData);
        })
        .catch(emailError => {
          console.error('Failed to send order confirmation email:', emailError.message);
          // Don't fail the order if email fails
        });
    }

    return res.status(201).json({ orderId: order._id, order });
  } catch (err) {
    console.error('Order creation error:', err);
    return res.status(500).json({ error: 'Failed to place order' });
  }
});

// 🔥 Get all orders for a vendor
// 🔥 Vendor Portal — Get my orders (with auth)
router.get('/vendor/list', authVendor, async (req, res) => {
  try {
    const orders = await Order.find({ vendorId: req.vendorId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    console.error('Vendor orders fetch error:', err);
    res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// ✅ Customer App — Get my orders
router.get('/my/list', authUser, async (req, res) => {
  try {
    const user = await User.findById(req.userId).select('name email phone');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const name = user.name || '';
    const email = user.email || '';
    const phone = user.phone || '';

    const orConditions = [];
    orConditions.push({ customerId: req.userId });
    if (name) orConditions.push({ customerName: name });
    if (email) orConditions.push({ customerName: email });
    if (phone) orConditions.push({ customerPhone: phone });

    if (orConditions.length === 0) {
      return res.json({ orders: [] });
    }

    const orders = await Order.find({ $or: orConditions }).sort({ createdAt: -1 }).lean();
    
    const Restaurant = require('../models/restaurantModel');
    const vendorIds = orders.map(o => o.vendorId);
    const restaurants = await Restaurant.find({ vendorId: { $in: vendorIds } }).lean();
    
    const restaurantMap = {};
    restaurants.forEach(r => {
      restaurantMap[r.vendorId.toString()] = r;
    });

    const populatedOrders = orders.map(o => {
      const rest = restaurantMap[o.vendorId.toString()];
      if (rest) {
        o.restaurantName = rest.name;
        o.restaurantLocation = rest.location;
        o.restaurantImage = rest.logo;
      }
      return o;
    });

    return res.json({ orders: populatedOrders });
  } catch (err) {
    console.error('Fetch my orders error:', err);
    return res.status(500).json({ error: 'Failed to fetch orders' });
  }
});

// 🔥 Get all orders for a vendor (public, for legacy support)
router.get('/:vendorId', async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.vendorId)) {
      return res.status(400).json({ error: 'Invalid vendor id' });
    }
    const orders = await Order.find({ vendorId: req.params.vendorId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ✅ Update order status (with real-time notification)
router.put('/:orderId/status', authVendor, async (req, res) => {
  const incomingStatus = (req.body.status || '').toLowerCase();
  const status = incomingStatus === 'completed' ? 'delivered' : incomingStatus;
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    if (String(order.vendorId) !== String(req.vendorId)) {
      return res.status(403).json({ error: 'Not authorized to update this order' });
    }

    order.status = status;
    await order.save();

    // Emit socket event to notify customer about status change
    const io = req.app.get('io');
    if (io && order) {
      if (order.customerId) {
        io.to(`user:${order.customerId}`).emit('order-status-updated', {
          orderId: order._id,
          status: order.status,
        });
      }
      io.to(`vendor:${order.vendorId}`).emit('order-status-updated', {
        orderId: order._id,
        status: order.status,
      });
    }

    if (["accepted", "out_for_delivery", "delivered"].includes(order.status)) {
      const restaurant = await Restaurant.findOne({ vendorId: order.vendorId }).select("name");
      let customer = null;
      if (order.customerId) {
        customer = await User.findById(order.customerId).select("name email phone notificationPreferences");
      }

      if (!customer && order.customerPhone) {
        customer = await User.findOne({ phone: order.customerPhone }).select("name email phone notificationPreferences");
      }

      if (!customer && order.customerName) {
        customer = await User.findOne({ $or: [{ name: order.customerName }, { email: order.customerName }] }).select("name email phone notificationPreferences");
      }

      if (customer?.email) {
        sendOrderStatusEmail({
          email: customer.email,
          name: customer.name || order.customerName,
          orderId: order._id,
          status: order.status,
          restaurantName: restaurant?.name || "Partner Restaurant",
          updatedAt: new Date(),
        });
      }

    }

    res.json(order);
  } catch (err) {
    console.error('Order status update error:', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
});

// ✅ Customer App — Delete my order
router.delete('/:orderId', authUser, async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    const user = await User.findById(req.userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Verify this order belongs to the current user
    const userMatches = 
      order.customerName === user.name ||
      order.customerName === user.email ||
      order.customerPhone === user.phone;

    if (!userMatches) {
      return res.status(403).json({ message: 'Not authorized to delete this order' });
    }

    await Order.findByIdAndDelete(req.params.orderId);
    return res.json({ message: 'Order deleted successfully' });
  } catch (err) {
    console.error('Delete order error:', err);
    return res.status(500).json({ error: 'Failed to delete order' });
  }
});

module.exports = router;
