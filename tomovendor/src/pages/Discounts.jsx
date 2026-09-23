import React, { useState } from 'react';
import '../styles/dashboard.css';

function Discounts() {
  const [activeTab, setActiveTab] = useState('Track discounts');

  const renderTrackDiscounts = () => (
    <div style={{ padding: '24px', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="sw-empty-state" style={{ textAlign: 'center' }}>
        <i className="fas fa-tags" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
        <h3>No Active Discounts</h3>
        <p style={{ color: 'var(--sw-text-light)' }}>
          You don't have any active or past discounts.
        </p>
      </div>
    </div>
  );

  const renderQuickSetup = () => (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ marginTop: 0 }}>Select offers</h2>
      <p style={{ color: 'var(--sw-text-light)' }}>Discount setups are currently unavailable.</p>
    </div>
  );

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'flex', padding: '0 24px', background: 'white', borderBottom: '1px solid var(--sw-border)' }}>
        {['Quick Discount Setup', 'Track discounts'].map(tab => (
          <div 
            key={tab} 
            className={`sw-tab ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </div>
        ))}
      </div>
      
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'Track discounts' ? renderTrackDiscounts() : renderQuickSetup()}
      </div>
    </div>
  );
}

export default Discounts;
