import React from 'react';
import '../styles/dashboard.css';

function Finance() {
  const vendorInfo = JSON.parse(localStorage.getItem('vendorInfo') || '{}');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      <div style={{ padding: '0 24px', background: 'var(--sw-sidebar-bg)', color: 'white' }}>
        <p style={{ margin: '16px 0', fontSize: '12px' }}>
          You are viewing the details of <strong>{vendorInfo?.name || 'Your Restaurant'}</strong>
        </p>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ fontWeight: 'bold', borderBottom: '2px solid var(--sw-orange)', paddingBottom: '12px', fontSize: '13px' }}>PAYOUT OVERVIEW</div>
        </div>
      </div>

      <div style={{ padding: '24px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="sw-empty-state" style={{ textAlign: 'center' }}>
          <i className="fas fa-wallet" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
          <h3>No Payout Data Available</h3>
          <p style={{ color: 'var(--sw-text-light)' }}>
            Payout records and summaries will appear here once transactions are processed.
          </p>
        </div>
      </div>
    </div>
  );
}

export default Finance;
