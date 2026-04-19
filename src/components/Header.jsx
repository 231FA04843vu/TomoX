// File: src/components/Header.jsx
import React, { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import SearchBar from "./SearchBar";
import tomoxLogo from "../assets/tomologo.png";

const VITE_VENDOR_URL = import.meta.env.VITE_VENDOR_URL || "http://localhost:5174";

const Header = memo(function Header({ user, onLogout, searchQuery, onSearchChange }) {
  const avatarPreset = user?.avatarPreset || null;
  const avatarUrl = user?.avatarUrl || null;
  const fallbackInitial = user?.name?.slice(0, 1)?.toUpperCase() || "U";

  const handleCorporateClick = useCallback((event) => {
    event.preventDefault();
    window.location.href = VITE_VENDOR_URL;
  }, []);

  return (
    <header className="site-header">
      <div className="header-left">
        <Link to="/" className="logo">
          <img src={tomoxLogo} alt="TomoX" className="logo-image" />
        </Link>
      </div>

      <div className="header-search-wrapper">
        <SearchBar value={searchQuery} onChange={onSearchChange} />
      </div>

      <nav className="nav-links">
        <a href="#" onClick={handleCorporateClick}>
          <i className="fas fa-building"></i> TomoX Corporate
        </a>
        <Link to="/offers" className="offer-link-wrapper">
          <span className="offer-badge">NEW</span>
          <i className="fas fa-bolt"></i> Offers
        </Link>
        <Link to="/help">
          <i className="fas fa-question-circle"></i> Help
        </Link>
        {!user ? (
          <Link to="/sign-in">
            <i className="fas fa-sign-in-alt"></i> Sign In
          </Link>
        ) : (
          <>
            <button onClick={onLogout} className="logout-btn">
              <i className="fas fa-sign-out-alt"></i> Logout
            </button>
          </>
        )}
        <Link
          to="/cart"
          className={`bg-green-500 text-white px-4 py-2 rounded${!user ? " disabled-link" : ""}`}
          style={!user ? { pointerEvents: "none", opacity: 0.5 } : {}}
        >
          🛒 Cart
        </Link>
      </nav>

      <div className="profile-icon">
        <Link
          to={user ? "/account" : "/sign-in"}
          className="account-trigger"
          aria-label={user ? "Account" : "Sign in"}
        >
          <span className="account-icon">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={user?.name || "User"}
                className="account-avatar-image"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            ) : avatarPreset ? (
              <span
                className={`account-avatar-preset avatar-preset avatar-preset--${avatarPreset}`}
                aria-hidden="true"
              />
            ) : (
              <span className="account-avatar-initial">{fallbackInitial}</span>
            )}
          </span>
          <span className={`account-dot ${user ? "online" : "offline"}`}>
            <span className="sr-only">
              {user ? "Signed in" : "Not signed in"}
            </span>
          </span>
        </Link>
      </div>
    </header>
  );
});

export default Header;
