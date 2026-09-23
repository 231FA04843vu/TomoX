import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Toast, useToast } from '../components/Toast';

const API = import.meta.env.VITE_API;

function Dashboard() {
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  const vendorId = vendor?._id || vendor?.id;
  const { toasts, showToast, removeToast } = useToast();

  const [stats, setStats] = useState(null);
  const [liveOrders, setLiveOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isAccepting, setIsAccepting] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/dashboard/stats/${vendorId}`);
        setStats(res.data.stats || { totalOrders: 0, totalRevenue: 0, averageRating: 0 });
        setLiveOrders(res.data.recentOrders?.filter(o => ['pending', 'accepted', 'preparing'].includes(o.status)) || []);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        setStats({ totalOrders: 0, totalRevenue: 0, averageRating: 0 });
        setLiveOrders([]);
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) {
      fetchDashboard();
    } else {
      console.warn('No vendorId found.');
      setStats({ totalOrders: 0, totalRevenue: 0, averageRating: 0 });
      setLiveOrders([]);
      setLoading(false);
    }
  }, [vendorId]);

  const handleStatusToggle = () => {
    setIsAccepting(!isAccepting);
    showToast(`Restaurant is now ${!isAccepting ? 'Online' : 'Offline'}`, !isAccepting ? 'success' : 'warning');
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { color: '#fc8019', bg: '#fff0e5', text: 'NEW' },
      accepted: { color: '#6e52c7', bg: '#f2effa', text: 'ACCEPTED' },
      preparing: { color: '#2b91f0', bg: '#ebf4fc', text: 'PREPARING' },
    };
    const b = badges[status] || { color: '#7e808c', bg: '#f1f1f6', text: status.toUpperCase() };
    return <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700', color: b.color, backgroundColor: b.bg }}>{b.text}</span>;
  };

  if (loading) {
    return (
      <div className="partner-dash-loading">
        <div className="vx-skeleton" style={{ height: '80px', borderRadius: '12px', marginBottom: '24px' }}></div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
          <div className="vx-skeleton" style={{ height: '400px', borderRadius: '12px' }}></div>
          <div className="vx-skeleton" style={{ height: '400px', borderRadius: '12px' }}></div>
        </div>
      </div>
    );
  }

  return (
    <div className="partner-dash-wrapper vx-fade-in">
      <Toast toasts={toasts} removeToast={removeToast} />

      {/* Partner Header */}
      <div className="partner-header-card">
        <div>
          <h1 className="partner-restaurant-name">{vendor?.name || 'My Restaurant'}</h1>
          <p className="partner-restaurant-id">ID: {vendorId?.slice(-6)?.toUpperCase() || 'TX-101'}</p>
        </div>

        <div className="partner-toggle-container">
          <span style={{ fontWeight: '600', color: isAccepting ? '#60b246' : '#7e808c' }}>
            {isAccepting ? 'Accepting Orders' : 'Offline'}
          </span>
          <label className="partner-switch">
            <input type="checkbox" checked={isAccepting} onChange={handleStatusToggle} />
            <span className="partner-slider"></span>
          </label>
        </div>
      </div>

      <div className="partner-dash-grid">
        {/* Left Column: Live Orders */}
        <div className="partner-orders-col">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 className="partner-section-title">Live Orders ({liveOrders.length})</h2>
            <Link to="/orders" className="partner-link">View All</Link>
          </div>

          {liveOrders.length === 0 ? (
            <div className="partner-empty-state">
              <i className="fas fa-motorcycle" style={{ fontSize: '48px', color: '#d4d5d9', marginBottom: '16px' }}></i>
              <h3 style={{ color: '#282c3f', margin: '0 0 8px' }}>No active orders</h3>
              <p style={{ color: '#7e808c', fontSize: '14px', margin: 0 }}>Orders will appear here as soon as they are placed.</p>
            </div>
          ) : (
            <div className="partner-orders-list">
              {liveOrders.map(order => (
                <div key={order._id} className="partner-order-card">
                  <div className="poc-header">
                    <div>
                      <span className="poc-id">#{order._id?.slice(-5)?.toUpperCase() || 'N/A'}</span>
                      <span className="poc-time">Just now</span>
                    </div>
                    {getStatusBadge(order.status)}
                  </div>
                  <div className="poc-body">
                    <div style={{ fontWeight: '600', color: '#282c3f' }}>{order.customerName || 'Customer'}</div>
                    <div style={{ color: '#7e808c', fontSize: '13px' }}>1x Biryani, 2x Coke</div>
                  </div>
                  <div className="poc-footer">
                    <span style={{ fontWeight: '700', color: '#282c3f' }}>₹{order.total || 0}</span>
                    {order.status === 'pending' ? (
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="poc-btn reject">Reject</button>
                        <button className="poc-btn accept">Accept</button>
                      </div>
                    ) : (
                      <button className="poc-btn mark-ready">Mark Ready</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Today's Perf & Quick Links */}
        <div className="partner-sidebar-col">
          <h2 className="partner-section-title" style={{ marginBottom: '16px' }}>Today's Performance</h2>

          <div className="partner-stat-card">
            <div className="psc-icon"><i className="fas fa-indian-rupee-sign"></i></div>
            <div className="psc-content">
              <div className="psc-label">Revenue</div>
              <div className="psc-value">₹{(stats?.totalRevenue || 0).toLocaleString()}</div>
            </div>
          </div>

          <div className="partner-stat-card">
            <div className="psc-icon" style={{ background: '#f2effa', color: '#6e52c7' }}><i className="fas fa-bag-shopping"></i></div>
            <div className="psc-content">
              <div className="psc-label">Orders Delivered</div>
              <div className="psc-value">{stats?.totalOrders || 0}</div>
            </div>
          </div>

          <div className="partner-stat-card">
            <div className="psc-icon" style={{ background: '#ebf4fc', color: '#2b91f0' }}><i className="fas fa-star"></i></div>
            <div className="psc-content">
              <div className="psc-label">Customer Rating</div>
              <div className="psc-value">{stats?.averageRating || '4.5'} <i className="fas fa-star" style={{ fontSize: '12px', color: '#fc8019' }}></i></div>
            </div>
          </div>

          <h2 className="partner-section-title" style={{ margin: '32px 0 16px' }}>Quick Actions</h2>
          <div className="partner-quick-links">
            <Link to="/menu" className="pql-item">
              <i className="fas fa-utensils"></i> Manage Menu
            </Link>
            <Link to="/restaurant-setup" className="pql-item">
              <i className="fas fa-store"></i> Edit Profile
            </Link>
            <Link to="/analytics" className="pql-item">
              <i className="fas fa-chart-line"></i> View Insights
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
