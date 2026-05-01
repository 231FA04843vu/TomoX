import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Toast, useToast } from '../components/Toast';

const API = import.meta.env.VITE_API;

const STATUS_META = {
  pending: { className: 'warning', label: 'Pending' },
  accepted: { className: 'info', label: 'Accepted' },
  out_for_delivery: { className: 'info', label: 'Out for Delivery' },
  preparing: { className: 'info', label: 'Preparing' },
  completed: { className: 'success', label: 'Delivered' },
  delivered: { className: 'success', label: 'Delivered' },
  rejected: { className: 'danger', label: 'Rejected' },
};

function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { toasts, showToast, removeToast } = useToast();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('vendorToken');
      const res = await axios.get(`${API}/api/orders/vendor/list`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data || []);
    } catch (error) {
      console.error('Orders fetch error:', error);
      showToast('Unable to fetch orders', 'error');
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (orderId, status) => {
    try {
      const token = localStorage.getItem('vendorToken');
      await axios.put(
        `${API}/api/orders/${orderId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showToast(`Order ${status} successfully`, 'success');
      fetchOrders();
    } catch (error) {
      console.error('Order update error:', error);
      showToast('Unable to update order', 'error');
    }
  };

  useEffect(() => {
    fetchOrders();

    // Setup socket connection for real-time updates
    const token = localStorage.getItem('vendorToken');
    if (!token) return;

    const socket = io(API, {
      auth: { token, isVendor: true }
    });

    socket.on('connect', () => {
      console.log('✅ Connected to order notification system');
    });

    socket.on('new-order', (orderData) => {
      console.log('🔔 New order received:', orderData);
      showToast(`New order #${orderData.orderId.slice(-6)} - ₹${orderData.grandTotal}`, 'success');

      try {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSt+zPDaizsIE161+PGpVxQKRp/g8rx1KQYrfsfw3os7CBNct+PlpVUUCkaB4PK+byQGOwAA');
        audio.volume = 0.5;
        audio.play().catch((e) => console.log('Audio play failed:', e));
      } catch (e) {
        console.log('Notification sound error:', e);
      }

      fetchOrders();
    });

    socket.on('disconnect', () => {
      console.log('⚠️ Disconnected from notification system');
    });

    socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const filteredOrders = useMemo(() => {
    let next = [...orders];
    if (statusFilter !== 'all') next = next.filter((order) => order.status === statusFilter);
    if (query.trim()) {
      const q = query.toLowerCase();
      next = next.filter(
        (order) =>
          (order.customerName || '').toLowerCase().includes(q) ||
          (order._id || '').toLowerCase().includes(q)
      );
    }
    return next;
  }, [orders, statusFilter, query]);

  return (
    <div className="vx-stack">
      <Toast toasts={toasts} removeToast={removeToast} />

      <section className="vx-card vx-fade-in">
        <div className="vx-grid vx-grid-3">
          <div>
            <label className="vx-label">Search Orders</label>
            <input
              className="vx-input"
              placeholder="Order ID / customer"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </div>

          <div>
            <label className="vx-label">Status</label>
            <select className="vx-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="accepted">Accepted</option>
              <option value="out_for_delivery">Out for Delivery</option>
              <option value="delivered">Delivered</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <article className="vx-card" style={{ padding: '12px' }}>
            <p style={{ margin: 0, color: '#9aa7d4', fontSize: '12px' }}>Visible Orders</p>
            <h3 style={{ margin: '6px 0 0' }}>{filteredOrders.length}</h3>
          </article>
        </div>
      </section>

      {loading ? (
        <div className="vx-stack" style={{ gap: '14px' }}>
          <div className="vx-grid vx-grid-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="vx-card vx-skeleton" style={{ height: '280px' }}></div>
            ))}
          </div>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="vx-empty-state vx-fade-in">
          <i className="fas fa-receipt" style={{ fontSize: '48px', color: '#fc8019', marginBottom: '16px' }}></i>
          <h4>No matching orders</h4>
          <p>Try another query or status filter.</p>
        </div>
      ) : (
        <section className="vx-grid vx-grid-2 vx-fade-in" style={{ animationDelay: '0.1s' }}>
          {filteredOrders.map((order) => {
            const status = STATUS_META[order.status] || STATUS_META.pending;
            return (
              <article key={order._id} className="vx-card">
                <div className="vx-card-head">
                  <div>
                    <h3>Order #{(order._id || '').slice(-6)}</h3>
                    <p>{new Date(order.createdAt).toLocaleString()}</p>
                  </div>
                  <span className={`vx-pill ${status.className}`}>{status.label}</span>
                </div>

                <div className="vx-stack" style={{ gap: '8px' }}>
                  <p style={{ margin: 0 }}><strong>Customer:</strong> {order.customerName || 'Guest'}</p>
                  <p style={{ margin: 0 }}><strong>Phone:</strong> {order.customerPhone || 'N/A'}</p>
                  <p style={{ margin: 0 }}><strong>Total:</strong> ₹{order.grandTotal || order.totalPrice || 0}</p>
                  {order.customerAddress && (
                    <p style={{ margin: 0, fontSize: '13px', color: '#9aa7d4' }}><strong>Address:</strong> {order.customerAddress}</p>
                  )}
                </div>

                <div style={{ marginTop: '12px' }}>
                  <p className="vx-label" style={{ marginBottom: '6px' }}>Items ({order.items?.length || 0})</p>
                  <div className="vx-card" style={{ padding: '10px', background: 'rgba(7,12,25,0.6)' }}>
                    {(order.items || []).map((item, index) => (
                      <div key={`${item.name}-${index}`} className="vx-row" style={{ justifyContent: 'space-between', marginBottom: index === order.items.length - 1 ? 0 : '6px' }}>
                        <span>{item.name}</span>
                        <span style={{ color: '#9aa7d4' }}>x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="vx-row" style={{ marginTop: '12px', gap: '8px' }}>
                  {order.status === 'pending' && (
                    <>
                      <button className="vx-btn vx-btn-success" onClick={() => updateStatus(order._id, 'accepted')}>
                        <i className="fas fa-check"></i> Accept
                      </button>
                      <button className="vx-btn vx-btn-danger" onClick={() => updateStatus(order._id, 'rejected')}>
                        <i className="fas fa-times"></i> Reject
                      </button>
                    </>
                  )}
                  {order.status === 'accepted' && (
                    <button className="vx-btn vx-btn-primary" onClick={() => updateStatus(order._id, 'out_for_delivery')}>
                      <i className="fas fa-motorcycle"></i> Mark Out for Delivery
                    </button>
                  )}
                  {order.status === 'out_for_delivery' && (
                    <button className="vx-btn vx-btn-success" onClick={() => updateStatus(order._id, 'delivered')}>
                      <i className="fas fa-check-circle"></i> Mark Delivered
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}

export default Orders;
