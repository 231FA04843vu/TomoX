import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const API_URL = import.meta.env.VITE_API || 'http://localhost:5000';

function VendorTickets() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const vendorToken = localStorage.getItem('vendorToken');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTickets = async () => {
      try {
        setLoading(true);
        // fetch with ?type=vendor to only get tickets raised by the vendor
        const res = await axios.get(`${API_URL}/api/support/vendor/list?type=vendor`, {
          headers: { Authorization: `Bearer ${vendorToken}` }
        });
        setTickets(res.data);
      } catch (err) {
        console.error('Failed to fetch vendor tickets:', err);
      } finally {
        setLoading(false);
      }
    };
    
    if (vendorToken) {
      fetchTickets();
    } else {
      setLoading(false);
    }
  }, [vendorToken]);

  return (
    <div className="sw-layout-split" style={{ height: '100vh', display: 'flex' }}>
      <div className="sw-layout-sidebar" style={{ width: '300px', padding: '16px', background: 'var(--sw-sidebar-bg)', color: 'white', flexShrink: 0 }}>
        <button onClick={() => navigate('/help')} style={{ background: 'none', border: 'none', color: 'var(--sw-orange)', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-arrow-left"></i> Back to Help
        </button>
        
        <div style={{ background: '#e3f2fd', color: '#0d47a1', padding: '16px', borderRadius: '8px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <i className="fas fa-ticket-alt" style={{ fontSize: '20px' }}></i>
            <strong style={{ fontSize: '15px' }}>Your Support Tickets</strong>
          </div>
          <p style={{ margin: '0', fontSize: '12px' }}>
            Track the status of tickets you have raised with Customer Care.
          </p>
        </div>
      </div>

      <div className="sw-layout-main" style={{ flex: 1, background: 'var(--sw-bg)', padding: '24px', overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading your tickets...</div>
        ) : tickets.length === 0 ? (
          <div className="sw-empty-state" style={{ textAlign: 'center', marginTop: '100px' }}>
            <i className="fas fa-box-open" style={{ fontSize: '48px', color: 'var(--sw-text-light)', marginBottom: '16px' }}></i>
            <h3 style={{ fontSize: '16px', color: 'var(--sw-text-dark)' }}>You haven't raised any support tickets.</h3>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '800px', margin: '0 auto' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>My Support Tickets</h2>
            {tickets.map(ticket => (
              <div key={ticket._id} style={{ background: 'white', padding: '20px', borderRadius: '8px', border: '1px solid var(--sw-border)', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <div>
                    <span style={{ fontWeight: 'bold', fontSize: '16px', color: 'var(--sw-text-dark)' }}>{ticket.issueType || 'General Issue'}</span>
                    <span style={{ color: 'var(--sw-text-light)', marginLeft: '12px', fontSize: '13px' }}>ID: {ticket._id.slice(-8).toUpperCase()}</span>
                  </div>
                  <span style={{ 
                    padding: '4px 10px', 
                    borderRadius: '4px', 
                    fontSize: '12px', 
                    fontWeight: 'bold',
                    background: ticket.status === 'resolved' ? '#e8f5e9' : ticket.status === 'pending' ? '#fff3e0' : '#ffebee',
                    color: ticket.status === 'resolved' ? '#2e7d32' : ticket.status === 'pending' ? '#ef6c00' : '#c62828'
                  }}>
                    {ticket.status.toUpperCase()}
                  </span>
                </div>
                <div style={{ marginBottom: '16px', color: 'var(--sw-text-dark)', fontSize: '14px', lineHeight: '1.5' }}>
                  {ticket.message}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--sw-border)', paddingTop: '16px' }}>
                  <div style={{ fontSize: '12px', color: 'var(--sw-text-light)' }}>
                    Created on {new Date(ticket.createdAt).toLocaleString()}
                  </div>
                  {ticket.status === 'resolved' && ticket.resolvedAt && (
                    <div style={{ fontSize: '12px', color: 'var(--sw-green)' }}>
                      Resolved on {new Date(ticket.resolvedAt).toLocaleString()}
                    </div>
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

export default VendorTickets;
