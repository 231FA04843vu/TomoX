import React, { memo } from "react";
import { Link } from "react-router-dom";

const Footer = memo(function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <p>&copy; 2025 TomoX. All rights reserved.</p>
        <div className="social-icons">
          <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-facebook-f"></i>
          </a>
          <a href="https://twitter.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-twitter"></i>
          </a>
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-instagram"></i>
          </a>
          <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">
            <i className="fab fa-linkedin-in"></i>
          </a>
        </div>
      </div>
      <div className="footer-edge-links">
        <Link to="/terms">Terms</Link>
        <Link to="/privacy">Privacy</Link>
      </div>
    </footer>
  );
});

export default Footer;
