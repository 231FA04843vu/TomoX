import React, { useMemo } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate } from 'react-router-dom';

const Cart = ({ user }) => {
  const { cart, dispatch } = useCart();
  const navigate = useNavigate();

  if (!cart || !cart.items) {
    return <div className="cart-page">Something went wrong with cart context.</div>;
  }

  const items = cart.items || [];
  const vendorIds = useMemo(
    () => new Set(items.map((item) => item.vendorId).filter(Boolean)),
    [items]
  );
  const hasMultipleVendors = vendorIds.size > 1;

  const formatMoney = (value) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value || 0);

  const subtotal = items.reduce(
    (acc, item) => acc + Number(item.price || 0) * Number(item.quantity || 0),
    0
  );
  const totalItems = items.reduce(
    (acc, item) => acc + Number(item.quantity || 0),
    0
  );

  const handleCheckout = () => {
    if (!user) {
      navigate('/sign-in', { state: { from: '/cart' } });
      return;
    }
    if (hasMultipleVendors || items.length === 0) return;
    navigate('/checkout');
  };

  return (
    <div className="cart-page">
      <div className="cart-shell">
        <div className="cart-hero">
          <div>
            <p className="cart-kicker">Your order</p>
            <h1>Review your cart</h1>
            <p className="cart-subtitle">
              Confirm quantities and proceed when you are ready.
            </p>
          </div>
          <div className="cart-hero-chip">
            <span>{totalItems} items</span>
            <strong>{formatMoney(subtotal)}</strong>
          </div>
        </div>

        {items.length === 0 ? (
          <div className="cart-empty">
            <div className="cart-empty-art" aria-hidden="true"></div>
            <h2>Your cart is feeling light</h2>
            <p>Pick something delicious and it will show up here.</p>
            <Link to="/" className="cart-primary-action">
              Browse restaurants
            </Link>
          </div>
        ) : (
          <div className="cart-grid">
            <section className="cart-items">
              {items.map((item) => {
                // Always use itemId as the key - must be unique and consistent
                const itemKey = String(item.itemId || item._id || item.id || '');
                if (!itemKey) {
                  console.warn("Cart item missing itemId:", item);
                  return null;
                }
                const lineTotal = Number(item.price || 0) * Number(item.quantity || 0);
                return (
                  <article key={itemKey} className="cart-item">
                    <div className="cart-item-media">
                      <img
                        src={item.image || '/default-food.png'}
                        alt={item.name}
                        loading="lazy"
                        decoding="async"
                        onError={(event) => {
                          event.currentTarget.src = '/default-food.png';
                        }}
                      />
                    </div>
                    <div className="cart-item-body">
                      <div className="cart-item-top">
                        <div>
                          <h3 className="cart-item-title">{item.name}</h3>
                          <p className="cart-item-meta">
                            {item.restaurantName || 'Restaurant menu item'}
                          </p>
                        </div>
                        <div className="cart-item-price">{formatMoney(lineTotal)}</div>
                      </div>
                      <div className="cart-item-actions">
                        <div className="cart-qty">
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({ type: 'DECREMENT', payload: itemKey })
                            }
                            aria-label={`Decrease ${item.name}`}
                          >
                            -
                          </button>
                          <span>{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() =>
                              dispatch({ type: 'INCREMENT', payload: itemKey })
                            }
                            aria-label={`Increase ${item.name}`}
                          >
                            +
                          </button>
                        </div>
                        <button
                          type="button"
                          className="cart-remove"
                          onClick={() =>
                            dispatch({ type: 'REMOVE_ITEM', payload: itemKey })
                          }
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside className="cart-summary">
              <div className="cart-summary-card">
                <h2>Order summary</h2>
                <div className="cart-summary-row">
                  <span>Subtotal</span>
                  <strong>{formatMoney(subtotal)}</strong>
                </div>
                <div className="cart-summary-row">
                  <span>Items</span>
                  <strong>{totalItems}</strong>
                </div>
                <div className="cart-summary-total">
                  <span>Total</span>
                  <strong>{formatMoney(subtotal)}</strong>
                </div>
                {hasMultipleVendors && (
                  <div className="cart-warning">
                    Orders can be placed from one restaurant at a time.
                  </div>
                )}
                <button
                  className="cart-primary-action"
                  type="button"
                  onClick={handleCheckout}
                  disabled={hasMultipleVendors || items.length === 0}
                >
                  Continue to checkout
                </button>
                {!user && (
                  <p className="cart-signin-note">
                    Sign in to complete your order.
                  </p>
                )}
              </div>
              <div className="cart-support">
                <p>Need help with your order?</p>
                <Link to="/help">Chat with support</Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
