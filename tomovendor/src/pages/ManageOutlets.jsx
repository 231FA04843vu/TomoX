import React from 'react';
import '../styles/dashboard.css';

function ManageOutlets() {
  const vendorInfo = JSON.parse(localStorage.getItem('vendorInfo') || '{}');

  return (
    <div className="sw-layout-split">
      {/* Left Sidebar Info */}
      <div className="sw-layout-sidebar" style={{ width: '350px', padding: '24px', background: 'white' }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ fontSize: '12px', color: 'var(--sw-text-light)', fontWeight: 'bold', marginBottom: '4px' }}>Owner</div>
          <div style={{ fontSize: '16px', fontWeight: 'bold', textTransform: 'uppercase' }}>{vendorInfo?.ownerName || vendorInfo?.name || 'Owner Name'}</div>
          <div style={{ color: 'var(--sw-green)', fontSize: '12px', fontWeight: 'bold', margin: '4px 0 16px 0' }}><i className="fas fa-check-circle"></i> VERIFIED ⓘ</div>
          
          <div style={{ fontSize: '12px', color: 'var(--sw-text-light)' }}>
            {vendorInfo?.phone || '+91 0000000000'}<br/>
            {vendorInfo?.email || 'email@example.com'}
          </div>
        </div>

        <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Manage</h3>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px', cursor: 'pointer' }}>
          <div style={{ background: '#fcebe3', color: 'var(--sw-orange)', padding: '12px', borderRadius: '8px', fontSize: '20px' }}>
            <i className="fas fa-id-badge"></i>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>Staff</div>
            <div style={{ fontSize: '12px', color: 'var(--sw-text-light)' }}>View users and their roles and responsibilities</div>
          </div>
          <div style={{ color: 'var(--sw-text-light)' }}>›</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer' }}>
          <div style={{ background: '#fcebe3', color: 'var(--sw-orange)', padding: '12px', borderRadius: '8px', fontSize: '20px' }}>
            <i className="fas fa-store-alt"></i>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 'bold' }}>Outlets</div>
            <div style={{ fontSize: '12px', color: 'var(--sw-text-light)' }}>Update outlet level information like address, phone number, invoicing email & more</div>
          </div>
          <div style={{ color: 'var(--sw-text-light)' }}>›</div>
        </div>
      </div>

      {/* Right Main Area */}
      <div className="sw-layout-main" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--sw-bg)' }}>
        <h2 style={{ fontSize: '24px', marginBottom: '8px' }}>Now you can easily manage</h2>
        <p style={{ color: 'var(--sw-text-light)', marginBottom: '40px' }}>Contact Information | Outlet Information And More</p>

        <div style={{ maxWidth: '500px', width: '100%' }}>
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <div style={{ background: '#ffefe5', color: 'var(--sw-orange)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              <i className="fas fa-phone-alt"></i>
            </div>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Update your outlet's phone number to ensure that customers can reach you regarding their orders.</p>
              <span style={{ background: '#e9e9eb', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Outlets &gt; Outlet Information</span>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '24px', marginBottom: '32px' }}>
            <div style={{ background: '#ffefe5', color: 'var(--sw-orange)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              <i className="fas fa-headset"></i>
            </div>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Manage communications in different categories like operational issues to send calls and emails to the relevant user.</p>
              <span style={{ background: '#e9e9eb', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Staff &gt; Communication Permissions</span>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px' }}>
            <div style={{ background: '#ffefe5', color: 'var(--sw-orange)', width: '48px', height: '48px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', flexShrink: 0 }}>
              <i className="fas fa-mobile-alt"></i>
            </div>
            <div>
              <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>Manage Swiggy app access of your staff for menu, discounting/ads, business metrics & more.</p>
              <span style={{ background: '#e9e9eb', padding: '2px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>Staff &gt; App Permissions</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ManageOutlets;
