import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import '../styles/dashboard.css';

const API_URL = import.meta.env.VITE_API || 'http://localhost:5000';

function Orders() {
  const [activeTab, setActiveTab] = useState('new'); // new, preparing, ready, picked_up, past
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showOrdersSetting, setShowOrdersSetting] = useState(() => {
    return localStorage.getItem('swiggy_showOrders') !== 'false';
  });

  useEffect(() => {
    const handleSettingsChange = () => {
      setShowOrdersSetting(localStorage.getItem('swiggy_showOrders') !== 'false');
    };
    window.addEventListener('showOrdersChanged', handleSettingsChange);
    return () => window.removeEventListener('showOrdersChanged', handleSettingsChange);
  }, []);

  const audioRef = useRef(null);

  const vendorToken = localStorage.getItem('vendorToken');
  const vendorInfo = JSON.parse(localStorage.getItem('vendorInfo') || '{}');

  const fetchOrders = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/orders/vendor/list`, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      setOrders(res.data);
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  }, [vendorToken]);

  useEffect(() => {
    fetchOrders();

    // Setup Audio
    audioRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3'); // Generic ding

    // Setup Socket
    const socket = io(API_URL, {
      auth: { token: vendorToken, isVendor: true }
    });

    socket.on('connect', () => console.log('Socket connected for vendor orders'));

    socket.on('new-order', (order) => {
      console.log('New Order Received via Socket:', order);
      setOrders(prev => [order, ...prev]);

      // Play sound
      if (audioRef.current) {
        audioRef.current.play().catch(e => console.log('Audio play failed', e));
      }
    });

    socket.on('orderUpdated', (updatedOrder) => {
      console.log('Order Updated via Socket:', updatedOrder);
      setOrders(prev => prev.map(o => o._id === updatedOrder._id ? updatedOrder : o));
      if (selectedOrder && selectedOrder._id === updatedOrder._id) {
        setSelectedOrder(updatedOrder);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [fetchOrders, vendorToken, selectedOrder]);

  const updateOrderStatus = async (orderId, status) => {
    try {
      const res = await axios.put(`${API_URL}/api/orders/${orderId}/status`, { status }, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data : o));
      if (selectedOrder && selectedOrder._id === orderId) {
        setSelectedOrder(res.data);
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update order status');
    }
  };

  // Filter logic based on tabs
  const getFilteredOrders = () => {
    if (activeTab === 'past') {
      return orders.filter(o => ['delivered', 'cancelled', 'rejected'].includes(o.status));
    }

    let filterStatus = activeTab;

    return orders.filter(o => {
      const status = o.status === 'pending' ? 'new' :
        o.status === 'accepted' ? 'preparing' :
          o.status === 'out_for_delivery' ? 'picked_up' :
            o.status;
      return status === filterStatus;
    });
  };

  const filteredOrders = getFilteredOrders();

  const tabs = [
    { id: 'new', label: 'New' },
    { id: 'preparing', label: 'Preparing' },
    { id: 'ready', label: 'Ready' },
    { id: 'picked_up', label: 'Picked Up' },
    { id: 'past', label: 'Past Orders' }
  ];

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const renderSidebarOrderList = () => {
    return (
      <div className="sw-layout-sidebar">
        <div style={{ padding: '16px', borderBottom: '1px solid var(--sw-border)', fontWeight: 'bold' }}>
          {tabs.find(t => t.id === activeTab)?.label} ({filteredOrders.length})
        </div>

        {filteredOrders.length === 0 ? (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--sw-text-light)' }}>
            <p>No orders here.</p>
          </div>
        ) : (
          filteredOrders.map(order => (
            <div
              key={order._id}
              style={{
                padding: '16px',
                borderBottom: '1px solid var(--sw-border)',
                cursor: 'pointer',
                background: selectedOrder?._id === order._id ? '#fef3e5' : 'var(--sw-card-bg)',
                borderLeft: selectedOrder?._id === order._id ? '4px solid var(--sw-orange)' : '4px solid transparent'
              }}
              onClick={() => setSelectedOrder(order)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <div style={{ fontSize: '14px', fontWeight: 'bold', marginBottom: '4px' }}>
                  #{order._id.substring(order._id.length - 6).toUpperCase()}
                </div>
                <div style={{ fontSize: '13px', fontWeight: 'bold' }}>₹{order.grandTotal}</div>
              </div>
              <div style={{ fontSize: '12px', color: 'var(--sw-text-light)' }}>
                {formatDate(order.createdAt)} | {order.items?.length || 0} Items
              </div>

              <div style={{ fontSize: '12px', color: 'var(--sw-text-dark)', marginTop: '8px', fontWeight: 'bold' }}>
                <span style={{
                  color: (order.status === 'cancelled' || order.status === 'rejected') ? 'var(--sw-red)' :
                    order.status === 'delivered' ? 'var(--sw-green)' : 'var(--sw-orange)'
                }}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    );
  };

  const renderOrderDetails = () => {
    if (!selectedOrder) {
      return (
        <div className="sw-layout-main" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--sw-bg)' }}>
          <div className="sw-empty-state">
            <i className="fas fa-receipt" style={{ fontSize: '64px', color: '#ccc', marginBottom: '24px' }}></i>
            <h3>Select an Order</h3>
            <p>Click on an order from the list to view details</p>
          </div>
        </div>
      );
    }

    const o = selectedOrder;

    return (
      <div className="sw-layout-main" style={{ background: 'var(--sw-bg)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px', background: 'white', padding: '24px', borderRadius: '8px', border: '1px solid var(--sw-border)' }}>
          <div>
            <h2 style={{ margin: 0, fontSize: '20px' }}>Order #{o._id.toUpperCase()}</h2>
            <p style={{ margin: '8px 0 0 0', fontSize: '13px', color: 'var(--sw-text-light)' }}>
              {formatDate(o.createdAt)} | {o.items?.length || 0} Items, ₹{o.grandTotal} | Paid Online
            </p>
            <div style={{ marginTop: '12px' }}>
              <strong>Customer:</strong> {o.customerName}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'flex-end' }}>
            <button className="sw-btn sw-btn-dark" style={{ background: 'transparent', color: 'var(--sw-text-dark)', border: '1px solid var(--sw-border)' }}>
              <i className="fas fa-print"></i> Print Bill
            </button>

            {(o.status === 'new' || o.status === 'pending') && (
              <div style={{ display: 'flex', gap: '10px' }}>
                <button className="sw-btn" style={{ background: 'var(--sw-red)' }} onClick={() => updateOrderStatus(o._id, 'cancelled')}>Reject</button>
                <button className="sw-btn" onClick={() => updateOrderStatus(o._id, 'preparing')}>Accept Order</button>
              </div>
            )}

            {(o.status === 'preparing' || o.status === 'accepted') && (
              <button className="sw-btn sw-btn-green" onClick={() => updateOrderStatus(o._id, 'ready')}>Food Ready</button>
            )}

            {o.status === 'ready' && (
              <button className="sw-btn sw-btn-dark" onClick={() => updateOrderStatus(o._id, 'picked_up')}>Mark Picked Up</button>
            )}

            {o.status === 'picked_up' && (
              <button className="sw-btn" onClick={() => updateOrderStatus(o._id, 'delivered')}>Mark Delivered</button>
            )}
          </div>
        </div>

        <div className="sw-setting-card" style={{ padding: '0', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--sw-border)', background: '#fafafa' }}>
            <h3 style={{ margin: 0, fontSize: '15px' }}>Item Details</h3>
          </div>

          <div style={{ padding: '20px' }}>
            {o.items?.map((item, idx) => (
              <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #f0f0f0', paddingBottom: '16px', marginBottom: '16px' }}>
                <div>
                  <span style={{ color: item.isVeg ? 'var(--sw-green)' : 'var(--sw-red)', marginRight: '8px' }}>
                    <i className="fas fa-stop-circle" style={{ fontSize: '12px' }}></i>
                  </span>
                  <strong>{item.name}</strong>
                  {item.variant && <div style={{ fontSize: '12px', color: 'var(--sw-text-light)', marginLeft: '20px' }}>{item.variant}</div>}
                </div>
                <div style={{ display: 'flex', gap: '32px', minWidth: '100px', justifyContent: 'flex-end' }}>
                  <span>x {item.quantity}</span>
                  <strong>₹{item.price * item.quantity}</strong>
                </div>
              </div>
            ))}

            <div style={{ width: '100%', display: 'flex', justifyContent: 'flex-end', paddingTop: '8px' }}>
              <div style={{ width: '300px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                  <span>Items Total</span>
                  <span>₹{o.itemsSubtotal || o.grandTotal}</span>
                </div>
                {o.totalDiscount > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px', color: 'var(--sw-green)' }}>
                    <span>Discount</span>
                    <span>-₹{o.totalDiscount}</span>
                  </div>
                )}
                {o.deliveryCharges > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span>Delivery Charge</span>
                    <span>₹{o.deliveryCharges}</span>
                  </div>
                )}
                {o.gst > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '13px' }}>
                    <span>Taxes</span>
                    <span>₹{o.gst}</span>
                  </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--sw-border)', fontWeight: 'bold', fontSize: '16px' }}>
                  <span>Bill Total</span>
                  <span>₹{o.grandTotal}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const getCounts = () => {
    const counts = { new: 0, preparing: 0, ready: 0, picked_up: 0, past: 0 };
    orders.forEach(o => {
      if (['delivered', 'cancelled', 'rejected'].includes(o.status)) {
        counts.past++;
      } else {
        const s = o.status === 'pending' ? 'new' :
          o.status === 'accepted' ? 'preparing' :
            o.status === 'out_for_delivery' ? 'picked_up' :
              o.status;
        if (counts[s] !== undefined) counts[s]++;
      }
    });
    return counts;
  };

  const counts = getCounts();

  const renderManageOrders = () => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', background: 'var(--sw-bg)' }}>
        <div style={{ display: 'flex', padding: '0 24px', background: 'white', borderBottom: '1px solid var(--sw-border)', gap: '32px' }}>
          {tabs.map(tab => {
            const count = counts[tab.id] || 0;
            return (
              <div
                key={tab.id}
                className={`sw-tab ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => {
                  setActiveTab(tab.id);
                  setSelectedOrder(null);
                }}
                style={{
                  padding: '16px 0',
                  borderBottom: activeTab === tab.id ? '2px solid var(--sw-orange)' : '2px solid transparent',
                  color: activeTab === tab.id ? 'var(--sw-orange)' : 'var(--sw-text-dark)',
                  fontSize: '13px',
                  fontWeight: activeTab === tab.id ? 'bold' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px'
                }}
              >
                {tab.label}
                {count > 0 && (
                  <span style={{
                    background: '#e9e9eb',
                    color: '#3d4152',
                    padding: '2px 6px',
                    borderRadius: '4px',
                    fontSize: '10px',
                    fontWeight: 'bold'
                  }}>
                    {count}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div style={{ flex: 1, overflow: 'hidden' }}>
          {!showOrdersSetting ? (
            <div className="sw-empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--sw-bg)' }}>
              <h3 style={{ fontSize: '13px', fontWeight: '500', margin: '0 0 8px 0', color: 'var(--sw-text-dark)' }}>
                Updates regarding new orders is disabled right now.
              </h3>
              <p style={{ fontSize: '13px', margin: '0 0 24px 0', color: 'var(--sw-text-dark)' }}>
                Please go to settings if you are managing orders.
              </p>
              <button
                className="sw-btn sw-btn-dark"
                style={{ background: '#0f172a', fontSize: '12px', padding: '10px 24px', borderRadius: '4px' }}
                onClick={() => window.location.href = '/settings'}
              >
                GO TO SETTINGS
              </button>
            </div>
          ) : filteredOrders.length === 0 ? (
            (() => {
              const getEmptyStateDetails = (tab) => {
                switch (tab) {
                  case 'new': return {
                    icon: "fas fa-concierge-bell",
                    title: "No Orders!",
                    subtitle: "New orders will appear here"
                  };
                  case 'preparing': return {
                    icon: "fas fa-fire-burner",
                    title: "No Orders!",
                    subtitle: "Orders being prepared in your kitchen will appear here"
                  };
                  case 'ready': return {
                    icon: "fas fa-box-open",
                    title: "No Orders!",
                    subtitle: "Orders ready for delivery executive to pick up will appear here"
                  };
                  case 'picked_up': return {
                    icon: "fas fa-motorcycle",
                    title: "No Orders!",
                    subtitle: "Orders picked up by delivery executive will appear here"
                  };
                  case 'past': return {
                    icon: "fas fa-history",
                    title: "No Orders!",
                    subtitle: "Your past orders will appear here"
                  };
                  default: return {
                    icon: "fas fa-concierge-bell",
                    title: "No Orders!",
                    subtitle: "New orders will appear here"
                  };
                }
              };
              const { icon, title, subtitle } = getEmptyStateDetails(activeTab);
              return (
                <div className="sw-empty-state" style={{ height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f5f5f6' }}>
                  <i className={icon} style={{ fontSize: '80px', color: '#ccc', marginBottom: '24px' }}></i>
                  <h3 style={{ fontSize: '26px', fontWeight: '800', margin: '0 0 12px 0', color: '#3d4152', letterSpacing: '-0.5px' }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: '14px', margin: '0', color: '#7e808c', fontWeight: '500' }}>
                    {subtitle}
                  </p>
                </div>
              );
            })()
          ) : (
            <div className="sw-layout-split">
              {renderSidebarOrderList()}
              {renderOrderDetails()}
            </div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner message="Fetching your orders..." />
      </div>
    );
  }

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {renderManageOrders()}
      </div>
    </div>
  );
}

export default Orders;
