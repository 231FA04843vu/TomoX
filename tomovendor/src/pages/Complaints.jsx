import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { Toast, useToast } from '../components/Toast';
import '../styles/dashboard.css';

const API_URL = import.meta.env.VITE_API || 'http://localhost:5000';

function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const vendorInfo = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  const vendorToken = localStorage.getItem('vendorToken');
  const { toasts, showToast, removeToast } = useToast();

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/api/support/vendor/list`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
        setComplaints(res.data);
      } catch (err) {
        console.error('Failed to fetch complaints:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (vendorToken) {
      fetchComplaints();
    } else {
      setLoading(false);
    }
  }, [vendorToken]);

  useEffect(() => {
    if (!vendorToken) return;
    
    const socket = io(API_URL, { auth: { token: vendorToken, isVendor: true } });
    
    socket.on('new-complaint', (complaint) => {
      showToast('New complaint received', 'warning');
      setComplaints(prev => [complaint, ...prev]);
    });

    return () => socket.disconnect();
  }, [vendorToken, showToast]);

  const updateComplaintStatus = async (id, status) => {
    try {
      await axios.put(`${API_URL}/api/support/${id}`, { status }, {
        headers: { Authorization: `Bearer ${vendorToken}` } // Optional if backend doesn't enforce
      });
      showToast(`Complaint marked as ${status}`, 'success');
      setComplaints(prev => prev.map(c => c._id === id ? { ...c, status } : c));
    } catch (err) {
      console.error('Failed to update complaint status:', err);
      showToast('Failed to update status', 'error');
    }
  };

  return (
    <div className="sw-layout-split" style={{ height: '100vh', display: 'flex' }}>
      <Toast toasts={toasts} removeToast={removeToast} />
      <div className="sw-layout-sidebar" style={{ width: '300px', padding: '16px', background: 'var(--sw-sidebar-bg)', color: 'white', flexShrink: 0 }}>
        
        <div style={{ background: '#d4edda', color: '#155724', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <i className="fas fa-check-circle" style={{ color: 'var(--sw-green)', fontSize: '20px' }}></i>
            <strong style={{ fontSize: '15px' }}>Manage Complaints</strong>
          </div>
          <p style={{ margin: '0 0 12px 0', fontSize: '12px' }}>
            Respond to customer issues promptly to maintain a high rating.
          </p>
          <div style={{ borderTop: '1px dashed #c3e6cb', paddingTop: '12px', fontSize: '12px', fontWeight: 'bold' }}>
            {vendorInfo.name || 'Your Restaurant'}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <select style={{ width: '150px', padding: '8px', borderRadius: '4px', border: 'none' }}>
            <option>All Issues</option>
            <option>Pending</option>
            <option>Resolved</option>
          </select>
        </div>

        <div style={{ marginBottom: '16px', fontSize: '12px', fontWeight: 'bold' }}>SORT BY</div>
        <div style={{ display: 'flex' }}>
          <button style={{ flex: 1, padding: '10px', background: 'var(--sw-orange)', color: 'white', border: 'none', fontSize: '12px', fontWeight: 'bold' }}>Newest</button>
        </div>
      </div>

      <div className="sw-layout-main" style={{ flex: 1, background: 'var(--sw-bg)', padding: '24px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading complaints...</div>
        ) : complaints.length === 0 ? (
          <div className="sw-empty-state" style={{ textAlign: 'center', marginTop: '100px' }}>
            <img src="https://cdn-icons-png.flaticon.com/512/3237/3237429.png" alt="Heart Hands" style={{ width: '80px', marginBottom: '16px', margin: '0 auto' }} />
            <h3 style={{ fontSize: '16px', color: 'var(--sw-text-dark)' }}>You don't have any complaints from customers yet <span role="img" aria-label="smile">😊</span></h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
            {complaints.map(complaint => (
              <div key={complaint._id} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--sw-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--sw-text-dark)' }}>{complaint.name}</span>
                    <span style={{ color: 'var(--sw-text-light)', marginLeft: '12px', fontSize: '13px' }}>Order: #{complaint.orderId.slice(-6).toUpperCase()}</span>
                  </div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    background: complaint.status === 'resolved' ? '#d4edda' : '#fff3cd',
                    color: complaint.status === 'resolved' ? '#155724' : '#856404'
                  }}>
                    {complaint.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ marginBottom: '16px', color: 'var(--sw-text-dark)', fontSize: '14px', lineHeight: '1.5' }}>
                  {complaint.message}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--sw-border)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--sw-text-light)' }}>
                    {new Date(complaint.createdAt).toLocaleString()} • {complaint.phone || complaint.email}
                  </div>
                  {complaint.status !== 'resolved' && (
                    <button 
                      onClick={() => updateComplaintStatus(complaint._id, 'resolved')}
                      style={{ background: 'var(--sw-green)', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Complaints;
