import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import OrderDetailsDrawer from '../components/OrderDetailsDrawer';
import AddressDrawer from '../components/AddressDrawer';
import EditProfileDrawer from '../components/EditProfileDrawer';
import SupportForm from '../components/SupportForm';

const Account = ({ user }) => {
  const [activeTab, setActiveTab] = useState('orders');
  const [viewingOrderDetails, setViewingOrderDetails] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [isAddressDrawerOpen, setIsAddressDrawerOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(null);
  const [addressToDelete, setAddressToDelete] = useState(null);
  const [isEditProfileDrawerOpen, setIsEditProfileDrawerOpen] = useState(false);
  
  const [promoEmailEnabled, setPromoEmailEnabled] = useState(true);
  const [whatsappEnabled, setWhatsappEnabled] = useState(true);
  
  const [visibleOrdersCount, setVisibleOrdersCount] = useState(5);
  
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [showMobileMenu, setShowMobileMenu] = useState(true);

  const [loginDevices, setLoginDevices] = useState([]);
  const [loadingDevices, setLoadingDevices] = useState(false);

  const authToken = useMemo(() => localStorage.getItem("token"), []);
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get('tab');
    if (tab) {
      setActiveTab(tab);
    }
  }, [location.search]);

  useEffect(() => {
    if (!authToken) return;
    const fetchAddresses = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_COMPANY}/api/me/addresses`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (res.ok) setAddresses(data.addresses || []);
      } catch (err) {
        console.error(err);
      }
    };

    const fetchOrders = async () => {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_COMPANY}/api/orders/my/list`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (res.ok) setOrders(data.orders || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingOrders(false);
      }
    };
    
    const fetchDevices = async () => {
      try {
        setLoadingDevices(true);
        const res = await fetch(`${import.meta.env.VITE_API_COMPANY}/api/me/devices`, {
          headers: { Authorization: `Bearer ${authToken}` }
        });
        const data = await res.json();
        if (res.ok) setLoginDevices(data.devices || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingDevices(false);
      }
    };

    fetchAddresses();
    fetchOrders();
    fetchDevices();
  }, [authToken]);

  const handleSaveAddress = async (updatedAddress) => {
    try {
      const endpoint = updatedAddress._id 
        ? `${import.meta.env.VITE_API_COMPANY}/api/me/addresses/${updatedAddress._id}`
        : `${import.meta.env.VITE_API_COMPANY}/api/me/addresses`;
      const method = updatedAddress._id ? "PUT" : "POST";
      
      const res = await fetch(endpoint, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(updatedAddress),
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_COMPANY}/api/me/addresses/${addressId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await res.json();
      if (res.ok) {
        setAddresses(data.addresses || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteDevice = async (id) => {
    try {
      // Optimistically update the UI to show a tick mark/loading state
      setLoginDevices(prev => prev.map(device => 
        device.id === id ? { ...device, deleting: true } : device
      ));
      
      const res = await fetch(`${import.meta.env.VITE_API_COMPANY}/api/me/devices/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${authToken}` },
      });
      
      if (res.ok) {
        // Mark as successfully logged out
        setLoginDevices(prev => prev.map(device => 
          device.id === id ? { ...device, deleting: false, deleted: true } : device
        ));
        
        // Remove it entirely after a short delay
        setTimeout(() => {
          setLoginDevices(prev => prev.filter(device => device.id !== id));
        }, 3000);
      } else {
        // Revert on failure
        setLoginDevices(prev => prev.map(device => 
          device.id === id ? { ...device, deleting: false } : device
        ));
      }
    } catch (err) {
      console.error(err);
      // Revert on error
      setLoginDevices(prev => prev.map(device => 
        device.id === id ? { ...device, deleting: false } : device
      ));
    }
  };

  const handleViewDetails = (order) => {
    setViewingOrderDetails(order);
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    setShowMobileMenu(false);
  };

  // If user is not logged in, show login prompt instead of account details
  if (!user && !authToken) {
    return (
      <div className="account-page-swiggy" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '70vh', background: '#f5f5f5', padding: '20px', textAlign: 'center' }}>
        <div style={{ background: '#fff', padding: '40px 30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', maxWidth: '400px', width: '100%' }}>
          <i className="far fa-user-circle" style={{ fontSize: '64px', color: '#ccc', marginBottom: '20px' }}></i>
          <h2 style={{ marginBottom: '10px', color: '#111', fontSize: '24px' }}>Please Login</h2>
          <p style={{ color: '#666', marginBottom: '30px', fontSize: '14px' }}>You need to be logged in to view your account details, orders, and manage devices.</p>
          <button 
            style={{ width: '100%', padding: '14px 24px', background: '#f26522', color: '#fff', border: 'none', borderRadius: '8px', fontSize: '16px', fontWeight: 'bold' }}
            onClick={() => window.dispatchEvent(new CustomEvent("tomo:open-auth"))}
          >
            LOGIN NOW
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="account-page-swiggy">
      {/* Hero Section */}
      <div className={`account-hero-swiggy ${!showMobileMenu ? 'mobile-hidden' : ''}`}>
        <div className="account-hero-content">
          <div className="account-hero-image desktop-hidden">
             <img src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.name || 'Guest') + "&background=f26522&color=fff"} alt="Profile" />
          </div>
          <div className="account-hero-text">
            <h2>{user?.name || 'Guest User'}</h2>
            <p className="desktop-hidden">{user?.email || user?.phone || ''}</p>
            <p className="mobile-hidden">
              {user?.phone ? `${user.phone} ` : ''}
              {user?.phone && user?.email ? '• ' : ''}
              {user?.email || ''}
            </p>
          </div>
          <button className="edit-profile-btn-swiggy" onClick={() => setIsEditProfileDrawerOpen(true)}>EDIT PROFILE</button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="account-layout-swiggy">
        {/* Sidebar */}
        <div className={`account-sidebar-swiggy ${!showMobileMenu ? 'mobile-hidden' : ''}`}>
          <button className="desktop-hidden" onClick={() => setIsEditProfileDrawerOpen(true)}>
            <div className="sidebar-icon-swiggy"><i className="far fa-user"></i></div> Personal Information <i className="fas fa-chevron-right chevron-icon desktop-hidden"></i>
          </button>
          
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => handleTabClick('orders')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-tags"></i></div> My Orders <i className="fas fa-chevron-right chevron-icon desktop-hidden"></i>
          </button>

          <button className={activeTab === 'addresses' ? 'active' : ''} onClick={() => handleTabClick('addresses')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-map-marker-alt"></i></div> Addresses <i className="fas fa-chevron-right chevron-icon desktop-hidden"></i>
          </button>
          
          <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => handleTabClick('payments')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-wallet"></i></div> Payment Methods <i className="fas fa-chevron-right chevron-icon desktop-hidden"></i>
          </button>
          
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => handleTabClick('settings')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-cog"></i></div> Settings <i className="fas fa-chevron-right chevron-icon desktop-hidden"></i>
          </button>
          
          <button className={activeTab === 'support' ? 'active' : ''} onClick={() => handleTabClick('support')}>
            <div className="sidebar-icon-swiggy"><i className="far fa-question-circle"></i></div> Help & Support <i className="fas fa-chevron-right chevron-icon desktop-hidden"></i>
          </button>

          <button className={activeTab === 'devices' ? 'active' : ''} onClick={() => handleTabClick('devices')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-laptop"></i></div> Manage Devices <i className="fas fa-chevron-right chevron-icon desktop-hidden"></i>
          </button>
          
          <button className="logout-btn-swiggy" onClick={() => {
            localStorage.removeItem('token');
            window.location.href = '/';
          }}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-sign-out-alt"></i></div> Logout <i className="fas fa-chevron-right chevron-icon desktop-hidden"></i>
          </button>
        </div>

        {/* Content */}
        <div className={`account-content-swiggy ${showMobileMenu ? 'mobile-hidden' : ''}`}>
          <div className="mobile-content-header desktop-hidden" style={{ display: 'flex', alignItems: 'center', padding: '15px', background: '#fff', position: 'sticky', top: 0, zIndex: 10, boxShadow: '0 2px 5px rgba(0,0,0,0.05)', marginBottom: '15px' }}>
            <button onClick={() => setShowMobileMenu(true)} style={{ background: 'none', border: 'none', fontSize: '18px', marginRight: '15px', color: '#333' }}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <h2 style={{ fontSize: '18px', margin: 0, color: '#111' }}>
              {activeTab === 'orders' ? 'My Orders' : 
               activeTab === 'devices' ? 'Manage Devices' : 
               activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
          </div>
          {activeTab === 'orders' && (
            <div className="past-orders-section">
              <h2 className="section-title-swiggy">Past Orders</h2>
              
              {loadingOrders ? (
                <p>Loading orders...</p>
              ) : orders.length === 0 ? (
                <p>No past orders found.</p>
              ) : (
                orders.slice(0, visibleOrdersCount).map(order => (
                  <div key={order._id} className="order-card-swiggy" style={{ marginBottom: '20px' }}>
                    <div className="order-header-swiggy">
                      <div className="order-restaurant-info-swiggy">
                        <img src={order.restaurantImage || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=100&q=80"} alt={order.restaurantName || 'Restaurant'} className="restaurant-image-swiggy" />
                        <div>
                          <h3>{order.restaurantName || "Restaurant"}</h3>
                          <p className="order-location-swiggy">{order.restaurantLocation || "Location"}</p>
                          <p className="order-meta-swiggy">ORDER #{order._id} | {new Date(order.createdAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          <button className="view-details-btn-swiggy" onClick={() => handleViewDetails(order)}>
                            VIEW DETAILS
                          </button>
                        </div>
                      </div>
                      <div className="order-status-swiggy">
                        {order.status || 'Placed'} on {new Date(order.updatedAt || order.createdAt).toLocaleString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })} <i className="fas fa-check-circle" style={{ color: '#60b246', marginLeft: '6px' }}></i>
                      </div>
                    </div>
                    
                    <div className="order-divider-swiggy"></div>
                    
                    <div className="order-items-swiggy">
                      <p>{order.items?.map(item => `${item.name} x ${item.quantity}`).join(', ')}</p>
                      <p className="order-total-swiggy">Total Paid: ₹ {order.grandTotal}</p>
                    </div>
                    
                    <div className="order-actions-swiggy">
                      <button className="reorder-btn-swiggy">REORDER</button>
                      <button className="help-btn-swiggy">HELP</button>
                    </div>
                  </div>
                ))
              )}

              {orders.length > visibleOrdersCount && (
                <div className="show-more-orders-swiggy">
                  <button onClick={() => setVisibleOrdersCount(prev => prev + 5)}>SHOW MORE ORDERS</button>
                </div>
              )}
            </div>
          )}
          {activeTab === 'addresses' && (
            <div className="past-orders-section" style={{ padding: '0 20px' }}>
              <h2 className="section-title-swiggy" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '25px', color: '#282c3f' }}>Manage Addresses</h2>
              
              <div className="addresses-grid" style={{ display: 'grid', gap: '20px' }}>

                {addresses.map(address => (
                  <div key={address._id} style={{ border: '1px solid #d4d5d9', padding: '24px', backgroundColor: '#fff', position: 'relative' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                      <i className={`fas fa-${address.label?.toLowerCase() === 'home' ? 'home' : address.label?.toLowerCase() === 'work' ? 'briefcase' : 'map-marker-alt'}`} style={{ fontSize: '20px', color: '#282c3f', marginRight: '16px', marginTop: '3px' }}></i>
                      <div>
                        <div style={{ fontSize: '15px', fontWeight: '600', color: '#282c3f', marginBottom: '8px', textTransform: 'uppercase' }}>{address.label || 'OTHER'}</div>
                        <div style={{ fontSize: '13px', color: '#93959f', lineHeight: '1.4', marginBottom: '16px' }}>
                          {address.line1}{address.line2 ? `, ${address.line2}` : ''}, {address.city}{address.state ? `, ${address.state}` : ''} {address.postalCode} {address.phone ? `(Ph: ${address.phone})` : ''}
                        </div>
                        <div style={{ display: 'flex', gap: '24px' }}>
                          <button 
                            style={{ background: 'none', border: 'none', color: '#fc8019', fontWeight: '600', fontSize: '14px', cursor: 'pointer', padding: 0 }}
                            onClick={() => { setEditingAddress(address); setIsAddressDrawerOpen(true); }}
                          >
                            EDIT
                          </button>
                          <button 
                            style={{ background: 'none', border: 'none', color: '#fc8019', fontWeight: '600', fontSize: '14px', cursor: 'pointer', padding: 0 }}
                            onClick={() => setAddressToDelete(address._id)}
                          >
                            DELETE
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="past-orders-section" style={{ padding: '0 20px' }}>
              <h2 className="section-title-swiggy" style={{ fontSize: '20px', fontWeight: '800', marginBottom: '25px', color: '#282c3f' }}>Settings</h2>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f1f6', paddingBottom: '25px' }}>
                  <div style={{ maxWidth: '80%' }}>
                    <h3 style={{ fontSize: '16px', color: '#282c3f', fontWeight: '600', marginBottom: '8px' }}>SMS Preferences</h3>
                    <p style={{ fontSize: '14px', color: '#7e808c', margin: 0, lineHeight: '1.4' }}>Order related SMS cannot be disabled as they are critical to provide service</p>
                  </div>
                  {/* Disabled checked toggle look */}
                  <div style={{ width: '36px', height: '20px', backgroundColor: '#60b246', borderRadius: '10px', position: 'relative', opacity: 0.6 }}>
                    <div style={{ width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', position: 'absolute', right: '2px', top: '2px' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid #f1f1f6', paddingBottom: '25px' }}>
                  <div style={{ maxWidth: '80%' }}>
                    <h3 style={{ fontSize: '16px', color: '#282c3f', fontWeight: '600', marginBottom: '8px' }}>Promotional Emails</h3>
                    <p style={{ fontSize: '14px', color: '#7e808c', margin: 0, lineHeight: '1.4' }}>Receive alerts on offers, personalized recommendations and new launches directly in your inbox</p>
                  </div>
                  {/* Interactive toggle */}
                  <div 
                    onClick={() => setPromoEmailEnabled(!promoEmailEnabled)}
                    style={{ 
                      width: '36px', height: '20px', 
                      backgroundColor: promoEmailEnabled ? '#60b246' : '#d4d5d9', 
                      borderRadius: '10px', position: 'relative', cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', 
                      position: 'absolute', top: '2px', 
                      left: promoEmailEnabled ? '18px' : '2px',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: '25px' }}>
                  <div style={{ maxWidth: '80%' }}>
                    <h3 style={{ fontSize: '16px', color: '#282c3f', fontWeight: '600', marginBottom: '8px' }}>WhatsApp Alerts</h3>
                    <p style={{ fontSize: '14px', color: '#7e808c', margin: 0, lineHeight: '1.4' }}>Keep your WhatsApp connected to get real-time order updates</p>
                  </div>
                  {/* Interactive toggle */}
                  <div 
                    onClick={() => setWhatsappEnabled(!whatsappEnabled)}
                    style={{ 
                      width: '36px', height: '20px', 
                      backgroundColor: whatsappEnabled ? '#60b246' : '#d4d5d9', 
                      borderRadius: '10px', position: 'relative', cursor: 'pointer',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{ 
                      width: '16px', height: '16px', backgroundColor: '#fff', borderRadius: '50%', 
                      position: 'absolute', top: '2px', 
                      left: whatsappEnabled ? '18px' : '2px',
                      transition: 'left 0.2s',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                    }}></div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="past-orders-section" style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f1f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <i className="fas fa-wallet" style={{ fontSize: '32px', color: '#93959f' }}></i>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: '#282c3f' }}>Payments</h2>
              <p style={{ fontSize: '15px', color: '#7e808c', maxWidth: '300px', margin: '0 auto', lineHeight: '1.5' }}>
                Payments feature will come soon. Stay tuned!
              </p>
            </div>
          )}

          {activeTab === 'favourites' && (
            <div className="past-orders-section" style={{ padding: '60px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: '80px', height: '80px', borderRadius: '50%', backgroundColor: '#f1f1f6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                <i className="far fa-heart" style={{ fontSize: '32px', color: '#93959f' }}></i>
              </div>
              <h2 style={{ fontSize: '20px', fontWeight: '800', marginBottom: '12px', color: '#282c3f' }}>Where is the love?</h2>
              <p style={{ fontSize: '15px', color: '#7e808c', maxWidth: '300px', margin: '0 auto', lineHeight: '1.5' }}>
                Once you favourite a restaurant, it will appear here.
              </p>
            </div>
          )}

          {activeTab === 'support' && (
            <div className="past-orders-section" style={{ padding: '0 20px' }}>
              <SupportForm />
            </div>
          )}

          {activeTab === 'devices' && (
            <div className="devices-section-swiggy">
              <h2 className="section-title-swiggy" style={{ marginTop: '20px' }}>Manage Login Devices</h2>
              <p style={{ color: '#666', marginBottom: '20px', fontSize: '14px' }}>Review the devices currently logged into your account. Delete a device to automatically log it out.</p>
              
              <div className="devices-list">
                {loadingDevices ? (
                  <p style={{ textAlign: 'center', color: '#888' }}>Loading devices...</p>
                ) : (
                  loginDevices.map(device => (
                    <div key={device.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px', background: '#fff', border: '1px solid #eee', borderRadius: '12px', marginBottom: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ fontSize: '24px', color: device.current ? '#f26522' : '#888', marginRight: '15px', width: '30px', textAlign: 'center' }}>
                          <i className={device.device.toLowerCase().includes('iphone') || device.device.toLowerCase().includes('mobile') ? 'fas fa-mobile-alt' : 'fas fa-laptop'}></i>
                        </div>
                        <div>
                          <h4 style={{ margin: 0, fontSize: '15px', color: '#333' }}>{device.device} {device.current && <span style={{ fontSize: '11px', background: '#e5f8ed', color: '#00a85a', padding: '2px 6px', borderRadius: '4px', marginLeft: '5px' }}>Current</span>}</h4>
                          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>{device.os} • {device.browser}</p>
                          <p style={{ margin: '4px 0 0 0', fontSize: '11px', color: '#999' }}>IP: {device.ip} • Last Active: {device.lastActive}</p>
                        </div>
                      </div>
                      
                      {!device.current ? (
                        <button 
                          onClick={() => !device.deleting && !device.deleted && handleDeleteDevice(device.id)}
                          style={{ 
                            background: device.deleted ? '#e5f8ed' : '#fff5f5', 
                            color: device.deleted ? '#00a85a' : '#e43b4f', 
                            border: `1px solid ${device.deleted ? '#c3e6cb' : '#f8d7da'}`, 
                            borderRadius: '6px', 
                            padding: '8px 12px', 
                            fontSize: '13px', 
                            fontWeight: 'bold',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            minWidth: '80px',
                            justifyContent: 'center',
                            transition: 'all 0.3s ease'
                          }}
                          disabled={device.deleting || device.deleted}
                        >
                          {device.deleting ? (
                            <i className="fas fa-spinner fa-spin"></i>
                          ) : device.deleted ? (
                            <><i className="fas fa-check-circle animated-tick"></i> Logged Out</>
                          ) : (
                            'Delete'
                          )}
                        </button>
                      ) : null}
                    </div>
                  ))
                )}
                
                {!loadingDevices && loginDevices.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#888', marginTop: '20px' }}>No active devices found.</p>
                )}
              </div>
            </div>
          )}

          {activeTab !== 'orders' && activeTab !== 'addresses' && activeTab !== 'settings' && activeTab !== 'payments' && activeTab !== 'favourites' && activeTab !== 'support' && activeTab !== 'devices' && (
            <div style={{ padding: '40px', fontSize: '18px', color: '#7e808c' }}>
              Content for {activeTab} will appear here.
            </div>
          )}
        </div>
      </div>
      <OrderDetailsDrawer 
        isOpen={!!viewingOrderDetails} 
        onClose={() => setViewingOrderDetails(null)} 
        order={viewingOrderDetails} 
      />
      <AddressDrawer 
        isOpen={isAddressDrawerOpen} 
        onClose={() => setIsAddressDrawerOpen(false)}
        address={editingAddress}
        onSave={handleSaveAddress}
      />

      {/* Delete Confirmation Modal */}
      {addressToDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '4px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            width: '400px',
            textAlign: 'center'
          }}>
            <h3 style={{ margin: '0 0 24px 0', fontSize: '18px', fontWeight: '700', color: '#282c3f' }}>
              Are you sure you want to delete this address?
            </h3>
            <div style={{ display: 'flex', gap: '15px', justifyContent: 'center' }}>
              <button 
                onClick={() => setAddressToDelete(null)}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'white',
                  color: 'black',
                  border: '1px solid black',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                CANCEL
              </button>
              <button 
                onClick={() => {
                  handleDeleteAddress(addressToDelete);
                  setAddressToDelete(null);
                }}
                style={{
                  flex: 1,
                  padding: '12px',
                  backgroundColor: 'black',
                  color: 'white',
                  border: 'none',
                  fontWeight: '600',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                DELETE
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Drawer */}
      <EditProfileDrawer 
        isOpen={isEditProfileDrawerOpen} 
        onClose={() => setIsEditProfileDrawerOpen(false)} 
        user={user} 
      />

    </div>
  );
};

export default Account;
