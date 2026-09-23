const express = require('express');
const {
  getRestaurantByVendor,
  createOrUpdateRestaurant,
  addMenuItem,
  deleteMenuItem
} = require('../controllers/restaurantController');

const Restaurant = require('../models/restaurantModel');

const router = express.Router();


// ✅ Customer App — Get all restaurants
router.get('/', async (req, res) => {
  try {
    const restaurants = await Restaurant.find();
    res.json(restaurants);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurants' });
  }
});

// ✅ Customer App — Get restaurant by ID (for menu page)
router.get('/:id', async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ error: 'Restaurant not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch restaurant' });
  }
});


// ✅ Vendor Dashboard — Get or Update Restaurant by Vendor ID
router
  .route('/vendor/:vendorId')
  .get(getRestaurantByVendor)          // Get by vendor ID
  .post(createOrUpdateRestaurant);     // Create/Update


// ✅ Vendor Dashboard — Menu management
router.post('/vendor/:vendorId/menu', addMenuItem);
router.delete('/vendor/:vendorId/menu/:itemId', deleteMenuItem);

// ✅ Vendor Dashboard — Toggle Online/Offline Status
router.put('/vendor/:vendorId/toggle-status', async (req, res) => {
  try {
    const { isOnline } = req.body;
    let restaurant = await Restaurant.findOne({ vendorId: req.params.vendorId });
    
    if (!restaurant) {
      // Fallback: Create a default restaurant profile if missing so the toggle works
      restaurant = new Restaurant({
        vendorId: req.params.vendorId,
        name: "Sip N SliceD",
        location: "Kothapet, Hyderabad",
        cuisine: ["Indian", "Fast Food"],
        logo: "https://images.unsplash.com/photo-1514933651103-005eec06c04b",
        isOnline: isOnline
      });
      await restaurant.save();
    } else {
      restaurant.isOnline = isOnline;
      await restaurant.save();
    }
    
    // Emit to all users that a restaurant status changed
    const io = req.app.get('io');
    if (io) {
      io.emit('restaurant-status-changed', {
        restaurantId: restaurant._id,
        isOnline: restaurant.isOnline
      });
    }
    res.json(restaurant);
  } catch (err) {
    console.error("Toggle Error:", err);
    res.status(500).json({ error: 'Failed to toggle status' });
  }
});

module.exports = router;
