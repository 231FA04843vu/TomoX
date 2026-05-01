import React from 'react';
import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';

const PAGE_META = {
  '/dashboard': { title: 'Vendor Command Center', subtitle: 'Live business pulse, insights, and action shortcuts.' },
  '/orders': { title: 'Order Operations', subtitle: 'Process active orders quickly with clear status control.' },
  '/menu': { title: 'Menu Studio', subtitle: 'Design, optimize, and manage your dishes for conversions.' },
  '/analytics': { title: 'Growth Analytics', subtitle: 'Track revenue behavior and identify performance patterns.' },
  '/restaurant-setup': { title: 'Restaurant Identity', subtitle: 'Control your brand, cuisines, and storefront profile.' },
  '/profile': { title: 'Account & Team Profile', subtitle: 'Manage business account details and owner profile data.' },
};

function PortalLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const vendor = JSON.parse(localStorage.getItem('vendorInfo') || '{}');

  const meta = PAGE_META[location.pathname] || {
    title: 'Vendor Portal',
    subtitle: 'Manage your complete vendor operations from one place.',
  };

  const handleLogout = () => {
    localStorage.removeItem('vendorToken');
    localStorage.removeItem('vendorInfo');
    navigate('/login');
  };

  return (
    <div className="vx-shell">
      <Sidebar />
      <main className="vx-main">
        <header className="vx-topbar">
          <div>
            <p className="vx-overline">TomoX Vendor Platform</p>
            <h1 className="vx-title">{meta.title}</h1>
            <p className="vx-subtitle">{meta.subtitle}</p>
          </div>

          <div className="vx-topbar-actions">
            <Link to="/orders" className="vx-topbar-btn vx-topbar-btn--ghost">
              <i className="fas fa-bell"></i>
              Orders
            </Link>
            <Link to="/menu" className="vx-topbar-btn vx-topbar-btn--primary">
              <i className="fas fa-plus"></i>
              Add Item
            </Link>

            <div className="vx-vendor-pill">
              <div className="vx-vendor-avatar">{(vendor?.name || 'V').charAt(0).toUpperCase()}</div>
              <div>
                <p>{vendor?.name || 'Vendor'}</p>
                <span>Active Workspace</span>
              </div>
            </div>

            <button className="vx-logout" onClick={handleLogout}>
              <i className="fas fa-sign-out-alt"></i>
            </button>
          </div>
        </header>

        <section className="vx-page-body">
          <Outlet />
        </section>
      </main>
    </div>
  );
}

export default PortalLayout;
