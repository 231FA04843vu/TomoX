import React, { useEffect, useMemo, useState, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";
import PageLoader from "../components/PageLoader";
import CouponDrawer from "../components/CouponDrawer";
import { normalizeAssetUrl } from "../utils/url";
import "../styles/pageLoader.css";
import "../styles/secureCheckout.css";

const API_COMPANY = import.meta.env.VITE_API_COMPANY || "http://localhost:5000";

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

const Cart = ({ user }) => {
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
  const [isCouponDrawerOpen, setIsCouponDrawerOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState(0);
  const [distance, setDistance] = useState(2.2);
  const [availableCoupons, setAvailableCoupons] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [vendorLocation, setVendorLocation] = useState(null);
  const [isCalculatingDistance, setIsCalculatingDistance] = useState(false);

  const [noContactDelivery, setNoContactDelivery] = useState(false);

  const paymentOptions = [
    { id: "cod", label: "Cash on Delivery", subtitle: "Pay when your order arrives", enabled: true },
    { id: "upi", label: "UPI", subtitle: "Coming soon", enabled: false },
    { id: "card", label: "Credit / Debit Card", subtitle: "Coming soon", enabled: false },
  ];

  const token = useMemo(() => localStorage.getItem("token"), []);
  const items = cart?.items || [];

  const itemsSubtotal = items.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );

  const deliveryCharges = Math.max(20, distance * 5);
  const couponDiscount = appliedCoupon?.discountAmount || 0;
  const platformFee = items.length > 0 ? 17.58 : 0;
  const restaurantGst = Math.round(itemsSubtotal * 0.05 * 100) / 100;
  const deliveryGst = Math.round(deliveryCharges * 0.18 * 100) / 100;
  const gst = Math.round((platformFee + restaurantGst + deliveryGst) * 100) / 100;
  const subtotalAfterDiscount = itemsSubtotal - couponDiscount;
  const grandTotal = subtotalAfterDiscount + deliveryCharges + selectedTip + gst;
  const totalItems = items.reduce((acc, item) => acc + Number(item.quantity || 0), 0);

  const vendorIds = useMemo(
    () => new Set(items.map((item) => item.vendorId).filter(Boolean)),
    [items]
  );
  const hasMultipleVendors = vendorIds.size > 1;
  const vendorId = useMemo(() => Array.from(vendorIds)[0], [vendorIds]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!vendorId || !token) return;
    fetch(`${API_COMPANY}/api/restaurants/vendor/${vendorId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.location) {
          setVendorLocation({ line1: data.location, city: '', state: '', postalCode: '' });
        }
      })
      .catch((err) => console.error('Failed to fetch vendor location:', err));
  }, [vendorId, token]);

  const calculateDistance = async (address1, address2) => {
    try {
      setIsCalculatingDistance(true);
      const geocode = async (address) => {
        const query = encodeURIComponent(address);
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${query}&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
        return null;
      };
      const [coord1, coord2] = await Promise.all([geocode(address1), geocode(address2)]);
      if (!coord1 || !coord2) return null;
      const R = 6371;
      const dLat = (coord2.lat - coord1.lat) * Math.PI / 180;
      const dLon = (coord2.lon - coord1.lon) * Math.PI / 180;
      const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.cos(coord1.lat * Math.PI / 180) * Math.cos(coord2.lat * Math.PI / 180) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return Math.round(R * c * 10) / 10;
    } catch (error) {
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
    fetch(`${API_COMPANY}/api/me/addresses`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => setAddresses(data.addresses || []))
      .catch(() => setAddresses([]));

    fetch(`${API_COMPANY}/api/coupons/active`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAvailableCoupons(data);
        setIsLoading(false);
      })
      .catch(() => {
        setAvailableCoupons([]);
        setIsLoading(false);
      });
  }, [token]);

  const defaultAddress = addresses.find((address) => address.isDefault) || addresses[0];
  const selectedAddress = addresses.find((address) => address._id === selectedAddressId) || defaultAddress;
  const addressText = buildAddressText(selectedAddress);

  useEffect(() => {
    if (!vendorLocation || !selectedAddress) return;
    const vendorAddr = buildAddressText(vendorLocation);
    const deliveryAddr = buildAddressText(selectedAddress);
    if (vendorAddr && deliveryAddr) {
      calculateDistance(vendorAddr, deliveryAddr).then((calculatedDistance) => {
        if (calculatedDistance !== null) setDistance(calculatedDistance);
      });
    }
  }, [vendorLocation, selectedAddress]);

  const handleApplyCoupon = async (codeToApply = couponCode) => {
    if (!codeToApply.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    setIsValidatingCoupon(true);
    setCouponError("");
    try {
      const response = await fetch(`${API_COMPANY}/api/coupons/validate`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ code: codeToApply, orderAmount: itemsSubtotal }),
      });
      const data = await response.json();
      if (!response.ok) {
        setCouponError(data.message || "Invalid coupon code");
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon(data);
        setCouponError("");
        setCouponCode(data.code);
        setIsCouponDrawerOpen(false);
      }
    } catch (error) {
      setCouponError("Failed to validate coupon");
      setAppliedCoupon(null);
    } finally {
      setIsValidatingCoupon(false);
    }
  };

  const handlePlaceOrder = async () => {
    if (!user) {
      navigate("/sign-in", { state: { from: "/cart" } });
      return;
    }
    if (items.length === 0 || hasMultipleVendors) return;
    if (!selectedAddress) {
      alert("Please choose a delivery address.");
      return;
    }
    if (selectedPaymentMethod !== "cod") {
      alert("Only Cash on Delivery is available right now.");
      return;
    }
    if (!vendorId) {
      alert("We could not confirm the restaurant for this order.");
      return;
    }
    setIsPlacing(true);
    try {
      const response = await fetch(`${API_COMPANY}/api/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
      setTimeout(() => navigate("/orders"), 1500);
    } catch (error) {
      alert(error.message || "Order failed");
    } finally {
      setIsPlacing(false);
    }
  };

  if (!user) {
    return (
      <div className="cart-page">
        <div className="cart-shell">
          <div className="cart-empty">
            <h2>Sign in to place your order</h2>
            <Link to="/sign-in" className="cart-primary-action">Sign in</Link>
          </div>
        </div>
      </div>
    );
  }

  if (orderComplete) {
    return (
      <div className="cart-page">
        <div className="cart-shell">
          <div className="cart-empty">
            <h2>Order confirmed</h2>
            <p>Your order is on its way to the kitchen.</p>
            <Link to="/" className="cart-primary-action">Continue browsing</Link>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="cart-page">
        <div className="cart-shell">
          <div className="cart-empty">
            <h2>Your cart is empty</h2>
            <p>Add items before heading to checkout.</p>
            <Link to="/" className="cart-primary-action">Browse restaurants</Link>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) return <PageLoader />;

  return (
    <div className="secure-checkout-page">
      {/* Secure Header */}
      <header className="secure-header">
        <div className="secure-header-content">
          <div className="secure-header-left">
            <Link to="/">
              <img src="/tomologo.png" alt="TomoX" style={{ height: "40px" }} />
            </Link>
            <div className="secure-header-title">SECURE CHECKOUT</div>
          </div>
          <div className="secure-header-right">
            <span><i className="fas fa-life-ring"></i> Help</span>
            <Link to="/account" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span><i className="far fa-user"></i> {user?.name || "Account"}</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Checkout Area */}
      <main className="secure-checkout-main">
        
        {/* Left Column (Address & Payment) */}
        <div className="secure-checkout-left">
          
          <div className="checkout-step">
            <div className={`step-icon-box ${selectedAddress ? 'active' : 'inactive'}`}>
              <i className="fas fa-map-marker-alt"></i>
            </div>
            <div className="step-content">
              <div className="step-header">
                <h2>Add a delivery address</h2>
                <p>Choose where you want your food delivered</p>
              </div>

              {addresses.length > 0 && (
                <div style={{ marginBottom: '20px' }}>
                  <select 
                    style={{ width: '100%', padding: '12px', border: '1px solid #d4d5d9', borderRadius: '4px' }}
                    value={selectedAddressId || selectedAddress?._id || ""}
                    onChange={(event) => setSelectedAddressId(event.target.value)}
                  >
                    {addresses.map((address) => (
                      <option key={address._id} value={address._id}>
                        {address.label || "Saved address"} - {address.line1}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="address-card-dashed" onClick={() => navigate('/account')}>
                <i className="fas fa-map-pin"></i>
                <div>
                  <h3>Add New Address</h3>
                  <p>{selectedAddress ? addressText : "No addresses found. Click to add one in your account settings."}</p>
                  <button className="btn-add-new">ADD NEW</button>
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-step">
            <div className="step-icon-box inactive">
              <i className="fas fa-wallet"></i>
            </div>
            <div className="step-content">
              <h2 className="step-header-inactive">Payment</h2>
              <div style={{ marginTop: '20px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {paymentOptions.map(option => (
                    <label key={option.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: option.enabled ? 'pointer' : 'not-allowed', opacity: option.enabled ? 1 : 0.5 }}>
                      <input 
                        type="radio" 
                        name="paymentMethod" 
                        value={option.id} 
                        checked={selectedPaymentMethod === option.id}
                        onChange={() => option.enabled && setSelectedPaymentMethod(option.id)}
                        disabled={!option.enabled}
                        style={{ accentColor: '#fc8019', width: '18px', height: '18px' }}
                      />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>{option.label}</div>
                        <div style={{ fontSize: '13px', color: '#7e808c' }}>{option.subtitle}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column (Cart & Bill) */}
        <div className="secure-checkout-right">
          <div className="cart-summary-box">
            
            <div className="cart-restaurant-info">
              <img src={items[0]?.image ? normalizeAssetUrl(items[0].image) : "/default-food.png"} alt="Restaurant" />
              <div>
                <h2>{items[0]?.restaurantName || 'Restaurant'}</h2>
                <p>{vendorLocation ? vendorLocation.line1 : 'Local Area'}</p>
              </div>
            </div>

            <div className="cart-items-list">
              {items.map(item => {
                const itemKey = String(item.itemId || item._id || item.id || '');
                return (
                  <div className="cart-item-row" key={itemKey}>
                    <div className="cart-item-name">
                      <div className="veg-indicator"></div>
                      <div>
                        {item.name}
                        <div style={{ fontSize: '12px', color: '#fc8019', cursor: 'pointer', marginTop: '4px' }}>Customize &gt;</div>
                      </div>
                    </div>
                    
                    <div className="cart-item-controls">
                      <button onClick={() => dispatch({type: 'DECREMENT', payload: itemKey})}>-</button>
                      <span>{item.quantity}</span>
                      <button onClick={() => dispatch({type: 'INCREMENT', payload: itemKey})}>+</button>
                    </div>
                    
                    <div className="cart-item-price">
                      {formatMoney(item.price * item.quantity)}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="suggestions-box">
              <i className="fas fa-quote-left"></i>
              <input type="text" placeholder="Any suggestions? We will pass it on..." />
            </div>

            <div className="no-contact-box">
              <input 
                type="checkbox" 
                id="noContact" 
                checked={noContactDelivery} 
                onChange={(e) => setNoContactDelivery(e.target.checked)} 
              />
              <label htmlFor="noContact">
                Opt in for No-contact Delivery
                <p>Unwell, or avoiding contact? Please select no-contact delivery. Partner will safely place the order outside your door (not for COD)</p>
              </label>
            </div>

            {appliedCoupon ? (
              <div className="coupon-box" style={{ padding: '12px 16px' }}>
                <i className="fas fa-percent" style={{ color: '#60b246' }}></i> 
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', paddingLeft: '4px' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', color: '#282c3f' }}>{appliedCoupon.code} applied</span>
                  <span style={{ fontSize: '12px', color: '#60b246', fontWeight: 500 }}>You saved {formatMoney(couponDiscount)}</span>
                </div>
                <button onClick={() => { setAppliedCoupon(null); setCouponCode(""); }} style={{ border: 'none', background: 'none', color: '#fc8019', fontWeight: 600, cursor: 'pointer', fontSize: '13px' }}>REMOVE</button>
              </div>
            ) : (
              <div className="coupon-box" onClick={() => setIsCouponDrawerOpen(true)}>
                <i className="fas fa-percent"></i> 
                <div style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600, fontSize: '14px', flex: 1 }}>Apply Coupon</span>
                </div>
              </div>
            )}
            {couponError && <div style={{ color: '#e43b4f', fontSize: '12px', marginTop: '4px' }}>{couponError}</div>}

            <div className="bill-details">
              <h3>Bill Details</h3>
              <div className="bill-row">
                <span>Item Total</span>
                <span>{formatMoney(itemsSubtotal)}</span>
              </div>
              <div className="bill-row">
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  Delivery Fee | {isCalculatingDistance ? '...' : distance} kms 
                  <div className="bill-tooltip-container">
                    <i className="fas fa-info-circle" style={{color: '#93959f', fontSize: '11px'}}></i>
                    <div className="bill-tooltip-content">
                      <div className="bill-tooltip-header">Delivery fee breakup for this order</div>
                      <div className="bill-tooltip-row">
                        <span className="bill-tooltip-row-title">Standard Fee</span>
                        <span className="bill-tooltip-row-value">{formatMoney(deliveryCharges)}</span>
                      </div>
                    </div>
                  </div>
                </span>
                <span>{formatMoney(deliveryCharges)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className="bill-row discount">
                  <span>Extra discount for you</span>
                  <span>- {formatMoney(couponDiscount)}</span>
                </div>
              )}
              
              <div className="bill-divider"></div>
              
              <div className="bill-row">
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  GST & Other Charges 
                  <div className="bill-tooltip-container">
                    <i className="fas fa-info-circle" style={{color: '#93959f', fontSize: '11px'}}></i>
                    <div className="bill-tooltip-content">
                      <div className="bill-tooltip-header">GST & Other Charges</div>
                      <div className="bill-tooltip-row">
                        <div className="bill-tooltip-row-left">
                          <span className="bill-tooltip-row-title">Platform Fee</span>
                          <span className="bill-tooltip-row-desc">Inclusive of GST. This fee helps us operate and maintain platform</span>
                        </div>
                        <span className="bill-tooltip-row-value">{formatMoney(platformFee)}</span>
                      </div>
                      <div className="bill-tooltip-row">
                        <div className="bill-tooltip-row-left">
                          <span className="bill-tooltip-row-title">Restaurant GST</span>
                          <span className="bill-tooltip-row-desc">We play no role in govt. or restaurant related taxes & charges</span>
                        </div>
                        <span className="bill-tooltip-row-value">{formatMoney(restaurantGst)}</span>
                      </div>
                      <div className="bill-tooltip-row">
                        <div className="bill-tooltip-row-left">
                          <span className="bill-tooltip-row-title">GST on Delivery fee</span>
                        </div>
                        <span className="bill-tooltip-row-value">{formatMoney(deliveryGst)}</span>
                      </div>
                    </div>
                  </div>
                </span>
                <span>{formatMoney(gst)}</span>
              </div>
              
              <div className="bill-divider" style={{ background: '#282c3f', height: '2px' }}></div>
              
              <div className="bill-total">
                <span>TO PAY</span>
                <span>{formatMoney(grandTotal)}</span>
              </div>
            </div>

          </div>

          {couponDiscount > 0 && (
            <div className="savings-box">
              Savings of {formatMoney(couponDiscount)}
            </div>
          )}

          <button 
            className="cart-primary-action" 
            onClick={handlePlaceOrder} 
            disabled={isPlacing || hasMultipleVendors || !selectedAddress || addresses.length === 0}
            style={{ marginTop: '16px', padding: '16px', fontSize: '16px', width: '100%', borderRadius: '4px', textTransform: 'uppercase', fontWeight: 700, cursor: 'pointer' }}
          >
            {isPlacing ? "Placing Order..." : "Place Order"}
          </button>
        </div>

      </main>

      <CouponDrawer 
        isOpen={isCouponDrawerOpen}
        onClose={() => setIsCouponDrawerOpen(false)}
        availableCoupons={availableCoupons}
        couponCode={couponCode}
        setCouponCode={setCouponCode}
        handleApplyCoupon={handleApplyCoupon}
        couponError={couponError}
        itemsSubtotal={itemsSubtotal}
      />
    </div>
  );
};

export default Cart;
