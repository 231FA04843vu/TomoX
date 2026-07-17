import React, { useState, useEffect } from "react";

const TAWK_PROPERTY_ID = "691dcb3e880734195eaa1f78";
const TAWK_WIDGET_ID = "1jj61qkuo";
const TAWK_EMBEDDED_ID = `tawk_${TAWK_PROPERTY_ID}`;
const DEFAULT_WHATSAPP_MESSAGE = "Hi TomoX team, I need help with my order.";
const DEFAULT_WHATSAPP_PHONE = "15557755331";

function normalizePhone(value) {
  return String(value || "")
    .replace(/[^\d]/g, "")
    .trim();
}

function applyVisitorAttributes(user) {
  const api = window.Tawk_API;
  if (!api || typeof api.setAttributes !== "function") return;
  const attributes = { source: "website" };
  if (user?.name) attributes.name = user.name;
  if (user?.email) attributes.email = user.email;
  if (user?.phone) attributes.phone = user.phone;
  api.setAttributes(attributes, () => {});
}

const helpCategories = [
  {
    id: "account",
    label: "Account Management",
    items: [
      { q: "How do I create an account?", a: "Click on the profile icon, select 'Sign Up', and enter your email and password. Verify your email with the OTP sent to your inbox." },
      { q: "How do I change my password?", a: "Go to My Account → Password → Enter current password and new password → Save changes." },
      { q: "How do I update my profile information?", a: "Go to My Account → Personal Info → Edit your name, email, or phone → Save changes." },
      { q: "How do I delete my account?", a: "Go to My Account → scroll to bottom → tap 'Delete Account' → confirm deletion. Note: This action is permanent and will delete all your order history and saved data." },
      { q: "Can I have multiple accounts?", a: "Each email can only be linked to one account as per our policy." },
      { q: "How do I logout?", a: "Go to My Account → scroll down → tap 'Logout' button." },
    ],
  },
  {
    id: "orders",
    label: "Orders & Tracking",
    items: [
      { q: "How do I track my order?", a: "Go to Orders page to see real-time updates. Track restaurant preparation and estimated arrival time." },
      { q: "Can I modify my order?", a: "Yes, within 2 minutes of placing. Once restaurant accepts, you'll need to cancel and place a new order." },
      { q: "Can I cancel my order?", a: "Orders can be cancelled within 2 minutes of placing. After that, contact support. Some charges may apply per restaurant policy." },
      { q: "How do I reorder previous orders?", a: "Go to Orders → select past order → items will be shown. Add them to cart manually from the restaurant page." },
      { q: "What if my order is delayed?", a: "Track your order status. If significantly delayed beyond estimated time, contact support for assistance or compensation." },
      { q: "Can I schedule orders for later?", a: "Currently we support immediate delivery only. Pre-ordering feature coming soon." },
    ],
  },
  {
    id: "payments",
    label: "Payments & Refunds",
    items: [
      { q: "What payment methods are available?", a: "We currently accept Cash on Delivery. UPI, Credit/Debit cards and digital wallets are coming soon." },
      { q: "Is my payment secure?", a: "Yes. All transactions use secure, encrypted connections. Card details are never stored on our servers." },
      { q: "When will I receive my refund?", a: "Refunds for cancellations take 3-5 business days. Quality issues are processed within 24 hours to your original payment method." },
      { q: "What's the refund policy?", a: "Full refund for cancelled orders (within time limit), missing items, or quality issues. Partial refunds for specific item issues." },
    ],
  },
  {
    id: "delivery",
    label: "Delivery & Addresses",
    items: [
      { q: "What are delivery charges?", a: "Charges are calculated at ₹5 per km from the restaurant, with a minimum of ₹20." },
      { q: "How long does delivery take?", a: "Usually 30-45 minutes from restaurant acceptance, depending on distance, traffic, and restaurant preparation time." },
      { q: "How do I add a delivery address?", a: "During checkout or go to My Account → Addresses → Add New Address → Enter details → Save." },
      { q: "Can I save multiple addresses?", a: "Yes, save home, work, and other locations. Select from saved addresses during checkout for quick ordering." },
      { q: "Can I change delivery address after ordering?", a: "Contact support immediately if order not yet dispatched. Address changes may not be possible once delivery starts." },
    ],
  },
  {
    id: "menu",
    label: "Restaurants & Menu",
    items: [
      { q: "How do I search for restaurants?", a: "Use search bar on home page to search by restaurant name, cuisine type, or dish name." },
      { q: "Why can't I see some restaurants?", a: "Restaurants shown are within delivery radius of your location. Some may be closed, busy, or temporarily unavailable." },
      { q: "Are menu prices accurate?", a: "Yes, prices shown are current. Restaurants update menus regularly. Final amount shown at checkout includes all charges." },
      { q: "Can I customize my order?", a: "Add special instructions in cart notes. Restaurants will follow if possible." },
    ],
  },
  {
    id: "cart",
    label: "Cart & Checkout",
    items: [
      { q: "How do I apply promo code?", a: "At checkout, tap 'Apply Coupon' → enter code or select from available offers → Apply. Discount will reflect in final amount." },
      { q: "Why was my promo code rejected?", a: "Check code validity, minimum order amount, applicable restaurants, and expiry date. Some codes are user-specific or one-time use." },
      { q: "Can I order from multiple restaurants?", a: "No, cart can have items from only one restaurant. Clear cart to order from a different restaurant." },
      { q: "How do I remove items from cart?", a: "Go to Cart → tap '-' button to decrease quantity or tap 'Remove' to remove item completely." },
    ],
  },
  {
    id: "support",
    label: "Issues & Support",
    items: [
      { q: "How do I report missing items?", a: "Go to order history → tap 'Report Issue' → select Missing Item → attach photos → submit. We'll process refund within 24 hours." },
      { q: "What if food quality is poor?", a: "Report issue immediately with photos. Go to Orders → Report Issue → select Quality/Taste → describe problem → submit for refund/credit." },
      { q: "How do I contact customer support?", a: "Use live chat on this Help page, email support@tomox.com, WhatsApp +1 555 775 5331, or call +91 1234567890 (9 AM - 9 PM)." },
      { q: "Can I tip delivery partner?", a: "Yes, add tip amount during checkout. 100% of tips go directly to delivery partners." },
    ],
  },
  {
    id: "privacy",
    label: "Privacy & Security",
    items: [
      { q: "How is my data protected?", a: "We use encrypted connections, secure servers, and follow industry standards. Read our Privacy Policy for details." },
      { q: "Do you share my data?", a: "We share delivery address with restaurants and delivery partners only. Marketing data is never sold to third parties." },
      { q: "What if I forgot my password?", a: "On the sign in page, tap 'Forget password?' → enter your email → use the temporary code 1111 while email OTP delivery is under maintenance → then create a new password." },
    ],
  },
  {
    id: "more_help",
    label: "More Help",
    items: [], // Handled by custom rendering
  },
];

export default function Help({ user = null }) {
  const [tawkReady, setTawkReady] = useState(false);
  const [activeCategory, setActiveCategory] = useState("account");
  const [expandedFaq, setExpandedFaq] = useState(null);

  const whatsappEnabled = (import.meta.env.VITE_WHATSAPP_ENABLED || "true") !== "false";
  const whatsappPhone = normalizePhone(import.meta.env.VITE_WHATSAPP_PHONE || DEFAULT_WHATSAPP_PHONE);
  const whatsappMessage = import.meta.env.VITE_WHATSAPP_MESSAGE || DEFAULT_WHATSAPP_MESSAGE;
  const whatsappChatUrl =
    whatsappEnabled && whatsappPhone
      ? `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(whatsappMessage)}`
      : null;

  // Initialize Tawk.to embedded chat widget
  useEffect(() => {
    let cancelled = false;
    let readinessInterval;

    const markReady = () => {
      if (cancelled) return;
      setTawkReady(true);
      applyVisitorAttributes(user);
      if (window.Tawk_API?.hideHelpCenter) window.Tawk_API.hideHelpCenter();
      if (window.Tawk_API?.showWidget) window.Tawk_API.showWidget();
    };

    const detectEmbeddedReady = () => {
      const container = document.getElementById(TAWK_EMBEDDED_ID);
      if (!container) return false;
      const hasIframe = Boolean(container.querySelector("iframe"));
      const apiLoaded = Boolean(window.Tawk_API && typeof window.Tawk_API.maximize === "function");
      if (hasIframe || apiLoaded) { markReady(); return true; }
      return false;
    };

    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    window.Tawk_API.embedded = TAWK_EMBEDDED_ID;
    window.Tawk_API.onLoad = function () { markReady(); };

    if (!detectEmbeddedReady()) {
      const existingScript = document.querySelector('script[src*="embed.tawk.to"]');
      if (!existingScript) {
        const script = document.createElement("script");
        script.async = true;
        script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
        script.charset = "UTF-8";
        script.setAttribute("crossorigin", "*");
        script.onload = () => { setTimeout(detectEmbeddedReady, 250); };
        const firstScript = document.getElementsByTagName("script")[0];
        firstScript.parentNode.insertBefore(script, firstScript);
      }
      readinessInterval = window.setInterval(() => {
        if (detectEmbeddedReady()) window.clearInterval(readinessInterval);
      }, 250);
      window.setTimeout(() => {
        if (readinessInterval) { window.clearInterval(readinessInterval); detectEmbeddedReady(); }
      }, 7000);
    }

    return () => {
      cancelled = true;
      if (readinessInterval) window.clearInterval(readinessInterval);
    };
  }, [user]);

  const currentCategory = helpCategories.find((c) => c.id === activeCategory) || helpCategories[0];

  const handleCategoryClick = (id) => {
    setActiveCategory(id);
    setExpandedFaq(null);
  };

  return (
    <div className="hc-page">
      {/* Hero Banner */}
      <div className="hc-hero">
        <div className="hc-hero-inner">
          <h1>Help &amp; Support</h1>
          <p>Let's take a step ahead and help you better.</p>
        </div>
      </div>

      {/* Main Card */}
      <div className="hc-main">
        <div className="hc-card">
          {/* Sidebar */}
          <nav className="hc-sidebar" aria-label="Help categories">
            {helpCategories.map((cat) => (
              <button
                key={cat.id}
                className={`hc-sidebar-item ${activeCategory === cat.id ? "active" : ""}`}
                onClick={() => handleCategoryClick(cat.id)}
                type="button"
              >
                {cat.label}
              </button>
            ))}
          </nav>

          {/* FAQ Content */}
          <div className="hc-content">
            <h2 className="hc-content-title">{currentCategory.label}</h2>
            
            {activeCategory !== "more_help" ? (
              <div className="hc-faq-list" role="list">
                {currentCategory.items.map((item, idx) => {
                  const isOpen = expandedFaq === `${activeCategory}-${idx}`;
                  return (
                    <div
                      key={idx}
                      className={`hc-faq-item ${isOpen ? "open" : ""}`}
                      role="listitem"
                    >
                      <button
                        className="hc-faq-question"
                        onClick={() =>
                          setExpandedFaq(isOpen ? null : `${activeCategory}-${idx}`)
                        }
                        aria-expanded={isOpen}
                        type="button"
                      >
                        <span>{item.q}</span>
                        <svg 
                          className={`hc-faq-chevron ${isOpen ? 'open' : ''}`}
                          width="16" 
                          height="16" 
                          viewBox="0 0 24 24" 
                          fill="none" 
                          stroke="currentColor" 
                          strokeWidth="1.5" 
                          strokeLinecap="round" 
                          strokeLinejoin="round"
                        >
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </button>
                      {isOpen && (
                        <div className="hc-faq-answer">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="hc-contact-options">
                <p className="hc-contact-desc">We're here to assist you. Choose a contact method below:</p>
                <div className="hc-contact-grid">
                  {whatsappChatUrl ? (
                    <a href={whatsappChatUrl} target="_blank" rel="noopener noreferrer" className="hc-chat-btn hc-chat-wa">
                      <i className="fab fa-whatsapp" />
                      WhatsApp Us
                    </a>
                  ) : null}
                  <a href="mailto:support@tomox.com" className="hc-chat-btn hc-chat-mail">
                    <i className="fas fa-envelope" />
                    Email Support
                  </a>
                </div>

                <div className="hc-chat-section">
                  <div className="hc-chat-section-header">
                    <h3>Live Chat Support</h3>
                    <p>Chat directly with our support team in real-time.</p>
                  </div>
                  <div id={TAWK_EMBEDDED_ID} className="hc-tawk-container">
                    {!tawkReady && (
                      <div className="hc-chat-loading">
                        <div className="loading-spinner" />
                        <span>Loading chat widget...</span>
                      </div>
                    )}
                  </div>
                  <div className="hc-chat-badges">
                    <div className="hc-badge">
                      <i className="fas fa-check-circle" />
                      <span>Instant responses</span>
                    </div>
                    <div className="hc-badge">
                      <i className="fas fa-clock" />
                      <span>24/7 available</span>
                    </div>
                    <div className="hc-badge">
                      <i className="fas fa-user-headset" />
                      <span>Real human agents</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
