import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

function UserSettings() {
  const [activeTab, setActiveTab] = useState('Orders');
  const navigate = useNavigate();
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  
  const [formData, setFormData] = useState({
    contactEmail: vendor?.contactEmail || '',
    whatsappNumber: vendor?.whatsappNumber || '',
    foodType: vendor?.foodType || '',
    fssaiNumber: vendor?.fssaiNumber || ''
  });

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
                  const res = await fetch(`${import.meta.env.VITE_API || 'http://localhost:5000'}/api/auth-vendor/me`, {
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
                  } else {
                    alert('Failed to update profile');
                  }
                } catch (err) {
                  console.error(err);
                  alert('Error updating profile');
                }
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                  {/* Restricted Fields (Disabled) */}
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '4px' }}>Vendor ID</label>
                    <input type="text" value={vendor?.id || vendor?._id || ''} disabled style={{ width: '100%', padding: '10px', background: '#f5f5f6', border: '1px solid var(--sw-border)', borderRadius: '4px', color: '#93959f' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '4px' }}>Owner Name</label>
                    <input type="text" value={vendor?.ownerFullName || vendor?.name || ''} disabled style={{ width: '100%', padding: '10px', background: '#f5f5f6', border: '1px solid var(--sw-border)', borderRadius: '4px', color: '#93959f' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '4px' }}>Restaurant Name</label>
                    <input type="text" value={vendor?.restaurantName || ''} disabled style={{ width: '100%', padding: '10px', background: '#f5f5f6', border: '1px solid var(--sw-border)', borderRadius: '4px', color: '#93959f' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '4px' }}>Restaurant Address</label>
                    <input type="text" value={vendor?.restaurantAddress || ''} disabled style={{ width: '100%', padding: '10px', background: '#f5f5f6', border: '1px solid var(--sw-border)', borderRadius: '4px', color: '#93959f' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '4px' }}>Primary Email</label>
                    <input type="email" value={vendor?.email || ''} disabled style={{ width: '100%', padding: '10px', background: '#f5f5f6', border: '1px solid var(--sw-border)', borderRadius: '4px', color: '#93959f' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '4px' }}>Primary Phone</label>
                    <input type="text" value={vendor?.phone || ''} disabled style={{ width: '100%', padding: '10px', background: '#f5f5f6', border: '1px solid var(--sw-border)', borderRadius: '4px', color: '#93959f' }} />
                  </div>

                  {/* Editable Fields */}
                  <div style={{ gridColumn: '1 / -1', marginTop: '16px', borderTop: '1px solid var(--sw-border)', paddingTop: '16px' }}>
                    <h4 style={{ margin: '0 0 16px 0', fontSize: '14px' }}>Editable Details</h4>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--sw-text-dark)', marginBottom: '4px', fontWeight: 'bold' }}>Contact Email</label>
                    <input type="email" value={formData.contactEmail} onChange={e => setFormData({...formData, contactEmail: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid var(--sw-border)', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--sw-text-dark)', marginBottom: '4px', fontWeight: 'bold' }}>WhatsApp Number</label>
                    <input type="text" value={formData.whatsappNumber} onChange={e => setFormData({...formData, whatsappNumber: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid var(--sw-border)', borderRadius: '4px' }} />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--sw-text-dark)', marginBottom: '4px', fontWeight: 'bold' }}>Food Type</label>
                    <select value={formData.foodType} onChange={e => setFormData({...formData, foodType: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid var(--sw-border)', borderRadius: '4px' }}>
                      <option value="">Select...</option>
                      <option value="Veg">Veg Only</option>
                      <option value="Non-Veg">Non-Veg Only</option>
                      <option value="Both">Both Veg & Non-Veg</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', color: 'var(--sw-text-dark)', marginBottom: '4px', fontWeight: 'bold' }}>FSSAI Number</label>
                    <input type="text" value={formData.fssaiNumber} onChange={e => setFormData({...formData, fssaiNumber: e.target.value})} style={{ width: '100%', padding: '10px', border: '1px solid var(--sw-border)', borderRadius: '4px' }} />
                  </div>
                </div>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '32px' }}>
                  <button type="submit" className="sw-btn" style={{ padding: '10px 24px' }}>Save Changes</button>
                  <button type="button" className="sw-btn sw-btn-dark" onClick={handleLogout}>LOGOUT</button>
                </div>
              </form>
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
