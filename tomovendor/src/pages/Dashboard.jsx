import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import StatCard from '../components/ui/StatCard';
import { Toast, useToast } from '../components/Toast';

const API = import.meta.env.VITE_API;

function Dashboard() {
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  const vendorId = vendor?._id || vendor?.id;
  const { toasts, showToast, removeToast } = useToast();

  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API}/api/dashboard/stats/${vendorId}`);
        setStats(res.data.stats || {});
        setRecentOrders(res.data.recentOrders || []);
      } catch (error) {
        console.error('Dashboard fetch error:', error);
        showToast('Unable to load dashboard data', 'error');
        // Fallback to empty data
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          activeMenuItems: 0,
          averageRating: 0,
          orderDelta: 0,
          revenueDelta: 0,
          menuDelta: 0,
          ratingDelta: 0,
        });
      } finally {
        setLoading(false);
      }
    };

    if (vendorId) fetchDashboard();
  }, [vendorId]);

  const quickActions = [
    { path: '/menu', icon: 'fa-plus', title: 'Create Dish', hint: 'Launch a new menu item with media + pricing.' },
    { path: '/orders', icon: 'fa-bolt', title: 'Process Orders', hint: 'Move active orders through each status stage.' },
    { path: '/analytics', icon: 'fa-chart-column', title: 'Review Growth', hint: 'Understand conversion and revenue movement.' },
    { path: '/restaurant-setup', icon: 'fa-sliders', title: 'Brand Settings', hint: 'Manage restaurant profile and identity.' },
  ];

  const getStatusDisplay = (status) => {
    const map = {
      pending: { class: 'warning', label: 'Pending' },
      accepted: { class: 'info', label: 'Accepted' },
      preparing: { class: 'info', label: 'Preparing' },
      completed: { class: 'success', label: 'Completed' },
      delivered: { class: 'success', label: 'Delivered' },
      rejected: { class: 'danger', label: 'Rejected' },
    };
    return map[status] || { class: 'info', label: status };
  };

  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes} mins ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} hours ago`;
    const days = Math.floor(hours / 24);
    return `${days} days ago`;
  };

  if (loading) {
    return (
      <div className="vx-stack">
        <div className="vx-grid vx-grid-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="vx-card vx-skeleton" style={{ height: '120px' }}></div>
          ))}
        </div>
        <div className="vx-card vx-skeleton" style={{ height: '300px' }}></div>
        <div className="vx-card vx-skeleton" style={{ height: '400px' }}></div>
      </div>
    );
  }

  return (
    <div className="vx-stack">
      <Toast toasts={toasts} removeToast={removeToast} />

      <div className="vx-grid vx-grid-4 vx-fade-in">
        <StatCard icon="fa-bag-shopping" label="Total Orders" value={stats?.totalOrders || 0} delta={stats?.orderDelta || 0} />
        <StatCard 
          icon="fa-indian-rupee-sign" 
          label="Revenue" 
          value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} 
          delta={stats?.revenueDelta || 0} 
          tone="accent" 
        />
        <StatCard icon="fa-utensils" label="Menu Items" value={stats?.activeMenuItems || 0} delta={stats?.menuDelta || 0} />
        <StatCard icon="fa-star" label="Customer Rating" value={stats?.averageRating || 0} delta={stats?.ratingDelta || 0} />
      </div>

      <section className="vx-card vx-fade-in" style={{ animationDelay: '0.1s' }}>
        <div className="vx-card-head">
          <div>
            <h3>Action Hub</h3>
            <p>High-impact tasks to keep your operation moving.</p>
          </div>
        </div>

        <div className="vx-grid vx-grid-2">
          {quickActions.map((action) => (
            <Link
              key={action.path}
              to={action.path}
              className="vx-action-card"
            >
              <div className="vx-row" style={{ justifyContent: 'space-between' }}>
                <h4 style={{ margin: 0, fontSize: '15px' }}>
                  <i className={`fas ${action.icon}`} style={{ marginRight: '8px', color: '#fc8019' }}></i>
                  {action.title}
                </h4>
                <i className="fas fa-arrow-right" style={{ color: '#9aa7d4' }}></i>
              </div>
              <p style={{ margin: '8px 0 0', color: '#9aa7d4', fontSize: '13px' }}>{action.hint}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="vx-card vx-fade-in" style={{ animationDelay: '0.2s' }}>
        <div className="vx-card-head">
          <div>
            <h3>Live Order Snapshot</h3>
            <p>{vendor?.name || 'Your restaurant'} latest high-priority transactions.</p>
          </div>
        </div>

        {recentOrders.length === 0 ? (
          <div className="vx-empty-state">
            <i className="fas fa-receipt" style={{ fontSize: '48px', color: '#fc8019', marginBottom: '16px' }}></i>
            <h4>No Orders Yet</h4>
            <p>Orders will appear here once customers start placing them.</p>
          </div>
        ) : (
          <table className="vx-table">
            <thead>
              <tr>
                <th>Order</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const statusInfo = getStatusDisplay(order.status);
                return (
                  <tr key={order.id}>
                    <td style={{ fontWeight: 700 }}>{order.orderNumber}</td>
                    <td>{order.customer}</td>
                    <td>{order.items}</td>
                    <td style={{ fontWeight: 700 }}>₹{order.amount}</td>
                    <td>
                      <span className={`vx-pill ${statusInfo.class}`}>
                        <i className="fas fa-circle" style={{ fontSize: '8px' }}></i>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>{formatTimeAgo(order.time)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

export default Dashboard;
