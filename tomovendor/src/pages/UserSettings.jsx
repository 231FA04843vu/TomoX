import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

function UserSettings() {
  const [activeTab, setActiveTab] = useState('Orders');
  const navigate = useNavigate();
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  
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
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid var(--sw-border)', borderRadius: '4px', overflow: 'hidden', marginBottom: '24px' }}>
                <div style={{ background: '#f5f5f6', padding: '12px 16px', color: 'var(--sw-text-light)', fontSize: '13px', borderRight: '1px solid var(--sw-border)' }}>
                  Login ID
                </div>
                <div style={{ padding: '12px 16px', fontWeight: 'bold' }}>
                  {vendor?.id || vendor?._id || '#9032002938'}
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: 'var(--sw-orange)', fontSize: '13px', cursor: 'pointer', fontWeight: 'bold' }}>Change Password?</span>
                <button className="sw-btn sw-btn-dark" onClick={handleLogout}>LOGOUT</button>
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
