import React from 'react';

const AuthLayout = ({ children }) => {
  return (
    <div className="auth-page-wrapper">
      <div className="auth-hero-section">
        <div className="auth-hero-content">
          <div className="auth-hero-left">
            <div className="auth-logo-text">
              <span><i className="fas fa-location-dot auth-logo-icon"></i></span>
              <span>PARTNER WITH TOMOX!</span>
              <div className="auth-logo-underline"></div>
            </div>
            <h1 className="auth-hero-title">
              Access to TomoX tools <span className="auth-hero-title-underline">and</span> support
            </h1>
          </div>
          <div className="auth-hero-right">
            {children}
          </div>
        </div>
      </div>

      <div className="auth-toggle-bar">
        <div className="auth-toggle-inner">
          <button className="auth-toggle-btn active">Food Delivery</button>
          <button className="auth-toggle-btn">Dineout</button>
        </div>
      </div>

      <div className="auth-bottom-section">
        <div className="auth-steps-col">
          <div className="auth-steps-header">
            <p className="auth-steps-overline">In just 3 easy steps</p>
            <h2 className="auth-steps-title"><span>Get</span> your restaurant delivery-ready in 24hrs!</h2>
          </div>
          <div className="auth-steps-box">
            <div className="auth-step-item">
              <div className="auth-step-dot"></div>
              <div className="auth-step-content">
                <span className="auth-step-num">Step 1</span>
                <span className="auth-step-text">Install the TomoX Vendor App</span>
              </div>
            </div>
            <div className="auth-step-item">
              <div className="auth-step-dot"></div>
              <div className="auth-step-content">
                <span className="auth-step-num">Step 2</span>
                <span className="auth-step-text">Login/Register using your phone number</span>
              </div>
            </div>
            <div className="auth-step-item">
              <div className="auth-step-dot"></div>
              <div className="auth-step-content">
                <span className="auth-step-num">Step 3</span>
                <span className="auth-step-text">Enter restaurant details</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="auth-docs-col">
          <div className="auth-docs-header">
            For an easy form filling process,<br />
            you can keep these documents handy.
          </div>
          <ul className="auth-doc-list">
            <li className="auth-doc-item">
              <div className="auth-doc-dot"></div>
              FSSAI License copy <a href="#" className="auth-doc-link">Apply Here</a>
            </li>
            <li className="auth-doc-item">
              <div className="auth-doc-dot"></div>
              Your Restaurant menu
            </li>
            <li className="auth-doc-item">
              <div className="auth-doc-dot"></div>
              Bank details
            </li>
            <li className="auth-doc-item">
              <div className="auth-doc-dot"></div>
              GSTIN <a href="#" className="auth-doc-link">Apply Here</a>
            </li>
            <li className="auth-doc-item">
              <div className="auth-doc-dot"></div>
              PAN card copy
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
