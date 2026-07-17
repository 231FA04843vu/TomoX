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

  const authToken = useMemo(() => localStorage.getItem("token"), []);
  const location = useLocation();

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

    fetchAddresses();
    fetchOrders();
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

  const handleViewDetails = (order) => {
    setViewingOrderDetails(order);
  };

  return (
    <div className="account-page-swiggy">
      {/* Hero Section */}
      <div className="account-hero-swiggy">
        <div className="account-hero-content">
          <div className="account-hero-text">
            <h2>Alla Vamsi Krishna</h2>
            <p>8520004688 . allavamsikrishna33@gmail.com</p>
          </div>
          <button className="edit-profile-btn-swiggy" onClick={() => setIsEditProfileDrawerOpen(true)}>EDIT PROFILE</button>
        </div>
      </div>

      {/* Main Layout */}
      <div className="account-layout-swiggy">
        {/* Sidebar */}
        <div className="account-sidebar-swiggy">
          <button className={activeTab === 'orders' ? 'active' : ''} onClick={() => setActiveTab('orders')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-shopping-bag"></i></div> Orders
          </button>

          <button className={activeTab === 'favourites' ? 'active' : ''} onClick={() => setActiveTab('favourites')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-heart"></i></div> Favourites
          </button>
          <button className={activeTab === 'payments' ? 'active' : ''} onClick={() => setActiveTab('payments')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-credit-card"></i></div> Payments
          </button>
          <button className={activeTab === 'addresses' ? 'active' : ''} onClick={() => setActiveTab('addresses')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-map-marker-alt"></i></div> Addresses
          </button>
          <button className={activeTab === 'settings' ? 'active' : ''} onClick={() => setActiveTab('settings')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-cog"></i></div> Settings
          </button>
          <button className={activeTab === 'support' ? 'active' : ''} onClick={() => setActiveTab('support')}>
            <div className="sidebar-icon-swiggy"><i className="fas fa-headset"></i></div> Customer Support
          </button>
        </div>

        {/* Content */}
        <div className="account-content-swiggy">
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
              
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>

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

          {activeTab !== 'orders' && activeTab !== 'addresses' && activeTab !== 'settings' && activeTab !== 'payments' && activeTab !== 'favourites' && activeTab !== 'support' && (
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
