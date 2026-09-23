import React from 'react';
import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { FaClock, FaCheckCircle, FaUser, FaStore, FaEnvelope, FaPhone } from 'react-icons/fa';
import '../styles/dashboard.css';

function ApplicationStatus() {
  const location = useLocation();
  const navigate = useNavigate();
  const vendor = location.state?.vendor;

  if (!vendor) {
    return <Navigate to="/login" replace />;
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'Approved':
        return <span style={{ background: '#e6f4ea', color: '#1e8e3e', padding: '6px 12px', borderRadius: '16px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FaCheckCircle /> Approved</span>;
      case 'Rejected':
        return <span style={{ background: '#fce8e6', color: '#d93025', padding: '6px 12px', borderRadius: '16px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>Rejected</span>;
      default:
        return <span style={{ background: '#fff3cd', color: '#856404', padding: '6px 12px', borderRadius: '16px', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '6px' }}><FaClock /> Under Review</span>;
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--sw-bg)' }}>
      {/* Header */}
      <header style={{ background: 'white', padding: '16px 24px', borderBottom: '1px solid var(--sw-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '24px', fontWeight: '900', color: 'var(--sw-orange)', letterSpacing: '-1px' }}>TomoX Vendor</div>
        <button 
          onClick={() => navigate('/login')}
          style={{ background: 'none', border: '1px solid var(--sw-border)', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', color: 'var(--sw-text-dark)' }}
        >
          Back to Login
        </button>
      </header>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px' }}>
        <div style={{ background: 'white', maxWidth: '600px', width: '100%', borderRadius: '12px', padding: '40px', boxShadow: '0 4px 20px rgba(0,0,0,0.05)', textAlign: 'center' }}>
          
          <div style={{ width: '80px', height: '80px', background: '#fff3cd', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px auto' }}>
            <FaClock size={36} color="#f6a821" />
          </div>

          <h1 style={{ margin: '0 0 16px 0', color: 'var(--sw-text-dark)' }}>Application Submitted!</h1>
          <p style={{ color: 'var(--sw-text-light)', lineHeight: '1.6', marginBottom: '32px' }}>
            Thank you for registering with TomoX! Your application is currently <strong>Under Review</strong> by our admin team. This usually takes 1-2 business days. We will notify you via email once your account is approved.
          </p>

          <div style={{ background: '#f9f9fa', borderRadius: '8px', padding: '24px', textAlign: 'left', border: '1px solid var(--sw-border)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--sw-border)', paddingBottom: '16px' }}>
              <span style={{ fontWeight: 'bold', color: 'var(--sw-text-dark)' }}>Application Status</span>
              {getStatusBadge(vendor.status)}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaStore /> Restaurant Name</div>
                <div style={{ fontWeight: '600', color: 'var(--sw-text-dark)' }}>{vendor.restaurantName}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaUser /> Owner Name</div>
                <div style={{ fontWeight: '600', color: 'var(--sw-text-dark)' }}>{vendor.ownerFullName}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaPhone /> Phone</div>
                <div style={{ fontWeight: '600', color: 'var(--sw-text-dark)' }}>{vendor.phone}</div>
              </div>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}><FaEnvelope /> Email</div>
                <div style={{ fontWeight: '600', color: 'var(--sw-text-dark)' }}>{vendor.email}</div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: '32px', color: 'var(--sw-text-light)', fontSize: '13px' }}>
            Have questions? Contact our partner support at <a href="mailto:partners@tomox.com" style={{ color: 'var(--sw-orange)', textDecoration: 'none', fontWeight: 'bold' }}>partners@tomox.com</a>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ApplicationStatus;
