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

module.exports = router;
