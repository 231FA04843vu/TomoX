import React, { useState } from 'react';
import '../styles/dashboard.css';

function Reports() {
  const [activeTab, setActiveTab] = useState('Sales');

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Navbar for Reports */}
      <div style={{ padding: '24px 24px 0 24px', background: 'white', borderBottom: '1px solid var(--sw-border)' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '20px' }}>Business Reports</h2>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ fontWeight: 'bold', borderBottom: '2px solid var(--sw-orange)', paddingBottom: '12px' }}>Your Performance</div>
        </div>
      </div>
      
      <div style={{ flex: 1, padding: '24px', overflow: 'hidden', display: 'flex', gap: '24px' }}>
        
        {/* Left Sidebar Tabs */}
        <div style={{ width: '150px', background: 'white', borderRadius: '8px', padding: '16px 0', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
          {['Sales', 'Bolt', 'Ratings', 'Complaints', 'Funnel', 'Customers', 'Ads', 'Discounts', 'Operations', 'Menu'].map(tab => (
            <div 
              key={tab}
              style={{ 
                padding: '12px 24px', 
                fontSize: '14px',
                cursor: 'pointer',
                fontWeight: activeTab === tab ? 'bold' : 'normal',
                color: activeTab === tab ? 'var(--sw-text-dark)' : 'var(--sw-text-light)',
                borderLeft: activeTab === tab ? '3px solid var(--sw-orange)' : '3px solid transparent'
              }}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </div>
          ))}
        </div>

        {/* Main Content Area */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div className="sw-empty-state" style={{ textAlign: 'center' }}>
            <i className="fas fa-chart-bar" style={{ fontSize: '48px', color: '#ccc', marginBottom: '16px' }}></i>
            <h3>No Report Data</h3>
            <p style={{ color: 'var(--sw-text-light)' }}>
              Data for {activeTab} will appear here once sufficient metrics are gathered.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Reports;
