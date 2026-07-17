import React, { memo } from "react";
import { Link } from "react-router-dom";
import tomoxLogo from "../assets/tomologo.png";

const Footer = memo(function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        {/* Top: Brand + Links Grid */}
        <div className="footer-top">
          {/* Brand column */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img src={tomoxLogo} alt="TomoX" />
              <span className="footer-logo-name">TomoX</span>
            </div>
            <p className="footer-tagline">
              Order food from your favourite restaurants and get it delivered
              fast to your doorstep.
            </p>
            {/* Social icons */}
            <div className="footer-social">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
              >
                <i className="fab fa-facebook-f" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Twitter"
              >
                <i className="fab fa-twitter" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
              >
                <i className="fab fa-instagram" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
              >
                <i className="fab fa-linkedin-in" />
              </a>
            </div>
          </div>

          {/* Company column */}
          <div className="footer-col">
            <h4>Company</h4>
            <ul>
              <li><Link to="/">Home</Link></li>
              <li><Link to="/offers">Offers</Link></li>
              <li><Link to="/orders">My Orders</Link></li>
              <li><Link to="/account">My Account</Link></li>
            </ul>
          </div>

          {/* Support column */}
          <div className="footer-col">
            <h4>Support</h4>
            <ul>
              <li><Link to="/help">Help Centre</Link></li>
              <li><Link to="/support">Contact Us</Link></li>
              <li>
                <a href="mailto:support@tomox.in">support@tomox.in</a>
              </li>
            </ul>
          </div>

          {/* Legal column */}
          <div className="footer-col">
            <h4>Legal</h4>
            <ul>
              <li><Link to="/terms">Terms of Service</Link></li>
              <li><Link to="/privacy">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p className="footer-copy">
          &copy; {new Date().getFullYear()} TomoX. All rights reserved.
        </p>
        <div className="footer-links-row">
          <Link to="/terms">Terms</Link>
          <Link to="/privacy">Privacy</Link>
          <Link to="/help">Help</Link>
        </div>
      </div>
    </footer>
  );
});

export default Footer;
