import React, { useState, useEffect, useRef } from 'react';

const AddressDrawer = ({ isOpen, onClose, address, onSave }) => {
  const [formData, setFormData] = useState({
    line1: '',
    line2: '',
    landmark: '',
    label: 'Home'
  });

  const [isSaving, setIsSaving] = useState(false);

  const [geoPoint, setGeoPoint] = useState(null);
  const [isMapLoading, setIsMapLoading] = useState(false);
  const [fetchedAddressData, setFetchedAddressData] = useState({});

  const [addressSearchQuery, setAddressSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    if (address) {
      setFormData({
        line1: address.line1 || '',
        line2: address.line2 || '',
        landmark: address.landmark || '',
        label: address.label || 'Home'
      });
      setFetchedAddressData({});

      const fetchCoordinates = async () => {
        setIsMapLoading(true);
        try {
          const query = [address.line1, address.city, address.postalCode].filter(Boolean).join(', ');
          const response = await fetch(`${import.meta.env.VITE_API_COMPANY}/api/location/search?q=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          if (data && data.length > 0) {
            setGeoPoint({ lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) });
          } else {
            // Default center if address not found
            setGeoPoint({ lat: 20.5937, lon: 78.9629 });
          }
        } catch(err) {
          console.error("Failed to fetch coordinates:", err);
          setGeoPoint({ lat: 20.5937, lon: 78.9629 });
        } finally {
          setIsMapLoading(false);
        }
      };

      fetchCoordinates();
    }
  }, [address]);

  useEffect(() => {
    const defaultAddress = fetchedAddressData.displayAddress || `${address?.line1 || ''}${address?.city ? ', ' + address.city : ''}${address?.state ? ', ' + address.state : ''}`.replace(/^,\s*/, '') || '';
    setAddressSearchQuery(defaultAddress);
  }, [fetchedAddressData.displayAddress, address]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLabelChange = (label) => {
    setFormData(prev => ({ ...prev, label }));
  };

  const handleLocateMe = () => {
    if (!navigator.geolocation) return;
    setIsMapLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setGeoPoint({ lat, lon });
        
        try {
          const response = await fetch(`${import.meta.env.VITE_API_COMPANY}/api/location/reverse?lat=${lat}&lon=${lon}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          if (data && data.display_name) {
             setFetchedAddressData({
               city: data.address?.city || data.address?.town || data.address?.village || '',
               state: data.address?.state || '',
               postalCode: data.address?.postcode || '',
               displayAddress: data.display_name
             });
             
             // Clear the manual fields so the user can fill them in for the new location
             setFormData(prev => ({
               ...prev,
               line1: '',
               line2: '',
               landmark: ''
             }));
          } else {
             setFetchedAddressData({
               displayAddress: "Unknown location at selected coordinates"
             });
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          setFetchedAddressData({
            displayAddress: "Error fetching location details"
          });
        }
        
        setIsMapLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error);
        setIsMapLoading(false);
      }
    );
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setAddressSearchQuery(val);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    
    if (val.length > 2) {
      searchTimeoutRef.current = setTimeout(async () => {
        setIsSearching(true);
        try {
          const response = await fetch(`${import.meta.env.VITE_API_COMPANY}/api/location/search?q=${encodeURIComponent(val)}`);
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          setSuggestions(data || []);
        } catch(err) {
          console.error("Search error:", err);
        } finally {
          setIsSearching(false);
        }
      }, 700); // 700ms debounce
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionSelect = (sugg) => {
    setAddressSearchQuery(sugg.display_name);
    setSuggestions([]);
    const lat = parseFloat(sugg.lat);
    const lon = parseFloat(sugg.lon);
    setGeoPoint({ lat, lon });
    setFetchedAddressData({
       city: sugg.address?.city || sugg.address?.town || sugg.address?.village || '',
       state: sugg.address?.state || '',
       postalCode: sugg.address?.postcode || '',
       displayAddress: sugg.display_name
    });
    // Clear manual fields
    setFormData(prev => ({
       ...prev,
       line1: '',
       line2: '',
       landmark: ''
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    
    // Ensure we have a valid line1 to satisfy backend requirements.
    // If formData.line1 is empty, we fall back to the fetched display address or existing line1.
    const finalLine1 = formData.line1 || fetchedAddressData.displayAddress || address?.line1 || 'Unknown Location';
    
    // If the user provided a Door No, let's make sure the displayAddress is saved in line2 so we don't lose the place name
    const finalLine2 = (formData.line1 && !formData.line2 && fetchedAddressData.displayAddress)
      ? fetchedAddressData.displayAddress 
      : formData.line2;
    
    // Merge existing address with updated fields
    const updatedAddress = {
      ...address,
      ...formData,
      line1: finalLine1,
      line2: finalLine2,
      ...(fetchedAddressData.city ? { city: fetchedAddressData.city } : {}),
      ...(fetchedAddressData.state ? { state: fetchedAddressData.state } : {}),
      ...(fetchedAddressData.postalCode ? { postalCode: fetchedAddressData.postalCode } : {})
    };
    
    try {
      await onSave(updatedAddress);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // For the map placeholder, we'll use a static image that looks like Google Maps
  const mapPlaceholderImage = "https://images.unsplash.com/photo-1524661135-423995f22d0b?q=80&w=600&auto=format&fit=crop"; 

  // Format the generalized address to show under the map
  const summarizedAddress = fetchedAddressData.displayAddress || `${address?.line1 || ''}${address?.city ? ', ' + address.city : ''}${address?.state ? ', ' + address.state : ''}`.replace(/^,\s*/, '') || 'Select location on map';

  return (
    <div className="address-drawer-overlay" onClick={onClose}>
      <div 
        className="address-drawer-container" 
        onClick={(e) => {
          e.stopPropagation();
          setSuggestions([]); // close suggestions on click outside
        }}
      >
        <div className="address-drawer-header">
          <button className="address-drawer-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
          <h2>Save delivery address</h2>
        </div>

        <div className="address-drawer-body">
          <div className="address-drawer-map">
            {isMapLoading ? (
              <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#e9e9eb' }}>
                <span>Loading map...</span>
              </div>
            ) : geoPoint ? (
              <iframe
                title="Address location"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=${geoPoint.lon - 0.01}%2C${geoPoint.lat - 0.01}%2C${geoPoint.lon + 0.01}%2C${geoPoint.lat + 0.01}&layer=mapnik&marker=${geoPoint.lat}%2C${geoPoint.lon}`}
              />
            ) : null}
            <div className="drag-map-badge">Drag map</div>
            
            <div className="swiggy-map-controls">
              <button className="map-control-btn locate-btn" type="button" title="Current Location" onClick={handleLocateMe}>
                <i className="fas fa-crosshairs"></i>
              </button>
            </div>
          </div>

          <div className="address-drawer-summary" style={{ position: 'relative' }}>
            <span>ADDRESS</span>
            <input 
              type="text"
              value={addressSearchQuery}
              onChange={handleSearchChange}
              placeholder="Search for an address..."
              style={{
                width: '100%',
                padding: '8px 0',
                border: 'none',
                borderBottom: '1px solid #d4d5d9',
                fontSize: '15px',
                color: '#282c3f',
                outline: 'none',
                fontWeight: '500',
                backgroundColor: 'transparent'
              }}
            />
            {isSearching && (
               <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, background: '#fff', border: '1px solid #d4d5d9', padding: '10px', zIndex: 10 }}>
                 Loading...
               </div>
            )}
            {suggestions.length > 0 && (
               <ul style={{
                 position: 'absolute', top: '100%', left: 0, right: 0,
                 background: '#fff', border: '1px solid #d4d5d9',
                 maxHeight: '200px', overflowY: 'auto',
                 listStyle: 'none', padding: 0, margin: 0, zIndex: 10,
                 boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
               }}>
                 {suggestions.map((sugg, idx) => (
                   <li 
                     key={idx}
                     onClick={() => handleSuggestionSelect(sugg)}
                     style={{
                       padding: '12px 16px', borderBottom: '1px solid #f1f1f6',
                       cursor: 'pointer', fontSize: '13px', color: '#535665'
                     }}
                     onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f1f1f6'}
                     onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#fff'}
                   >
                     {sugg.display_name}
                   </li>
                 ))}
               </ul>
            )}
          </div>

          <form className="address-drawer-form" onSubmit={handleSubmit}>
            <div className="address-input-group">
              <label>Door / Flat No.</label>
              <input 
                type="text" 
                name="line1"
                value={formData.line1} 
                onChange={handleChange}
              />
            </div>
            
            <div className="address-input-group">
              <label>Area</label>
              <input 
                type="text" 
                name="line2"
                value={formData.line2} 
                onChange={handleChange}
              />
            </div>
            
            <div className="address-input-group">
              <label>Landmark</label>
              <input 
                type="text" 
                name="landmark"
                value={formData.landmark} 
                onChange={handleChange}
              />
            </div>

            <div className="address-label-selector">
              <div className="address-label-options">
                <button 
                  type="button" 
                  className={formData.label.toLowerCase() === 'other' ? 'active' : ''}
                  onClick={() => handleLabelChange('Other')}
                >
                  <i className="fas fa-map-marker-alt"></i> Other
                </button>
                <button 
                  type="button" 
                  className={formData.label.toLowerCase() === 'home' ? 'active' : ''}
                  onClick={() => handleLabelChange('Home')}
                >
                  Home
                </button>
                <button 
                  type="button" 
                  className={formData.label.toLowerCase() === 'work' ? 'active' : ''}
                  onClick={() => handleLabelChange('Work')}
                >
                  Work
                </button>
              </div>
              <button 
                type="button" 
                className="address-cancel-btn"
                onClick={onClose}
              >
                Cancel
              </button>
            </div>

            <div className="address-drawer-footer">
              <button 
                type="submit" 
                className="address-save-btn"
                disabled={isSaving}
              >
                {isSaving ? "SAVING..." : "SAVE ADDRESS & PROCEED"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddressDrawer;
