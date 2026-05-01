const Restaurant = require('../models/restaurantModel');

// Get Restaurant by Vendor
exports.getRestaurantByVendor = async (req, res) => {
  try {
    const restaurant = await Restaurant.findOne({ vendorId: req.params.vendorId });
    if (restaurant) {
      res.json(restaurant);
    } else {
      res.status(404).json({ message: 'Restaurant not found' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create or Update Restaurant Setup
exports.createOrUpdateRestaurant = async (req, res) => {
  const { name, location, cuisine, logo } = req.body;
  const vendorId = req.params.vendorId;

  try {
    let restaurant = await Restaurant.findOne({ vendorId });

    if (restaurant) {
      restaurant.name = name;
      restaurant.location = location;
      restaurant.cuisine = cuisine;
      restaurant.logo = logo;
    } else {
      restaurant = new Restaurant({
        vendorId,
        name,
        location,
        cuisine,
        logo,
        menu: []
      });
    }

    const saved = await restaurant.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add Menu Item
exports.addMenuItem = async (req, res) => {
  const { vendorId } = req.params;
  const { id, name, price, description, image } = req.body;

  try {
    const restaurant = await Restaurant.findOne({ vendorId });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    const newItem = { id, name, price, description, image };
    restaurant.menu.push(newItem);

    const saved = await restaurant.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Delete Menu Item
exports.deleteMenuItem = async (req, res) => {
  const { vendorId, itemId } = req.params;

  try {
    const restaurant = await Restaurant.findOne({ vendorId });
    if (!restaurant) return res.status(404).json({ message: 'Restaurant not found' });

    restaurant.menu = restaurant.menu.filter(item => item.id !== itemId);

    const saved = await restaurant.save();
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
