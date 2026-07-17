const express = require('express');
const router = express.Router();

const PHOTON_BASE = 'https://photon.komoot.io';

// Helper to format Photon feature to Nominatim-like object
function formatPhotonFeature(feature) {
  const props = feature.properties;
  const coords = feature.geometry.coordinates; // [lon, lat]
  
  // Build a display name
  const nameParts = [];
  if (props.name) nameParts.push(props.name);
  if (props.street) nameParts.push(props.street);
  if (props.locality) nameParts.push(props.locality);
  if (props.city || props.town || props.village) nameParts.push(props.city || props.town || props.village);
  if (props.state) nameParts.push(props.state);
  if (props.country) nameParts.push(props.country);
  
  return {
    lat: coords[1].toString(),
    lon: coords[0].toString(),
    display_name: nameParts.join(', '),
    address: {
      city: props.city || props.town || props.village || '',
      state: props.state || '',
      postcode: props.postcode || ''
    }
  };
}

// GET /api/location/search?q=...
router.get('/search', async (req, res) => {
  try {
    const query = req.query.q;
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }
    const response = await fetch(`${PHOTON_BASE}/api/?q=${encodeURIComponent(query)}&limit=5`);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: 'Invalid response from geocoder' });
    }
    
    if (data && data.features) {
      const results = data.features.map(formatPhotonFeature);
      return res.json(results);
    }
    res.json([]);
  } catch (err) {
    console.error('Location search error:', err);
    res.status(500).json({ error: 'Failed to search location' });
  }
});

// GET /api/location/reverse?lat=...&lon=...
router.get('/reverse', async (req, res) => {
  try {
    const { lat, lon } = req.query;
    if (!lat || !lon) {
      return res.status(400).json({ error: 'Latitude and longitude are required' });
    }
    const response = await fetch(`${PHOTON_BASE}/reverse?lat=${lat}&lon=${lon}`);
    const text = await response.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return res.status(502).json({ error: 'Invalid response from geocoder' });
    }
    
    if (data && data.features && data.features.length > 0) {
      const result = formatPhotonFeature(data.features[0]);
      return res.json(result); // Return single object for reverse, or array if frontend expects array (Nominatim returns single object for reverse if format=jsonv2, array for search)
    }
    // Return empty if not found
    res.json({ display_name: 'Unknown Location', address: {} });
  } catch (err) {
    console.error('Location reverse geocode error:', err);
    res.status(500).json({ error: 'Failed to reverse geocode location' });
  }
});

module.exports = router;
