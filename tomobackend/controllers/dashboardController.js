const Order = require('../models/Order');
const Vendor = require('../models/Vendor');
const Restaurant = require('../models/restaurantModel');
const mongoose = require('mongoose');

// 📊 Get vendor dashboard stats and recent orders
exports.getDashboardStats = async (req, res) => {
  try {
    const vendorId = req.params.vendorId;

    if (!vendorId || !mongoose.Types.ObjectId.isValid(vendorId)) {
      return res.status(400).json({ error: 'Invalid vendor id' });
    }

    // Get vendor info
    const vendor = await Vendor.findById(vendorId);
    if (!vendor) {
      return res.status(404).json({ error: 'Vendor not found' });
    }

    // Get restaurant details by vendorId (Vendor model has no restaurant field)
    const restaurant = await Restaurant.findOne({ vendorId }).select('name menu location');

    // Get all orders for this vendor
    const allOrders = await Order.find({ vendorId })
      .sort({ createdAt: -1 })
      .limit(100);

    // Calculate statistics
    const totalOrders = allOrders.length;
    
    const completedOrders = allOrders.filter(o => o.status === 'delivered' || o.status === 'completed');
    const totalRevenue = completedOrders.reduce((sum, order) => sum + (order.totalPrice || 0), 0);

    // Get menu items count from restaurant
    const activeMenuItems = restaurant?.menu?.length || 0;

    // Calculate average rating (if ratings exist in orders)
    const ordersWithRating = allOrders.filter(o => o.rating && o.rating > 0);
    const averageRating = ordersWithRating.length > 0
      ? (ordersWithRating.reduce((sum, o) => sum + o.rating, 0) / ordersWithRating.length).toFixed(1)
      : 0;

    // Get recent orders (last 10)
    const recentOrders = allOrders.slice(0, 10).map(order => ({
      id: order._id,
      orderNumber: order.orderNumber || `#${order._id.toString().slice(-6).toUpperCase()}`,
      customer: order.userId?.name || order.customerName || 'Guest User',
      amount: order.totalPrice || 0,
      items: order.items?.length || 0,
      status: order.status || 'pending',
      time: order.createdAt,
    }));

    // Calculate deltas (compare last 7 days vs previous 7 days)
    const now = new Date();
    const last7Days = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const previous7Days = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    const recentOrdersCount = allOrders.filter(o => new Date(o.createdAt) >= last7Days).length;
    const previousOrdersCount = allOrders.filter(
      o => new Date(o.createdAt) >= previous7Days && new Date(o.createdAt) < last7Days
    ).length;

    const orderDelta = previousOrdersCount > 0
      ? Math.round(((recentOrdersCount - previousOrdersCount) / previousOrdersCount) * 100)
      : recentOrdersCount > 0 ? 100 : 0;

    const recentRevenue = allOrders
      .filter(o => new Date(o.createdAt) >= last7Days && (o.status === 'delivered' || o.status === 'completed'))
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const previousRevenue = allOrders
      .filter(
        o =>
          new Date(o.createdAt) >= previous7Days &&
          new Date(o.createdAt) < last7Days &&
          (o.status === 'delivered' || o.status === 'completed')
      )
      .reduce((sum, o) => sum + (o.totalPrice || 0), 0);

    const revenueDelta = previousRevenue > 0
      ? Math.round(((recentRevenue - previousRevenue) / previousRevenue) * 100)
      : recentRevenue > 0 ? 100 : 0;

    res.json({
      stats: {
        totalOrders,
        totalRevenue,
        activeMenuItems,
        averageRating: Number(averageRating),
        orderDelta,
        revenueDelta,
        menuDelta: 0, // You can track this with historical data if needed
        ratingDelta: 0, // Same for rating trends
      },
      recentOrders,
      vendorName: restaurant?.name || vendor.name || 'Your Restaurant',
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
};
