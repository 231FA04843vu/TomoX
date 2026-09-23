import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const MobileBottomNav = () => {
  const location = useLocation();

  // Hide bottom nav on specific paths where it doesn't make sense (like checkout, or tracking maybe?)
  // For now, let's show it mostly everywhere as per typical mobile app, except maybe checkout/cart
  const hideOnPaths = ['/checkout', '/cart'];
  
  if (hideOnPaths.includes(location.pathname)) {
    return null;
  }

  return (
    <nav className="mobile-bottom-nav">
      <NavLink to="/" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`} end>
        <i className="fas fa-home"></i>
        <span>Home</span>
      </NavLink>
      
      <NavLink to="/search" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <i className="fas fa-search"></i>
        <span>Search</span>
      </NavLink>
      
      <NavLink to="/orders" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <i className="fas fa-clipboard-list"></i>
        <span>Orders</span>
      </NavLink>
      
      <NavLink to="/account" className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}>
        <i className="far fa-user"></i>
        <span>Profile</span>
      </NavLink>
    </nav>
  );
};

export default MobileBottomNav;
