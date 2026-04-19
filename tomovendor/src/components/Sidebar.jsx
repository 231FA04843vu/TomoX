import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Sidebar = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: 'fa-home', label: 'Dashboard' },
    { path: '/orders', icon: 'fa-bag-shopping', label: 'Orders' },
    { path: '/analytics', icon: 'fa-chart-line', label: 'Analytics' },
  ];

  const operationItems = [
    { path: '/menu', icon: 'fa-list', label: 'Menu Studio' },
    { path: '/restaurant-setup', icon: 'fa-store', label: 'Restaurant Setup' },
    { path: '/profile', icon: 'fa-user-gear', label: 'Profile' },
  ];

  return (
    <aside className="vx-sidebar">
      <Link to="/dashboard" className="vx-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
        <span className="vx-brand-badge">TX</span>
        <span>
          <h2>TomoX Vendor</h2>
          <p>Business Operating System</p>
        </span>
      </Link>

      <div className="vx-nav-group">
        <p className="vx-nav-title">Overview</p>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`vx-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="vx-nav-group">
        <p className="vx-nav-title">Operations</p>
        {operationItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`vx-nav-item ${location.pathname === item.path ? 'active' : ''}`}
          >
            <i className={`fas ${item.icon}`}></i>
            <span>{item.label}</span>
          </Link>
        ))}
      </div>

      <div className="vx-nav-group">
        <p className="vx-nav-title">Status</p>
        <article className="vx-card" style={{ padding: '12px' }}>
          <p style={{ margin: '0 0 8px', color: '#98a5d2', fontSize: '12px' }}>Workspace Health</p>
          <p style={{ margin: 0, fontWeight: 700 }}>All systems normal</p>
          <span style={{ color: '#86efac', fontSize: '12px' }}>
            <i className="fas fa-circle" style={{ fontSize: '8px', marginRight: '6px' }}></i>
            Real-time sync active
          </span>
        </article>
      </div>
    </aside>
  );
};

export default Sidebar;
