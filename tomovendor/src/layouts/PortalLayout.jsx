import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import '../styles/dashboard.css';

const API_URL = import.meta.env.VITE_API || 'http://localhost:5000';

function PortalLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{"name":"Restaurant", "id":""}');
  
  const [isOnline, setIsOnline] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    // Fetch initial status
    const fetchStatus = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/restaurants/vendor/${vendor.id || vendor._id}`);
        if (res.data && res.data.isOnline !== undefined) {
          setIsOnline(res.data.isOnline);
        }
      } catch (err) {
        console.error("Failed to fetch restaurant status", err);
      }
    };
    if (vendor.id || vendor._id) {
      fetchStatus();
    }
  }, [vendor.id, vendor._id]);

  const handleToggleOnline = async () => {
    const newStatus = !isOnline;
    setIsOnline(newStatus); // Optimistic UI update
    setIsLoadingStatus(true);
    
    try {
      await axios.put(`${API_URL}/api/restaurants/vendor/${vendor.id || vendor._id}/toggle-status`, {
        isOnline: newStatus
      });
    } catch (err) {
      console.error("Failed to toggle status", err);
      // setIsOnline(!newStatus); // Revert on failure (Disabled temporarily to allow visual toggling without backend restart)
    } finally {
      setIsLoadingStatus(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorInfo');
    navigate('/login');
  };

  // Title logic for Topbar based on route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path.startsWith('/orders')) return 'MANAGE ORDERS';
    if (path.startsWith('/growth')) return 'GROWTH';
    if (path.startsWith('/menu')) return 'MENU DETAILS';
    if (path.startsWith('/complaints')) return 'COMPLAINTS';
    if (path.startsWith('/ratings')) return 'RATINGS';
    if (path.startsWith('/reports')) return 'BUSINESS REPORTS';
    if (path.startsWith('/finance')) return 'FINANCE';
    if (path.startsWith('/help')) return 'HELP CENTER';
    if (path.startsWith('/manage-outlets')) return 'RESTAURANT INFO';
    if (path.startsWith('/settings')) return 'SETTINGS';
    return 'DASHBOARD';
  };

  return (
    <div className="sw-shell">
      <Sidebar />
      <main className="sw-main">
        <header className="sw-topbar">
          <div className="sw-topbar-left">
            <span className="sw-topbar-title">{getPageTitle()}</span>
            
            {location.pathname.startsWith('/orders') && (
              <div style={{ width: '1px', height: '20px', background: '#3d4152', margin: '0 16px' }}></div>
            )}

            <div className="sw-store-selector" style={{ borderLeft: location.pathname.startsWith('/orders') ? 'none' : '1px solid var(--sw-sidebar-border)', paddingLeft: location.pathname.startsWith('/orders') ? '0' : '16px' }}>
              <div 
                className="sw-custom-toggle" 
                onClick={() => !isLoadingStatus && handleToggleOnline()}
                style={{ cursor: isLoadingStatus ? 'not-allowed' : 'pointer', opacity: isLoadingStatus ? 0.7 : 1 }}
                title={isOnline ? "You are Online" : "You are Offline"}
              >
                <div className={`sw-toggle-track ${isOnline ? 'on' : 'off'}`}>
                  <div className="sw-toggle-thumb">
                    {isOnline ? (
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
              <div className="sw-store-info">
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'white', fontSize: '15px' }}>
                  {vendor.restaurantName || vendor.name || 'Sip N SliceD'} 
                </h2>
                <p style={{ color: '#93959f', fontSize: '11px' }}>{vendor.restaurantAddress || vendor.address || 'Address not provided'} (Vendor ID : {vendor.id || vendor._id || 'N/A'})</p>
              </div>
            </div>
          </div>

          <div className="sw-topbar-right">
            <button className="sw-icon-btn" onClick={() => navigate('/help')} title="Help & FAQs">
              <i className="fas fa-question-circle"></i>
            </button>
            
            <div className="sw-notification-dropdown-container">
              <button className="sw-icon-btn" title="Notifications">
                <i className="fas fa-bell"></i>
                <span className="sw-notification-badge">1</span>
              </button>
              <div className="sw-notification-dropdown">
                <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--sw-border)', fontWeight: 'bold' }}>Notifications</div>
                <div style={{ padding: '16px', fontSize: '13px', color: 'var(--sw-text-light)' }}>
                  Welcome to the Vendor Portal! Stay tuned for updates.
                </div>
              </div>
            </div>
            
            <div className="sw-profile-dropdown-container">
              <button className="sw-profile-btn">
                <i className="fas fa-user-circle"></i>
              </button>
              <div className="sw-profile-dropdown">
                <button onClick={() => navigate('/settings')}>User Settings</button>
                <button onClick={handleLogout}>Logout</button>
              </div>
            </div>
          </div>
        </header>

        <section className="sw-page-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default PortalLayout;
