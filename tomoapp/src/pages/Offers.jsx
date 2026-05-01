import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/offers.css";

const API_COMPANY = import.meta.env.VITE_API_COMPANY;

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const Offers = () => {
  const navigate = useNavigate();
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [expandedCoupon, setExpandedCoupon] = useState(null);
  const [copiedCode, setCopiedCode] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
    fetch(`${API_COMPANY}/api/coupons/active`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((res) => res.json())
      .then((data) => {
        setCoupons(data.coupons || []);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch coupons:", err);
        setIsLoading(false);
      });
  }, []);

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTimeRemaining = (expiryDate) => {
    const now = currentTime;
    const expiry = new Date(expiryDate);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) {
      return { expired: true, text: 'Expired', urgent: false };
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffHours < 1) {
      return {
        expired: false,
        text: `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} left`,
        urgent: true,
        veryUrgent: true
      };
    }
    
    if (diffDays < 1) {
      const remainingMinutes = diffMinutes % 60;
      return {
        expired: false,
        text: `${diffHours}h ${remainingMinutes}m left`,
        urgent: true,
        veryUrgent: diffHours < 6
      };
    }
    
    if (diffDays < 7) {
      const remainingHours = diffHours % 24;
      return {
        expired: false,
        text: `${diffDays} day${diffDays !== 1 ? 's' : ''} ${remainingHours}h left`,
        urgent: diffDays <= 3
      };
    }
    
    return {
      expired: false,
      text: `${diffDays} days left`,
      urgent: false
    };
  };

  const getCouponBadge = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    }
    return `₹${coupon.discountValue} OFF`;
  };

  const handleCopyCode = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleUseNow = () => {
    navigate('/');
  };

  if (isLoading) {
    return (
      <div className="offers-page">
        <div className="offers-container">
          <div className="offers-header">
            <h1>Available Offers</h1>
          </div>
          <div className="offers-loading">
            <div className="loading-spinner"></div>
            <p>Loading offers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="offers-page">
      <div className="offers-container">
        <div className="offers-header">
          <div className="header-content">
            <h1>
              <i className="fas fa-bolt"></i>
              Available Offers
            </h1>
            <p className="header-subtitle">
              Save big on your orders! Apply these coupons at checkout.
            </p>
          </div>
          <div className="offers-stats">
            <div className="stat-item">
              <span className="stat-number">{coupons.length}</span>
              <span className="stat-label">Active Offers</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">{coupons.filter(c => getTimeRemaining(c.validUntil).urgent).length}</span>
              <span className="stat-label">Expiring Soon</span>
            </div>
          </div>
        </div>

        {coupons.length === 0 ? (
          <div className="offers-empty">
            <i className="fas fa-gift"></i>
            <h2>No offers available right now</h2>
            <p>Check back later for exciting deals!</p>
          </div>
        ) : (
          <div className="offers-grid">
            {coupons.map((coupon) => {
              const timeInfo = getTimeRemaining(coupon.validUntil);
              const isExpanded = expandedCoupon === coupon.code;
              
              return (
                <div 
                  key={coupon.code} 
                  className={`offer-coupon-card ${timeInfo.urgent ? 'urgent' : ''} ${timeInfo.veryUrgent ? 'very-urgent' : ''} ${timeInfo.expired ? 'expired' : ''}`}
                >
                  {timeInfo.veryUrgent && !timeInfo.expired && (
                    <div className="urgency-banner">⚡ ENDING SOON!</div>
                  )}
                  
                  <div className="coupon-main">
                    <div className="coupon-left">
                      <div className="coupon-info">
                        <div className="coupon-badge-large">
                          {getCouponBadge(coupon)}
                        </div>
                        <p className="coupon-description">{coupon.description}</p>
                      </div>
                    </div>
                    
                    <div className="coupon-right">
                      <div className="coupon-code-display">
                        <span className="code-label">Code</span>
                        <div className="code-box">
                          <span className="code-text">{coupon.code}</span>
                          <button 
                            className="copy-btn"
                            onClick={() => handleCopyCode(coupon.code)}
                            title="Copy code"
                          >
                            {copiedCode === coupon.code ? (
                              <i className="fas fa-check"></i>
                            ) : (
                              <i className="fas fa-copy"></i>
                            )}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="coupon-meta-row">
                    <div className="meta-item">
                      <i className="fas fa-shopping-bag"></i>
                      <span>Min. order: {formatMoney(coupon.minOrderAmount)}</span>
                    </div>
                    <div className={`meta-item time-remaining ${timeInfo.urgent ? 'urgent' : ''}`}>
                      <i className="fas fa-clock"></i>
                      <span>{timeInfo.text}</span>
                    </div>
                    {coupon.usageLimit && (
                      <div className="meta-item">
                        <i className="fas fa-users"></i>
                        <span>{coupon.usageLimit - coupon.usedCount} uses left</span>
                      </div>
                    )}
                  </div>

                  <div className="coupon-actions">
                    <button
                      className="view-details-btn"
                      onClick={() => setExpandedCoupon(isExpanded ? null : coupon.code)}
                    >
                      {isExpanded ? 'Hide Details' : 'View Details'}
                      <i className={`fas fa-chevron-${isExpanded ? 'up' : 'down'}`}></i>
                    </button>
                    <button
                      className="use-now-btn"
                      onClick={handleUseNow}
                      disabled={timeInfo.expired}
                    >
                      {timeInfo.expired ? 'Expired' : 'Use Now'}
                      <i className="fas fa-arrow-right"></i>
                    </button>
                  </div>

                  {isExpanded && (
                    <div className="coupon-details-expanded">
                      <h4>Terms & Conditions:</h4>
                      <ul>
                        <li>Valid until: <strong>{formatDate(coupon.validUntil)}</strong></li>
                        <li>Minimum order value: {formatMoney(coupon.minOrderAmount)}</li>
                        {coupon.maxDiscountAmount && (
                          <li>Maximum discount: {formatMoney(coupon.maxDiscountAmount)}</li>
                        )}
                        {coupon.usageLimit && (
                          <li>Limited to {coupon.usageLimit} total uses ({coupon.usageLimit - coupon.usedCount} remaining)</li>
                        )}
                        <li>Applicable on food orders only</li>
                        <li>Cannot be combined with other offers</li>
                        <li>One coupon per order</li>
                        <li>TomoX reserves the right to modify or cancel this offer</li>
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        <div className="offers-footer">
          <p>
            <i className="fas fa-info-circle"></i>
            New offers are added regularly. Check back often for the best deals!
          </p>
        </div>
      </div>
    </div>
  );
};

export default Offers;
