import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

function UserSettings() {
  const [activeTab, setActiveTab] = useState('Orders');
  const navigate = useNavigate();
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  
  const [formData, setFormData] = useState({
    name: vendor?.ownerFullName || vendor?.name || '',
    restaurantName: vendor?.restaurantName || '',
    restaurantAddress: vendor?.restaurantAddress || '',
    email: vendor?.email || '',
    phone: vendor?.phone || '',
    foodType: vendor?.foodType || '',
    coordinates: vendor?.coordinates || { lat: null, lng: null }
  });

  const [isFetchingLocation, setIsFetchingLocation] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsFetchingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          // Use tomo backend's location proxy to get the address
          const apiUrl = import.meta.env.VITE_API || 'http://localhost:5000';
          const res = await fetch(`${apiUrl}/api/location/reverse?lat=${latitude}&lon=${longitude}`);
          if (res.ok) {
            const data = await res.json();
            if (data && data.display_name) {
              setFormData((prev) => ({
                ...prev,
                restaurantAddress: data.display_name,
                coordinates: { lat: latitude, lng: longitude }
              }));
            }
          } else {
            // Fallback if reverse geocoding fails, still save coordinates
            setFormData((prev) => ({
              ...prev,
              coordinates: { lat: latitude, lng: longitude }
            }));
            alert('Coordinates fetched, but could not resolve address.');
          }
        } catch (err) {
          console.error(err);
          // Just save coordinates if fetch fails
          setFormData((prev) => ({
            ...prev,
            coordinates: { lat: latitude, lng: longitude }
          }));
        } finally {
          setIsFetchingLocation(false);
        }
      },
      (error) => {
        setIsFetchingLocation(false);
        alert('Failed to get location. Please ensure location permissions are granted.');
      }
    );
  };

  const [showOrders, setShowOrders] = useState(() => {
    return localStorage.getItem('swiggy_showOrders') !== 'false'; // default true
  });

  const handleToggleShowOrders = () => {
    const newVal = !showOrders;
    setShowOrders(newVal);
    localStorage.setItem('swiggy_showOrders', newVal);
    // Dispatch event so Orders component can update instantly if it's mounted
    window.dispatchEvent(new Event('showOrdersChanged'));
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorInfo');
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "WARNING: Are you sure you want to permanently delete your account and remove your restaurant from the app? This action CANNOT be undone."
    );
    if (!confirmDelete) return;

    try {
      const res = await fetch(`${import.meta.env.VITE_API || 'http://localhost:5000'}/api/vendor-auth/me`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('vendorToken')}`
        }
      });
      if (res.ok) {
        alert("Your account has been successfully deleted.");
        handleLogout();
      } else {
        const data = await res.json();
        alert(`Failed to delete account: ${data.message || 'Unknown error'}`);
      }
    } catch (err) {
      console.error(err);
      alert("Error deleting account. Please try again later.");
    }
  };

  const inputStyle = {
    width: '100%', 
    padding: '10px 12px', 
    border: '1px solid var(--sw-border)', 
    borderRadius: '4px',
    boxSizing: 'border-box',
    fontSize: '14px',
    height: '42px',
    outline: 'none',
    backgroundColor: '#fff'
  };

  return (
    <div style={{ padding: '24px', background: 'var(--sw-bg)', height: '100%' }}>
      
      <div className="sw-setting-card" style={{ maxWidth: '600px', padding: 0, overflow: 'hidden' }}>
        <div style={{ display: 'flex', borderBottom: '1px solid var(--sw-border)', background: '#f9f9fa' }}>
          <div 
            style={{ padding: '16px 24px', fontWeight: activeTab === 'User Profile' ? 'bold' : 'normal', borderBottom: activeTab === 'User Profile' ? '2px solid black' : 'none', cursor: 'pointer', background: activeTab === 'User Profile' ? 'white' : 'transparent' }}
            onClick={() => setActiveTab('User Profile')}
          >
            User Profile
          </div>
          <div 
            style={{ padding: '16px 24px', fontWeight: activeTab === 'Orders' ? 'bold' : 'normal', borderBottom: activeTab === 'Orders' ? '2px solid black' : 'none', cursor: 'pointer', background: activeTab === 'Orders' ? 'white' : 'transparent' }}
            onClick={() => setActiveTab('Orders')}
          >
            Orders
          </div>
        </div>

        <div style={{ padding: '24px' }}>
          {activeTab === 'User Profile' ? (
            <div>
              <form onSubmit={async (e) => {
                e.preventDefault();
                try {
                  const res = await fetch(`${import.meta.env.VITE_API || 'http://localhost:5000'}/api/vendor-auth/me`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${localStorage.getItem('vendorToken')}`
                    },
                    body: JSON.stringify(formData)
                  });
                  if (res.ok) {
                    const data = await res.json();
                    localStorage.setItem('vendorInfo', JSON.stringify(data.vendor));
                    alert('Profile updated successfully!');
                    // Optionally update the top bar instantly
                    window.dispatchEvent(new Event('storage'));
                  } else {
                    alert('Failed to update profile');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Error updating profile');
                }
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '24px' }}>
                  {/* Restricted Field (Disabled) */}
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--sw-text-light)', marginBottom: '6px', fontWeight: '500' }}>Vendor ID</label>
                    <input type="text" value={vendor?.id || vendor?._id || ''} disabled style={{ ...inputStyle, background: '#f5f5f6', color: '#93959f', cursor: 'not-allowed' }} />
                  </div>

                  {/* Editable Fields */}
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--sw-text-dark)', marginBottom: '6px', fontWeight: 'bold' }}>Owner Name</label>
                    <input type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--sw-text-dark)', marginBottom: '6px', fontWeight: 'bold' }}>Restaurant Name</label>
                    <input type="text" value={formData.restaurantName} onChange={e => setFormData({...formData, restaurantName: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '6px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--sw-text-dark)', fontWeight: 'bold' }}>Restaurant Address</label>
                      <button 
                        type="button" 
                        onClick={handleGetLocation} 
                        disabled={isFetchingLocation}
                        style={{ background: 'none', border: 'none', color: '#fc8019', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}
                      >
                        <i className="fas fa-location-arrow"></i> {isFetchingLocation ? 'Locating...' : 'Use Current Location'}
                      </button>
                    </div>
                    <input type="text" value={formData.restaurantAddress} onChange={e => setFormData({...formData, restaurantAddress: e.target.value})} style={inputStyle} placeholder="Enter address or use location" />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--sw-text-dark)', marginBottom: '6px', fontWeight: 'bold' }}>Primary Email</label>
                    <input type="email" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} style={inputStyle} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--sw-text-dark)', marginBottom: '6px', fontWeight: 'bold' }}>Primary Phone</label>
                    <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} style={inputStyle} />
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <label style={{ display: 'block', fontSize: '13px', color: 'var(--sw-text-dark)', marginBottom: '6px', fontWeight: 'bold' }}>Food Type</label>
                    <select value={formData.foodType} onChange={e => setFormData({...formData, foodType: e.target.value})} style={{ ...inputStyle, cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23131313%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px top 50%', backgroundSize: '12px auto' }}>
                      <option value="">Select...</option>
                      <option value="Veg">Veg Only</option>
                      <option value="Non-Veg">Non-Veg Only</option>
                      <option value="Both">Both Veg & Non-Veg</option>
                    </select>
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '16px', marginTop: '32px' }}>
                  <button type="submit" className="sw-btn" style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 'bold' }}>SAVE CHANGES</button>
                  <button type="button" className="sw-btn sw-btn-dark" style={{ flex: 1, padding: '12px', fontSize: '14px', fontWeight: 'bold' }} onClick={handleLogout}>LOGOUT</button>
                </div>
              </form>

              {/* Danger Zone & Store Controls */}
              <div style={{ marginTop: '40px', borderTop: '1px solid var(--sw-border)', paddingTop: '24px' }}>
                <h3 style={{ fontSize: '15px', color: 'var(--sw-red)', marginBottom: '16px' }}>Danger Zone & Store Controls</h3>
                
                <div style={{ border: '1px solid #f5c6cb', backgroundColor: '#f8d7da', borderRadius: '4px', padding: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <span style={{ fontWeight: 'bold', fontSize: '13px', color: '#721c24', display: 'block' }}>Temporarily Close Store</span>
                      <span style={{ fontSize: '11px', color: '#721c24' }}>
                        To temporarily close your store and stop receiving new orders, use the ON/OFF toggle switch located at the top-left of the top bar (next to your restaurant name).
                      </span>
                    </div>
                  </div>
                </div>

                <div style={{ border: '1px solid var(--sw-border)', borderRadius: '4px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '13px', color: 'var(--sw-text-dark)', display: 'block' }}>Delete Vendor Account</span>
                    <span style={{ fontSize: '11px', color: 'var(--sw-text-light)' }}>
                      Permanently delete your account, menu, and remove your restaurant from the customer app.
                    </span>
                  </div>
                  <button 
                    onClick={handleDeleteAccount}
                    style={{ background: 'var(--sw-red)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', fontWeight: 'bold', cursor: 'pointer', fontSize: '12px' }}
                  >
                    DELETE ACCOUNT
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div>
              <div style={{ border: '1px solid var(--sw-border)', borderRadius: '4px', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>Show Orders</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    className="sw-custom-toggle" 
                    onClick={handleToggleShowOrders}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className={`sw-toggle-track ${showOrders ? 'on' : 'off'}`}>
                      <span className="sw-toggle-text">{showOrders ? 'ON' : 'OFF'}</span>
                      <div className="sw-toggle-thumb">
                        {showOrders ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
                            <path d="M12 2v10" stroke="#60b246" />
                            <path d="M6.34 7.34A8 8 0 0 0 12 20" stroke="#60b246" />
                            <path d="M12 20a8 8 0 0 0 5.66-12.66" stroke="#f6a821" />
                          </svg>
                        ) : (
                          <i className="fas fa-power-off" style={{ fontSize: '10px', color: '#93959f' }}></i>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <p style={{ fontSize: '11px', color: 'var(--sw-text-light)', lineHeight: 1.5, marginBottom: '24px', fontWeight: '500' }}>
                You can enable/disable seeing orders for this account using this toggle button. Your restaurant & other users will continue receiving orders. It's recommended to keep it disabled, if you aren't managing orders for your restaurant.
              </p>

              <div style={{ border: '1px solid var(--sw-border)', borderRadius: '4px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 'bold', fontSize: '13px' }}>KOT - Enable Plain Text Format</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    className="sw-custom-toggle" 
                    onClick={(e) => {
                      const track = e.currentTarget.querySelector('.sw-toggle-track');
                      const text = track.querySelector('.sw-toggle-text');
                      if (track.classList.contains('on')) {
                        track.classList.remove('on');
                        track.classList.add('off');
                        text.innerText = 'OFF';
                        track.querySelector('.sw-toggle-thumb').innerHTML = '<i class="fas fa-power-off" style="font-size: 10px; color: #93959f;"></i>';
                      } else {
                        track.classList.remove('off');
                        track.classList.add('on');
                        text.innerText = 'ON';
                        track.querySelector('.sw-toggle-thumb').innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke-width="2.5" stroke-linecap="round"><path d="M12 2v10" stroke="#60b246"></path><path d="M6.34 7.34A8 8 0 0 0 12 20" stroke="#60b246"></path><path d="M12 20a8 8 0 0 0 5.66-12.66" stroke="#f6a821"></path></svg>';
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="sw-toggle-track on">
                      <span className="sw-toggle-text">ON</span>
                      <div className="sw-toggle-thumb">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round">
                          <path d="M12 2v10" stroke="#60b246" />
                          <path d="M6.34 7.34A8 8 0 0 0 12 20" stroke="#60b246" />
                          <path d="M12 20a8 8 0 0 0 5.66-12.66" stroke="#f6a821" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

    </div>
  );
}

export default UserSettings;
