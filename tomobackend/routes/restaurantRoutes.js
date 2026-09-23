const express = require('express');
const {
  getRestaurantByVendor,
  createOrUpdateRestaurant,
  addMenuItem,
  deleteMenuItem
} = require('../controllers/restaurantController');

const Restaurant = require('../models/restaurantModel');

const router = express.Router();


function getDistanceInKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2); 
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)); 
  return R * c; // Distance in km
}

// ✅ Customer App — Get all restaurants (with optional proximity filtering)
router.get('/', async (req, res) => {
  try {
    const { lat, lon, radius = 10 } = req.query;
    let restaurants = await Restaurant.find();

    // If customer location is provided, filter restaurants by distance
    if (lat && lon) {
      const customerLat = parseFloat(lat);
      const customerLon = parseFloat(lon);
      const maxDistance = parseFloat(radius);

      restaurants = restaurants.filter(restaurant => {
        // If restaurant has no coordinates, we might want to exclude it or include it.
        // Let's exclude it to ensure "only nearby" rule is strictly followed.
        if (!restaurant.coordinates || restaurant.coordinates.lat == null || restaurant.coordinates.lng == null) {
          return false;
        }

        const distance = getDistanceInKm(
          customerLat, 
          customerLon, 
          restaurant.coordinates.lat, 
          restaurant.coordinates.lng
        );

        // Include only if within radius
        return distance <= maxDistance;
      });
    }

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
