import React, { useState } from 'react';

const CouponDrawer = ({ 
  isOpen, 
  onClose, 
  availableCoupons, 
  couponCode, 
  setCouponCode, 
  handleApplyCoupon,
  couponError,
  itemsSubtotal = 0
}) => {
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  if (!isOpen) return null;

  const available = availableCoupons?.filter(c => c.minOrderAmount <= itemsSubtotal) || [];
  const unavailable = availableCoupons?.filter(c => c.minOrderAmount > itemsSubtotal) || [];

  const renderCouponCard = (coupon, isAvailable) => {
    const isExpanded = expandedTerms.has(coupon.code);
    const shortfall = coupon.minOrderAmount - itemsSubtotal;

    return (
      <div key={coupon._id || coupon.code} style={{ borderBottom: '1px dashed #d4d5d9', paddingBottom: '24px' }}>
        
        {/* Ticket Header */}
        <div style={{ display: 'flex', alignItems: 'center', background: '#fdf6e6', padding: '8px 12px', border: '1px solid #f2e3c6', width: 'fit-content', position: 'relative', marginBottom: '16px' }}>
          {/* Left cutout */}
          <div style={{ position: 'absolute', left: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', background: '#fff', borderRadius: '50%', borderRight: '1px solid #f2e3c6' }}></div>
          
          <div style={{ padding: '0 12px 0 4px', display: 'flex', alignItems: 'center', borderRight: '1px dashed #d4d5d9' }}>
             <img src="/tomologo.png" alt="icon" style={{ height: '14px', filter: 'grayscale(100%)' }} />
          </div>
          <span style={{ fontWeight: '800', color: '#282c3f', fontSize: '15px', paddingLeft: '12px', paddingRight: '4px' }}>{coupon.code}</span>
          
          {/* Right cutout */}
          <div style={{ position: 'absolute', right: '-5px', top: '50%', transform: 'translateY(-50%)', width: '10px', height: '10px', background: '#fff', borderRadius: '50%', borderLeft: '1px solid #f2e3c6' }}></div>
        </div>
        
        <h3 style={{ fontSize: '18px', fontWeight: '700', color: '#3d4152', margin: '0 0 12px 0', letterSpacing: '-0.3px' }}>
          {coupon.title || coupon.code}
        </h3>
        
        <p style={{ fontSize: '14px', color: '#686b78', margin: '0 0 16px 0', lineHeight: '1.4' }}>
          {coupon.description}
        </p>
        
        <div 
          onClick={() => setSelectedCoupon(coupon)}
          style={{ color: '#5b8ede', fontSize: '13px', fontWeight: '800', cursor: 'pointer', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          + MORE
        </div>


        {isAvailable ? (
          <button 
            onClick={() => {
              setCouponCode(coupon.code);
              handleApplyCoupon(coupon.code);
            }}
            style={{ border: '1px solid #fc8019', color: '#fc8019', background: '#fff', padding: '10px 16px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', textTransform: 'uppercase' }}
          >
            APPLY COUPON
          </button>
        ) : (
          <div style={{ color: '#e43b4f', fontSize: '14px', fontWeight: '500' }}>
            Add ₹{shortfall} more to avail this offer
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="auth-drawer-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div 
        className="auth-drawer open" 
        onClick={(e) => e.stopPropagation()}
        style={{ padding: '0', display: 'flex', flexDirection: 'column', width: '420px', maxWidth: '100%', right: 0 }}
      >
        <div style={{ padding: '24px 32px 16px', display: 'flex', alignItems: 'center' }}>
          {selectedCoupon ? (
            <button onClick={() => setSelectedCoupon(null)} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#282c3f', padding: 0, marginRight: '16px' }}>
              <i className="fas fa-arrow-left"></i>
            </button>
          ) : (
            <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#282c3f', padding: 0 }}>
              <i className="fas fa-times"></i>
            </button>
          )}
        </div>
        
        <div style={{ padding: '0 32px 24px', flex: 1, overflowY: 'auto' }}>
          
          {selectedCoupon ? (
            <div>
              <p style={{ fontSize: '16px', color: '#3d4152', margin: '0 0 24px 0', lineHeight: '1.5' }}>
                {selectedCoupon.description}
              </p>
              
              {selectedCoupon.termsAndConditions && selectedCoupon.termsAndConditions.length > 0 && (
                <div>
                  <h4 style={{ fontSize: '15px', fontWeight: '700', color: '#3d4152', margin: '0 0 16px 0' }}>Terms and Conditions</h4>
                  <ul style={{ paddingLeft: '20px', margin: 0 }}>
                    {selectedCoupon.termsAndConditions.map((term, index) => (
                      <li key={index} style={{ fontSize: '14px', color: '#3d4152', marginBottom: '16px', lineHeight: '1.5' }}>
                        {term}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Coupon Input Area */}
          <div style={{ display: 'flex', border: '1px solid #d4d5d9', marginBottom: '32px' }}>
            <input 
              type="text" 
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              placeholder="Enter coupon code" 
              style={{ flex: 1, border: 'none', padding: '14px 16px', fontSize: '15px', outline: 'none', textTransform: 'uppercase', color: '#282c3f', fontWeight: '600' }}
            />
            <button 
              onClick={() => handleApplyCoupon(couponCode)}
              style={{ background: '#fc8019', color: '#fff', border: 'none', padding: '0 28px', fontWeight: '700', cursor: 'pointer', fontSize: '14px' }}
            >
              APPLY
            </button>
          </div>
          {couponError && <div style={{ color: '#e43b4f', fontSize: '12px', marginTop: '-24px', marginBottom: '24px' }}>{couponError}</div>}

          {/* Available Coupons */}
          {available.length > 0 && (
            <div style={{ marginBottom: '32px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#7e808c', marginBottom: '24px' }}>AVAILABLE COUPONS</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                {available.map(c => renderCouponCard(c, true))}
              </div>
            </div>
          )}

              {/* Unavailable Coupons */}
              {unavailable.length > 0 && (
                <div>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: '#7e808c', marginBottom: '24px' }}>UNAVAILABLE COUPONS</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
                    {unavailable.map(c => renderCouponCard(c, false))}
                  </div>
                </div>
              )}
            </>
          )}

        </div>
      </div>
    </div>
  );
};

export default CouponDrawer;
