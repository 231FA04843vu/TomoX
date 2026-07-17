import React, { memo, useCallback, useState } from "react";
import { Link } from "react-router-dom";
import tomoxLogo from "../assets/tomologo.png";
import { useLocationContext } from "../context/LocationContext";
import LocationDrawer from "./LocationDrawer";

const VITE_VENDOR_URL = import.meta.env.VITE_VENDOR_URL || "https://tvendor.netlify.app";

const Header = memo(function Header({ user, onLogout }) {
  const { location } = useLocationContext();
  const [isLocationDrawerOpen, setIsLocationDrawerOpen] = useState(false);

  const handleCorporateClick = useCallback((event) => {
    event.preventDefault();
    window.location.href = VITE_VENDOR_URL;
  }, []);

  // Format user name for header display (e.g. "Alla Vam...")
  const truncateName = (name) => {
    if (!name) return "User";
    return name.length > 10 ? name.substring(0, 10) + "..." : name;
  };

  return (
    <header className="site-header swiggy-header">
      <div className="header-content-swiggy">
        {/* Logo + Location */}
        <div className="header-left">
          <Link to="/" className="logo">
            <img src={tomoxLogo} alt="TomoX" className="logo-image" style={{ width: '40px', height: '60px', objectFit: 'contain' }} />
          </Link>
          <div className="header-location" onClick={() => setIsLocationDrawerOpen(true)}>
            <span className="header-location-type">HOME</span>
            <span className="header-location-city">
              {location.address || "Select Location"}
            </span>
            <i className="fas fa-chevron-down location-caret" />
          </div>
        </div>

        {/* Nav Links */}
        <nav className="nav-links swiggy-nav-links">
          <a href="#" onClick={handleCorporateClick} className="nav-link">
            <i className="fas fa-briefcase" /> TomoX Corporate
          </a>
          
          {/* Replaced SearchBar with a link */}
          <Link to="/search" className="nav-link">
            <i className="fas fa-search" /> Search
          </Link>
          
          <Link to="/offers" className="nav-link offer-link-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
              <path d="M12 2L14.7 4.2L18.2 4L19.4 7.3L22 9.3L20.8 12.6L22 15.9L19.4 17.9L18.2 21.2L14.7 21L12 23.2L9.3 21L5.8 21.2L4.6 17.9L2 15.9L3.2 12.6L2 9.3L4.6 7.3L5.8 4L9.3 4.2L12 2Z"></path>
              <line x1="9" y1="15" x2="15" y2="9"></line>
              <circle cx="9" cy="9" r="1.5" fill="currentColor"></circle>
              <circle cx="15" cy="15" r="1.5" fill="currentColor"></circle>
            </svg> 
            Offers <span className="offer-badge-swiggy">NEW</span>
          </Link>
          
          <Link to="/help" className="nav-link">
            <i className="far fa-life-ring" /> Help
          </Link>

          {!user ? (
            <button className="nav-link auth-trigger-btn" onClick={() => window.dispatchEvent(new CustomEvent("tomo:open-auth"))}>
              <i className="far fa-user" /> Sign In
            </button>
          ) : (
            <div className="nav-link user-dropdown-wrapper">
              <Link to="/account" className="user-dropdown-trigger">
                <i className="far fa-user" /> {truncateName(user?.name)}
              </Link>
              
              <div className="user-dropdown-menu">
                <Link to="/account" className="dropdown-item">Profile</Link>
                <Link to="/account?tab=orders" className="dropdown-item">Orders</Link>
                <Link to="/account?tab=favourites" className="dropdown-item">Favourites</Link>
                <button onClick={onLogout} className="dropdown-item">Logout</button>
              </div>
            </div>
          )}

          <Link
            to={user ? "/cart" : "#"}
            className="nav-link header-cart-link"
            onClick={(e) => {
              if (!user) {
                e.preventDefault();
                window.dispatchEvent(new CustomEvent("tomo:open-auth"));
              }
            }}
          >
            <i className="fas fa-shopping-bag" /> Cart
          </Link>
        </nav>
      </div>

      <LocationDrawer 
        isOpen={isLocationDrawerOpen} 
        onClose={() => setIsLocationDrawerOpen(false)} 
      />
    </header>
  );
});

export default Header;
