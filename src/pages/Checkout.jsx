import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import PageLoader from "../components/PageLoader";
import "../styles/pageLoader.css";

const API_COMPANY = import.meta.env.VITE_API_COMPANY;

const formatMoney = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value || 0);

const buildAddressText = (address) => {
  if (!address) return "";
  const parts = [
    address.label,
    address.line1,
    address.line2,
    address.landmark,
    address.city,
    address.state,
    address.postalCode,
  ].filter(Boolean);
  return parts.join(", ");
};

const Checkout = ({ user }) => {
  const { cart, dispatch } = useCart();
  const navigate = useNavigate();
  const billRef = useRef();
  
  const [addresses, setAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("cod");
  const [status, setStatus] = useState(null);
  const [isPlacing, setIsPlacing] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Billing states
  const [couponCode, setCouponCode] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isValidatingCoupon, setIsValidatingCoupon] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);
  const [distance, setDistance] = useState(3); // Default 3km
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [expandedCoupon, setExpandedCoupon] = useState(null);
  const [showAllCoupons, setShowAllCoupons] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vendorLocation, setVendorLocation] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const paymentOptions = [
    { id: "cod", label: "Cash on Delivery", subtitle: "Pay when your order arrives", enabled: true },
    { id: "upi", label: "UPI", subtitle: "Coming soon", enabled: false },
    { id: "card", label: "Credit / Debit Card", subtitle: "Coming soon", enabled: false },
    { id: "wallet", label: "Wallet", subtitle: "Coming soon", enabled: false },
  ];

  const tipOptions = [10, 20, 50, 100];

  const token = useMemo(() => localStorage.getItem("token"), []);
  const items = cart?.items || [];
  
  // Calculate billing breakdown
  const itemsSubtotal = items.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  
  // Delivery charges: ₹5 per km with minimum ₹20
  const deliveryCharges = Math.max(20, distance * 5);
  
  // Coupon discount
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  
  // Subtotal after coupon
  const subtotalAfterDiscount = itemsSubtotal - couponDiscount;
  
  // GST: 5% on food items (Indian standard)
  const gstRate = 0.05;
  const gst = Math.round((subtotalAfterDiscount + deliveryCharges) * gstRate);
  
  // Grand total
  const grandTotal = subtotalAfterDiscount + deliveryCharges + selectedTip + gst;
  
  const totalItems = items.reduce(
    (acc, item) => acc + Number(item.quantity || 0),
    0
  );
  const vendorIds = useMemo(
    () => new Set(items.map((item) => item.vendorId).filter(Boolean)),
    [items]
  );
  const hasMultipleVendors = vendorIds.size > 1;
  const vendorId = useMemo(() => Array.from(vendorIds)[0], [vendorIds]);

  // Real-time clock update every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  // Fetch vendor location
  useEffect(() => {
    if (!vendorId || !token) return;
    
    fetch(`${API_COMPANY}/api/restaurants/vendor/${vendorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.location) {
          // Restaurant model has location as a string
          setVendorLocation({ line1: data.location, city: '', state: '', postalCode: '' });
        }
      })
      .catch((err) => console.error('Failed to fetch vendor location:', err));
  }, [vendorId, token]);

  // Calculate distance using OpenStreetMap
  const calculateDistance = async (address1, address2) => {
    try {
      setIsCalculatingDistance(true);
      
      // Geocode both addresses using Nominatim API
      const geocode = async (address) => {
        const query = encodeURIComponent(address);
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`,
          {
            headers: {
              'User-Agent': 'TomoX Food Delivery App',
            },
          }
        );
        const data = await response.json();
        if (data && data.length > 0) {
          return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        }
        return null;
      };

      const [coord1, coord2] = await Promise.all([
        geocode(address1),
        geocode(address2),
      ]);

      if (!coord1 || !coord2) {
        console.error('Failed to geocode one or both addresses');
        return null;
      }

      // Calculate distance using Haversine formula
      const R = 6371; // Earth's radius in kilometers
      const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
      const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(coord1.lat * Math.PI / 180) *
        Math.cos(coord2.lat * Math.PI / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distance = R * c;

      return Math.round(distance * 10) / 10; // Round to 1 decimal place
    } catch (error) {
      console.error('Distance calculation error:', error);
      return null;
    } finally {
      setIsCalculatingDistance(false);
    }
  };

  useEffect(() => {
    if (!token) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    
    // Fetch addresses
    fetch(`${API_COMPANY}/api/me/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        setAddresses(data.addresses || []);
      })
      .catch(() => {
        setAddresses([]);
      });
    
    // Fetch available coupons
    fetch(`${API_COMPANY}/api/coupons/active`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setAvailableCoupons(data);
        }
        setIsLoading(false);
      })
      .catch(() => {
        setAvailableCoupons([]);
        setIsLoading(false);
      });
  }, [token]);

  const defaultAddress =
    addresses.find((address) => address.isDefault) || addresses[0];
  const selectedAddress =
    addresses.find((address) => address._id === selectedAddressId) ||
    defaultAddress;
  const addressText = buildAddressText(selectedAddress);

  // Auto-calculate distance when address or vendor changes
  useEffect(() => {
    if (!vendorLocation || !selectedAddress) return;
    
    const vendorAddr = buildAddressText(vendorLocation);
    const deliveryAddr = buildAddressText(selectedAddress);
    
    if (vendorAddr && deliveryAddr) {
      calculateDistance(vendorAddr, deliveryAddr).then((calculatedDistance) => {
        if (calculatedDistance !== null) {
          setDistance(calculatedDistance);
        }
      });
    }
  }, [vendorLocation, selectedAddress]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    
    setIsValidatingCoupon(true);
    setCouponError("");
    
    try {
      const response = await fetch(`${API_COMPANY}/api/coupons/validate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: couponCode,
          orderAmount: itemsSubtotal,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        setCouponError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponError("");
        setStatus({ type: "success", message: `Coupon applied! You saved ${formatMoney(data.discountAmount)}` });
      }
    } catch (error) {
      setCouponError("Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode("");
    setCouponError("");
    setStatus(null);
  };

  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const getTimeRemaining = (expiryDate) => {
    const now = currentTime;
    const expiry = new Date(expiryDate);
    const diffMs = expiry - now;
    
    if (diffMs <= 0) {
      return { expired: true, text: 'Expired', urgent: true };
    }
    
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    // Less than 1 hour - show minutes
    if (diffHours < 1) {
      return {
        expired: false,
        text: `${diffMinutes} min${diffMinutes !== 1 ? 's' : ''} left`,
        urgent: true,
        veryUrgent: true
      };
    }
    
    // Less than 24 hours - show hours and minutes
    if (diffDays < 1) {
      const remainingMinutes = diffMinutes % 60;
      return {
        expired: false,
        text: `${diffHours}h ${remainingMinutes}m left`,
        urgent: true,
        veryUrgent: diffHours < 6
      };
    }
    
    // Less than 7 days - show days and hours
    if (diffDays < 7) {
      const remainingHours = diffHours % 24;
      const showHours = remainingHours > 0 && diffDays <= 3;
      return {
        expired: false,
        text: showHours 
          ? `${diffDays}d ${remainingHours}h left`
          : `${diffDays} day${diffDays !== 1 ? 's' : ''} left`,
        urgent: diffDays <= 3
      };
    }
    
    // 7 days or more - just show days
    return {
      expired: false,
      text: `${diffDays} days left`,
      urgent: false
    };
  };

  const getDaysRemaining = (date) => {
    const now = currentTime;
    const expiry = new Date(date);
    const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const getCouponBadge = (coupon) => {
    if (coupon.discountType === 'percentage') {
      return `${coupon.discountValue}% OFF`;
    }
    return `₹${coupon.discountValue} OFF`;
  };

  const applyCouponFromCard = (code) => {
    setCouponCode(code);
    setCouponError("");
    setExpandedCoupon(null);
    // Auto-apply after selecting
    setTimeout(() => {
      handleApplyCoupon();
    }, 100);
  };

  const handlePrintBill = () => {
    const printWindow = window.open('', '_blank');
    const billContent = billRef.current?.innerHTML || '';
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Order Bill</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto; }
          h1 { text-align: center; color: #333; }
          .bill-section { margin: 20px 0; }
          .bill-row { display: flex; justify-content: space-between; padding: 8px 0; }
          .bill-row.total { font-weight: bold; border-top: 2px solid #333; margin-top: 10px; padding-top: 10px; }
          .item-list { margin: 10px 0; }
          .item { display: flex; justify-content: space-between; padding: 5px 0; }
          @media print { button { display: none; } }
        </style>
      </head>
      <body>
        ${billContent}
        <button onclick="window.print()" style="margin-top: 20px; padding: 10px 20px; background: #ff6b35; color: white; border: none; border-radius: 5px; cursor: pointer;">Print Bill</button>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/sign-in", { state: { from: "/checkout" } });
      return;
    }
    if (items.length === 0 || hasMultipleVendors) return;
    if (!selectedAddress) {
      setStatus({ type: "error", message: "Please choose a delivery address." });
      return;
    }
    if (selectedPaymentMethod !== "cod") {
      setStatus({
        type: "error",
        message: "Only Cash on Delivery is available right now.",
      });
      return;
    }

    if (!vendorId) {
      setStatus({
        type: "error",
        message: "We could not confirm the restaurant for this order.",
      });
      return;
    }

    setIsPlacing(true);
    setStatus(null);
    try {
      const response = await fetch(`${API_COMPANY}/api/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          vendorId,
          items: items.map((item) => ({
            name: item.name,
            price: Number(item.price || 0),
            quantity: Number(item.quantity || 0),
          })),
          itemsSubtotal,
          couponCode: appliedCoupon?.code || "",
          couponDiscount,
          deliveryCharges,
          distance,
          tip: selectedTip,
          gst,
          totalDiscount: couponDiscount,
          grandTotal,
          paymentMethod: selectedPaymentMethod,
          customerAddress: addressText,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Order failed");
      dispatch({ type: "CLEAR_CART" });
      setOrderComplete(true);
      setStatus({ type: "success", message: "Order placed successfully." });
      // Navigate to orders page after successful order placement
      setTimeout(() => {
        navigate("/orders");
      }, 1500);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.message || "Order failed",
      });
    } finally {
      setIsPlacing(false);
    }
  };

  if (!user) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell">
          <div className="checkout-empty">
            <h2>Sign in to place your order</h2>
            <p>We will use your saved profile and address for delivery.</p>
            <Link to="/sign-in" className="cart-primary-action">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell">
          <div className="checkout-empty">
            <h2>Order confirmed</h2>
            <p>Your order is on its way to the kitchen.</p>
            <Link to="/" className="cart-primary-action">
              Continue browsing
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="checkout-page">
        <div className="checkout-shell">
          <div className="checkout-empty">
            <h2>Your cart is empty</h2>
            <p>Add items before heading to checkout.</p>
            <Link to="/" className="cart-primary-action">
              Browse restaurants
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return <PageLoader />;
  }

  return (
    <div className="checkout-page">
      <div className="checkout-shell">
        <div className="checkout-hero">
          <div>
            <p className="cart-kicker">Checkout</p>
            <h1>Confirm delivery details</h1>
            <p className="cart-subtitle">
              Review your contact info and choose a delivery address.
            </p>
          </div>
          <div className="cart-hero-chip">
            <span>{totalItems} items</span>
            <strong>{formatMoney(grandTotal)}</strong>
          </div>
        </div>

        <div className="checkout-grid">
          <section className="checkout-details">
            <div className="checkout-card">
              <h2>Contact details</h2>
              <div className="checkout-field">
                <span>Name</span>
                <strong>{user.name || user.email}</strong>
              </div>
              <div className="checkout-field">
                <span>Email</span>
                <strong>{user.email}</strong>
              </div>
              <div className="checkout-field">
                <span>Phone</span>
                <strong>{user.phone || "Add a phone number"}</strong>
              </div>
            </div>

            <div className="checkout-card">
              <h2>Delivery address</h2>
              {addresses.length === 0 ? (
                <div className="checkout-address-empty">
                  <p>Add a delivery address in your account settings.</p>
                  <Link to="/account">Go to account</Link>
                </div>
              ) : (
                <>
                  <label className="checkout-select">
                    <span>Choose address</span>
                    <select
                      value={selectedAddressId || selectedAddress?._id || ""}
                      onChange={(event) => setSelectedAddressId(event.target.value)}
                    >
                      {addresses.map((address) => (
                        <option key={address._id} value={address._id}>
                          {address.label || "Saved address"} - {address.line1}
                        </option>
                      ))}
                    </select>
                  </label>
                  {selectedAddress && (
                    <div className="checkout-address-preview">
                      <p>{addressText}</p>
                      {selectedAddress.phone && (
                        <span>Contact: {selectedAddress.phone}</span>
                      )}
                    </div>
                  )}
                  <div className="checkout-distance-display">
                    <span className="distance-label">Delivery Distance</span>
                    <div className="distance-value">
                      {isCalculatingDistance ? (
                        <span className="calculating">Calculating...</span>
                      ) : (
                        <span className="distance-number">{distance} km</span>
                      )}
                    </div>
                    <p className="distance-note">Calculated using OpenStreetMap</p>
                  </div>
                </>
              )}
            </div>

            <div className="checkout-card">
              <h2>
                Apply coupon
                <span className="live-indicator">LIVE</span>
              </h2>
              {availableCoupons.length > 0 && (
                <div className="checkout-coupon-offers">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <p style={{ margin: 0 }}>Available offers ({availableCoupons.length})</p>
                    {availableCoupons.length > 3 && (
                      <button
                        type="button"
                        onClick={() => setShowAllCoupons(!showAllCoupons)}
                        style={{
                          background: 'none',
                          border: 'none',
                          color: '#ea580c',
                          fontWeight: 600,
                          cursor: 'pointer',
                          fontSize: '0.85rem'
                        }}
                      >
                        {showAllCoupons ? 'Show less' : 'View all'}
                      </button>
                    )}
                  </div>
                  <div className="checkout-coupon-cards">
                    {(showAllCoupons ? availableCoupons : availableCoupons.slice(0, 3)).map((coupon) => {
                      const timeInfo = getTimeRemaining(coupon.validUntil);
                      const isExpanded = expandedCoupon === coupon.code;
                      
                      return (
                        <div 
                          key={coupon.code} 
                          className={`checkout-coupon-card ${timeInfo.urgent ? 'expiring' : ''} ${timeInfo.veryUrgent ? 'very-urgent' : ''}`}
                        >
                          <div className="coupon-card-header">
                            <div className="coupon-badge">{getCouponBadge(coupon)}</div>
                            <div className="coupon-code-tag">{coupon.code}</div>
                          </div>
                          
                          <div className="coupon-card-body">
                            <p className="coupon-description">{coupon.description}</p>
                            
                            <div className="coupon-meta">
                              <span className="coupon-min-order">
                                Min. order: {formatMoney(coupon.minOrderAmount)}
                              </span>
                              <span className={`coupon-validity ${timeInfo.urgent ? 'urgent' : ''} ${timeInfo.veryUrgent ? 'very-urgent' : ''}`}>
                                {timeInfo.urgent && '⏰ '}
                                {timeInfo.expired && '❌ '}
                                {timeInfo.text}
                              </span>
                            </div>

                            {isExpanded && (
                              <div className="coupon-terms">
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
                                </ul>
                              </div>
                            )}
                          </div>
                          
                          <div className="coupon-card-actions">
                            <button
                              type="button"
                              onClick={() => setExpandedCoupon(isExpanded ? null : coupon.code)}
                              className="coupon-action-link"
                            >
                              {isExpanded ? 'Hide details' : 'View T&C'}
                            </button>
                            <button
                              type="button"
                              onClick={() => applyCouponFromCard(coupon.code)}
                              className="coupon-apply-btn"
                              disabled={timeInfo.expired || appliedCoupon?.code === coupon.code || itemsSubtotal < coupon.minOrderAmount}
                            >
                              {timeInfo.expired ? 'Expired' : (appliedCoupon?.code === coupon.code ? <><i className="fas fa-check" style={{ marginRight: '4px', color: '#28a745' }}></i>Applied</> : 'Apply')}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              <div className="checkout-coupon-input-row">
                <input
                  type="text"
                  placeholder="Have a promo code? Enter here"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError("");
                  }}
                  disabled={!!appliedCoupon}
                  className="checkout-coupon-input"
                />
                {appliedCoupon ? (
                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="checkout-coupon-btn remove"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    disabled={isValidatingCoupon}
                    className="checkout-coupon-btn"
                  >
                    {isValidatingCoupon ? 'Validating...' : 'Apply'}
                  </button>
                )}
              </div>
              {couponError && (
                <p className="checkout-coupon-error">
                  {couponError}
                </p>
              )}
              {appliedCoupon && (
                <div className="checkout-coupon-success">
                  <i className="fas fa-check-circle" style={{ marginRight: '6px', color: '#28a745' }}></i>
                  {appliedCoupon.description || `Coupon ${appliedCoupon.code} applied`}
                  <strong>You saved {formatMoney(appliedCoupon.discountAmount)}</strong>
                </div>
              )}
            </div>

            <div className="checkout-card">
              <h2>Add tip (optional)</h2>
              <p className="checkout-payment-note">
                Show your appreciation for the delivery partner
              </p>
              <div className="checkout-tip-grid">
                {tipOptions.map((tip) => (
                  <button
                    key={tip}
                    type="button"
                    onClick={() => setSelectedTip(tip)}
                    className={`checkout-tip-option ${selectedTip === tip ? 'active' : ''}`}
                  >
                    ₹{tip}
                  </button>
                ))}
              </div>
              {selectedTip > 0 && (
                <button
                  type="button"
                  onClick={() => setSelectedTip(0)}
                  className="checkout-tip-remove"
                >
                  Remove tip
                </button>
              )}
            </div>

            <div className="checkout-card">
              <h2>Payment method</h2>
              <p className="checkout-payment-note">
                Cash on Delivery is available now. Online payment options will be enabled soon.
              </p>
              <div className="checkout-payment-grid">
                {paymentOptions.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    className={`checkout-payment-option ${selectedPaymentMethod === option.id ? "active" : ""} ${!option.enabled ? "disabled" : ""}`}
                    onClick={() => option.enabled && setSelectedPaymentMethod(option.id)}
                    disabled={!option.enabled}
                  >
                    <strong>{option.label}</strong>
                    <span>{option.subtitle}</span>
                  </button>
                ))}
              </div>
            </div>
          </section>

          <aside className="checkout-summary">
            <div className="cart-summary-card">
              <h2>Bill summary</h2>
              
              {/* Items breakdown */}
              <div className="checkout-bill-items">
                <h3>Items ({totalItems})</h3>
                {items.map((item, index) => (
                  <div key={index} className="checkout-bill-item">
                    <span>{item.name} × {item.quantity}</span>
                    <span>{formatMoney(item.price * item.quantity)}</span>
                  </div>
                ))}
              </div>
              
              {/* Bill breakdown */}
              <div className="cart-summary-row">
                <span>Items Subtotal</span>
                <strong>{formatMoney(itemsSubtotal)}</strong>
              </div>
              
              {couponDiscount > 0 && (
                <div className="cart-summary-row discount">
                  <span>Coupon Discount ({appliedCoupon?.code})</span>
                  <strong>- {formatMoney(couponDiscount)}</strong>
                </div>
              )}
              
              <div className="cart-summary-row">
                <span>Delivery Charges ({distance} km)</span>
                <strong>{formatMoney(deliveryCharges)}</strong>
              </div>
              
              {selectedTip > 0 && (
                <div className="cart-summary-row">
                  <span>Delivery Tip</span>
                  <strong>{formatMoney(selectedTip)}</strong>
                </div>
              )}
              
              <div className="cart-summary-row">
                <span>GST (5%)</span>
                <strong>{formatMoney(gst)}</strong>
              </div>
              
              <div className="cart-summary-total">
                <span>Grand Total</span>
                <strong>{formatMoney(grandTotal)}</strong>
              </div>
              
              {hasMultipleVendors && (
                <div className="cart-warning">
                  Orders can be placed from one restaurant at a time.
                </div>
              )}
              {status && (
                <div
                  className={`checkout-status ${status.type || ""}`}
                  role="status"
                >
                  {status.message}
                </div>
              )}
              <button
                className="cart-primary-action"
                type="button"
                onClick={handlePlaceOrder}
                disabled={
                  isPlacing ||
                  hasMultipleVendors ||
                  !selectedAddress ||
                  addresses.length === 0
                }
              >
                {isPlacing ? "Placing order..." : "Place order"}
              </button>
              
              <button
                type="button"
                onClick={handlePrintBill}
                className="checkout-print-btn"
              >
                Print Bill
              </button>
              
              <p className="cart-signin-note">
                By placing the order, you agree to the delivery terms.
              </p>
            </div>
            
            {/* Hidden bill content for printing */}
            <div ref={billRef} style={{ display: 'none' }}>
              <h1>TomoX Order Bill</h1>
              <div className="bill-section">
                <h3>Customer Details</h3>
                <p><strong>Name:</strong> {user.name || user.email}</p>
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Phone:</strong> {user.phone || 'N/A'}</p>
                <p><strong>Address:</strong> {addressText}</p>
              </div>
              
              <div className="bill-section">
                <h3>Order Items</h3>
                <div className="item-list">
                  {items.map((item, index) => (
                    <div key={index} className="item">
                      <span>{item.name} × {item.quantity}</span>
                      <strong>{formatMoney(item.price * item.quantity)}</strong>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="bill-section">
                <h3>Bill Breakdown</h3>
                <div className="bill-row">
                  <span>Items Subtotal ({totalItems} items)</span>
                  <strong>{formatMoney(itemsSubtotal)}</strong>
                </div>
                {couponDiscount > 0 && (
                  <div className="bill-row">
                    <span>Coupon Discount ({appliedCoupon?.code})</span>
                    <strong style={{ color: '#28a745' }}>- {formatMoney(couponDiscount)}</strong>
                  </div>
                )}
                <div className="bill-row">
                  <span>Delivery Charges ({distance} km @ ₹5/km, min ₹20)</span>
                  <strong>{formatMoney(deliveryCharges)}</strong>
                </div>
                {selectedTip > 0 && (
                  <div className="bill-row">
                    <span>Delivery Partner Tip</span>
                    <strong>{formatMoney(selectedTip)}</strong>
                  </div>
                )}
                <div className="bill-row">
                  <span>GST (5%)</span>
                  <strong>{formatMoney(gst)}</strong>
                </div>
                <div className="bill-row total">
                  <span>Grand Total</span>
                  <strong>{formatMoney(grandTotal)}</strong>
                </div>
              </div>
              
              <div className="bill-section">
                <p><strong>Payment Method:</strong> {selectedPaymentMethod === 'cod' ? 'Cash on Delivery' : selectedPaymentMethod.toUpperCase()}</p>
                <p><strong>Order Date:</strong> {new Date().toLocaleString('en-IN')}</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
