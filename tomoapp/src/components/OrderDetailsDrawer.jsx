import React from 'react';

const formatCurrency = (value) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Number(value || 0));

const formatOrderDateTime = (value) => {
  if (!value) return "-";
  const date = new Date(value);
  const parts = date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "2-digit",
    year: "numeric",
  });
  const time = date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
  return `${parts}, ${time}`;
};

const CloseIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
);

const MarkerIcon = () => (
  <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
    <circle cx="12" cy="10" r="1.5"></circle>
  </svg>
);

const CheckIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" stroke="#0ba376" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 7 10 17 5 12"></polyline>
  </svg>
);

const VegIcon = ({ isVeg }) => {
  const color = isVeg !== false ? '#0f8a65' : '#e43b4f';
  return (
    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="0.5" y="0.5" width="15" height="15" stroke={color} />
      {isVeg !== false ? (
        <circle cx="8" cy="8" r="4" fill={color} />
      ) : (
        <path d="M8 4L12 10H4L8 4Z" fill={color} />
      )}
    </svg>
  );
};

const OrderDetailsDrawer = ({ isOpen, onClose, order }) => {
  if (!isOpen || !order) return null;

  const orderId = String(order._id).toUpperCase();
  const addressString = order.customerAddress || "";
  const addressLines = addressString.split(',').map(s => s.trim());
  const deliveryLabel = addressLines.length > 0 ? addressLines[0] : "Delivery Address";
  const deliverySub = addressLines.length > 1 ? addressLines.slice(1).join(', ') : "";

  return (
    <div className="order-details-drawer-overlay" onClick={onClose}>
      <div className="order-details-drawer-container" onClick={(e) => e.stopPropagation()}>
        <div className="order-details-header">
          <button className="order-details-close" onClick={onClose}>
            <CloseIcon />
          </button>
          <h2>Order #{orderId}</h2>
        </div>

        <div className="order-details-body">
          {/* Tracking Timeline */}
          <div className="order-tracking-timeline">
            <div className="tracking-step">
              <div className="tracking-icon-container">
                <MarkerIcon />
                <div className="tracking-line"></div>
              </div>
              <div className="tracking-content">
                <h4>{order.restaurantName || "Restaurant"}</h4>
                <p>{order.restaurantLocation || ""}</p>
              </div>
            </div>

            <div className="tracking-step">
              <div className="tracking-icon-container">
                <MarkerIcon />
                <div className="tracking-line"></div>
              </div>
              <div className="tracking-content">
                <h4>{deliveryLabel}</h4>
                <p>{deliverySub}</p>
              </div>
            </div>

            <div className="tracking-step completed">
              <div className="tracking-icon-container" style={{paddingTop: '2px'}}>
                <CheckIcon />
              </div>
              <div className="tracking-content tracking-completed">
                <div className="completed-text">
                  <div>Delivered on {formatOrderDateTime(order.updatedAt || order.createdAt)}</div>
                  {order.deliveryPersonName && <div>by {order.deliveryPersonName.toUpperCase()}</div>}
                </div>
                <span className="on-time-pill">ON TIME</span>
              </div>
            </div>
          </div>

          <div className="order-items-section">
            <h3 className="section-title">{(order.items || []).length} ITEM{(order.items || []).length !== 1 ? 'S' : ''}</h3>
            
            {(order.items || []).map((item, idx) => (
              <div key={idx} className="order-item-row">
                <div className="item-veg-nonveg">
                  <VegIcon isVeg={item.isVeg} />
                </div>
                <div className="item-details">
                  <div className="item-name-qty">
                    <div className="item-name-block">
                      <span className="item-name">{item.name}</span>
                      <div className="item-qty">x {item.quantity}</div>
                    </div>
                    <span className="item-price">{formatCurrency(item.price)}</span>
                  </div>
                  {item.description && <p className="item-desc">{item.description}</p>}
                </div>
              </div>
            ))}
          </div>

          <div className="order-bill-section">
            <div className="bill-row">
              <span>Item Total</span>
              <span>{formatCurrency(order.itemsSubtotal || order.totalPrice)}</span>
            </div>
            
            {order.deliveryCharges > 0 && (
              <div className="bill-row">
                <span>Delivery Fee | {order.distance || 0} kms</span>
                <span>{formatCurrency(order.deliveryCharges)}</span>
              </div>
            )}

            {order.totalDiscount > 0 && (
              <div className="bill-row discount">
                <span>Discount Applied</span>
                <span>-{formatCurrency(order.totalDiscount)}</span>
              </div>
            )}

            {order.gst > 0 && (
              <div className="bill-row">
                <span>Taxes</span>
                <span>{formatCurrency(order.gst)}</span>
              </div>
            )}

            <div className="bill-divider"></div>
            
            <div className="bill-row grand-total">
              <span>
                Paid Via {order.paymentMethod ? order.paymentMethod.charAt(0).toUpperCase() + order.paymentMethod.slice(1).toLowerCase() : "Bank"}
              </span>
              <div className="total-right">
                <span className="bill-total-label">BILL TOTAL</span>
                <span className="bill-total-amount">{formatCurrency(order.grandTotal || order.totalPrice)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsDrawer;
