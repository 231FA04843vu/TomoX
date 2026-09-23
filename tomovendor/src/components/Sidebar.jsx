import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

function Sidebar() {
  const location = useLocation();
  
  const navItems = [
    { 
      id: 'orders', 
      label: 'ORDERS', 
      icon: 'fas fa-check-circle', 
      path: '/orders',
      dropdown: [
        { label: 'Manage Orders', path: '/orders' },
        { label: 'Past Orders', path: '/orders?tab=past' }
      ]
    },
    { id: 'growth', label: 'GROWTH', icon: 'fas fa-rupee-sign', path: '/growth' },
    { id: 'menu', label: 'MENU', icon: 'fas fa-utensils', path: '/menu' },
    { id: 'complaints', label: 'COMPLAINTS', icon: 'fas fa-exclamation-circle', path: '/complaints' },
    { 
      id: 'ratings', 
      label: 'RATINGS', 
      icon: 'fas fa-star', 
      path: '/ratings'
    },
    { 
      id: 'reports', 
      label: 'REPORTS', 
      icon: 'fas fa-chart-bar', 
      path: '/reports',
      dropdown: [
        { label: 'Overview', path: '/reports' },
        { label: 'Discount Performance Metrics', path: '/reports/discounts' },
        { label: 'Ads Performance', path: '/reports/ads' },
        { label: 'Food Brandverse', path: '/reports/brandverse' }
      ]
    },
    { id: 'finance', label: 'FINANCE', icon: 'fas fa-wallet', path: '/finance' },
    { id: 'help', label: 'HELP', icon: 'fas fa-question-circle', path: '/help' },
    { id: 'manage-outlets', label: 'MANAGE OUTLETS & STAFF', icon: 'fas fa-store', path: '/manage-outlets' },
  ];

  return (
    <aside className="sw-sidebar">
      <div className="sw-logo">S</div>
      
      <nav className="sw-nav">
        {navItems.map((item) => (
          <div key={item.id} className={`sw-nav-item ${location.pathname.startsWith(item.path) ? 'active' : ''}`}>
            <NavLink 
              to={item.path} 
              style={{ color: 'inherit', textDecoration: 'none', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
            >
              <i className={item.icon}></i>
              {item.label}
            </NavLink>
            
            {/* Render Dropdown if it exists */}
            {item.dropdown && (
              <div className="dropdown">
                {item.dropdown.map((sub, idx) => (
                  <NavLink key={idx} to={sub.path}>{sub.label}</NavLink>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>
    </aside>
  );
}

export default Sidebar;
