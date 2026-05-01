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

  const attributes = {
    source: "website",
  };

  if (user?.name) attributes.name = user.name;
  if (user?.email) attributes.email = user.email;
  if (user?.phone) attributes.phone = user.phone;

  api.setAttributes(attributes, () => {});
}

export default function Help({ user = null }) {
  const [tawkReady, setTawkReady] = useState(false);
  const [expandedGuide, setExpandedGuide] = useState(1);
  const [expandedFaq, setExpandedFaq] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
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

      if (hasIframe || apiLoaded) {
        markReady();
        return true;
      }

      return false;
    };

    // Set up Tawk API for embedded chat
    window.Tawk_API = window.Tawk_API || {};
    window.Tawk_LoadStart = new Date();
    window.Tawk_API.embedded = TAWK_EMBEDDED_ID;

    // Configure widget behavior
    window.Tawk_API.onLoad = function() {
      markReady();
    };

    if (!detectEmbeddedReady()) {
      // Check if Tawk script already exists
      const existingScript = document.querySelector('script[src*="embed.tawk.to"]');

      if (!existingScript) {
        // Load Tawk.to script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}/${TAWK_WIDGET_ID}`;
        script.charset = 'UTF-8';
        script.setAttribute('crossorigin', '*');
        script.onload = () => {
          // onLoad callback may not always fire in remount cases, so trigger detect too.
          setTimeout(detectEmbeddedReady, 250);
        };

        const firstScript = document.getElementsByTagName('script')[0];
        firstScript.parentNode.insertBefore(script, firstScript);
      }

      // Poll briefly to handle StrictMode/remount where script exists but callback won't re-fire.
      readinessInterval = window.setInterval(() => {
        if (detectEmbeddedReady()) {
          window.clearInterval(readinessInterval);
        }
      }, 250);

      window.setTimeout(() => {
        if (readinessInterval) {
          window.clearInterval(readinessInterval);
          detectEmbeddedReady();
        }
      }, 7000);
    }

    return () => {
      cancelled = true;
      if (readinessInterval) window.clearInterval(readinessInterval);
    };
  }, [user]);

  const guides = [
    {
      id: 1,
      title: "Getting Started",
      description: "Learn the basics of ordering",
      steps: [
        "Create your account with email and phone",
        "Add your delivery location for quick access",
        "Browse restaurants and cuisines near you",
        "Add items to cart and review order",
        "Choose payment method and track delivery in real-time"
      ]
    },
    {
      id: 2,
      title: "Managing Profile",
      description: "Control your account settings",
      steps: [
        "Update personal information anytime",
        "Save multiple delivery addresses",
        "Change password and security settings",
        "Manage payment methods and cards",
        "View order history and favorites"
      ]
    },
    {
      id: 3,
      title: "Payment Methods",
      description: "Payment options and security",
      steps: [
        "Credit/Debit cards with 256-bit encryption",
        "UPI for instant bank transfers",
        "Digital wallets (Google Pay, Apple Pay)",
        "Amazon Pay and other modern options",
        "Save cards for faster checkout"
      ]
    },
    {
      id: 4,
      title: "Orders & Delivery",
      description: "Track and manage your orders",
      steps: [
        "Track orders in real-time with live map",
        "Modify items before restaurant accepts",
        "Cancel orders within time limit",
        "Report issues and missing items",
        "Rate and review orders"
      ]
    },
    {
      id: 5,
      title: "Account & Privacy",
      description: "Manage your account and data",
      steps: [
        "Update your profile information",
        "Change password and email",
        "Manage privacy settings",
        "Delete your account if needed",
        "Export your data"
      ]
    },
    {
      id: 6,
      title: "Cart & Checkout",
      description: "Complete your order smoothly",
      steps: [
        "Add items from restaurant menu",
        "Apply promo codes and offers",
        "Review cart and delivery charges",
        "Select payment method",
        "Place order and track delivery"
      ]
    }
  ];

  const faqCategories = [
    {
      name: "Account Management",
      items: [
        { q: "How do I create an account?", a: "Click on the profile icon, select 'Sign Up', and enter your email, phone number, and password. Verify your phone number with the OTP sent." },
        { q: "How do I change my password?", a: "Go to My Account → Password → Enter current password and new password → Save changes." },
        { q: "How do I update my profile information?", a: "Go to My Account → Personal Info → Edit your name, email, or phone → Save changes." },
        { q: "How do I delete my account?", a: "Go to My Account → scroll to bottom → tap 'Delete Account' → confirm deletion. Note: This action is permanent and will delete all your order history and saved data." },
        { q: "Can I have multiple accounts?", a: "Each phone number and email can only be linked to one account as per our policy." },
        { q: "How do I logout?", a: "Go to My Account → scroll down → tap 'Logout' button." }
      ]
    },
    {
      name: "Orders & Tracking",
      items: [
        { q: "How do I track my order?", a: "Go to Orders page to see real-time updates. Track restaurant preparation, delivery partner location, and estimated arrival time with live map." },
        { q: "Can I modify my order?", a: "Yes, within 2 minutes of placing. Once restaurant accepts, you'll need to cancel and place a new order." },
        { q: "Can I cancel my order?", a: "Orders can be cancelled within 2 minutes of placing. After that, contact support. Some charges may apply per restaurant policy." },
        { q: "How do I reorder previous orders?", a: "Go to Orders → select past order → tap 'Reorder' button. Items will be added to your cart automatically." },
        { q: "What if my order is delayed?", a: "Track your order status. If significantly delayed beyond estimated time, contact support for assistance or compensation." },
        { q: "Can I schedule orders for later?", a: "Currently we support immediate delivery only. Pre-ordering feature coming soon." }
      ]
    },
    {
      name: "Payments & Refunds",
      items: [
        { q: "What payment methods are available?", a: "We accept Credit/Debit cards, UPI, Google Pay, Apple Pay, Amazon Pay, and digital wallets with secure 256-bit encryption." },
        { q: "Is my payment secure?", a: "Yes. All payments use PCI DSS compliant 256-bit SSL encryption. Card details are never stored completely on our servers." },
        { q: "Why was my payment declined?", a: "Check card balance, expiry date, 3D Secure settings, or daily transaction limits. Try another payment method or contact your bank." },
        { q: "How do I add or remove payment methods?", a: "Go to My Account → Payment Methods → Add/Remove cards. You can save multiple cards for faster checkout." },
        { q: "When will I receive my refund?", a: "Refunds for cancellations take 3-5 business days. Quality issues are processed within 24 hours to your original payment method." },
        { q: "What's the refund policy?", a: "Full refund for cancelled orders (within time limit), missing items, or quality issues. Partial refunds for specific item issues." },
        { q: "Can I get cash refund?", a: "Refunds are processed to your original payment method only. If paid by card/UPI, refund will return there." }
      ]
    },
    {
      name: "Delivery & Addresses",
      items: [
        { q: "What are delivery charges?", a: "Charges vary by distance from restaurant. See exact amount before checkout. Free delivery on orders above ₹200 in select areas." },
        { q: "How long does delivery take?", a: "Usually 30-45 minutes from restaurant acceptance, depending on distance, traffic, and restaurant preparation time." },
        { q: "What if food arrives late?", a: "Contact support immediately through chat or phone. We offer refunds or credits for significantly delayed orders." },
        { q: "How do I add delivery address?", a: "During checkout or go to My Account → Addresses → Add New Address → Enter details → Save." },
        { q: "Can I save multiple addresses?", a: "Yes, save home, work, and other locations. Select from saved addresses during checkout for quick ordering." },
        { q: "Can I change delivery address after ordering?", a: "Contact support immediately if order not yet dispatched. Address changes may not be possible once delivery starts." },
        { q: "What's the delivery radius?", a: "We deliver within 10km radius from restaurants. Availability shown when you search restaurants by location." }
      ]
    },
    {
      name: "Restaurants & Menu",
      items: [
        { q: "How do I search for restaurants?", a: "Use search bar on home page to search by restaurant name, cuisine type, or dish name. Filter by ratings, delivery time, or offers." },
        { q: "Why can't I see some restaurants?", a: "Restaurants shown are within delivery radius of your location. Some may be closed, busy, or temporarily unavailable." },
        { q: "How do I save favorite restaurants?", a: "Tap heart icon on restaurant card. Access favorites from home page quick links." },
        { q: "Are menu prices accurate?", a: "Yes, prices shown are current. Restaurants update menus regularly. Final amount shown at checkout includes all charges." },
        { q: "Can I customize my order?", a: "Yes, add special instructions in item customization or cart notes. Restaurants will follow if possible." },
        { q: "What if menu item is unavailable?", a: "Restaurant will call you or cancel that item. You'll be refunded for unavailable items only." }
      ]
    },
    {
      name: "Cart & Checkout",
      items: [
        { q: "How do I apply promo code?", a: "At checkout, tap 'Apply Coupon' → enter code or select from available offers → Apply. Discount will reflect in final amount." },
        { q: "Why was my promo code rejected?", a: "Check code validity, minimum order amount, applicable restaurants, and expiry date. Some codes are user-specific or one-time use." },
        { q: "Can I order from multiple restaurants?", a: "No, cart can have items from only one restaurant. Clear cart to order from a different restaurant." },
        { q: "How do I remove items from cart?", a: "Go to Cart → tap '-' button to decrease quantity or swipe left to remove item completely." },
        { q: "What are packaging charges?", a: "Small fee charged by restaurants for food packaging materials. Amount varies by restaurant and order size." }
      ]
    },
    {
      name: "Issues & Support",
      items: [
        { q: "How do I report missing items?", a: "Go to order history → tap 'Report Issue' → select Missing Item → attach photos → submit. We'll process refund within 24 hours." },
        { q: "What if food quality is poor?", a: "Report issue immediately with photos. Go to Orders → Report Issue → select Quality/Taste → describe problem → submit for refund/credit." },
        { q: "How do I contact customer support?", a: "Use live chat on Help page, email support@tomox.com, WhatsApp +1 555 775 5331, or call +91 1234567890 (9 AM - 9 PM)." },
        { q: "How do I rate my order?", a: "After delivery, go to Orders → select completed order → Rate food quality, delivery, and packaging. Add review if you want." },
        { q: "Can I tip delivery partner?", a: "Yes, add tip amount during checkout or after delivery. 100% of tips go directly to delivery partners." },
        { q: "What if I have allergies?", a: "Mention allergies in order notes. Contact restaurant directly if unsure. We recommend calling restaurant before ordering." }
      ]
    },
    {
      name: "Privacy & Security",
      items: [
        { q: "How is my data protected?", a: "We use 256-bit encryption, secure servers, and follow industry standards. Read our Privacy Policy for details." },
        { q: "Do you share my data?", a: "We share delivery address with restaurants and delivery partners only. Marketing data is never sold to third parties." },
        { q: "How do I enable/disable notifications?", a: "Go to My Account → Settings → Notifications → toggle order updates, offers, or promotional notifications." },
        { q: "Can I export my data?", a: "Yes, contact support to request data export. We'll email you a copy of your account data within 7 days." },
        { q: "What if I forgot my password?", a: "On login page, tap 'Forgot Password' → enter email → check email for reset link → create new password." }
      ]
    }
  ];

  const filteredGuides = guides.filter(g =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredFaqs = faqCategories.map(cat => ({
    ...cat,
    items: cat.items.filter(item =>
      item.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.a.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(cat => cat.items.length > 0);

  return (
    <div className="help-container">
      {/* Header */}
      <div className="help-header">
        <div className="help-header-content">
          <p className="help-kicker">Need Assistance?</p>
          <h1>Help Center</h1>
          <p className="help-description">Find answers and get support for your orders</p>
        </div>
        
        <div className="help-search-bar">
          <input
            type="text"
            placeholder="Search guides, FAQs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="help-search-input"
          />
        </div>
      </div>

      <div className="help-shell">
        {/* Guides Section */}
        <section className="help-section guides-section">
          <div className="section-intro">
            <h2>Step-by-Step Guides</h2>
            <p>Learn how to use TomoX</p>
          </div>

          <div className="guides-grid">
            {filteredGuides.map((guide) => (
              <div
                key={guide.id}
                className={`guide-tile ${expandedGuide === guide.id ? "expanded" : ""}`}
              >
                <button
                  onClick={() => setExpandedGuide(expandedGuide === guide.id ? null : guide.id)}
                  className="guide-tile-header"
                >
                  <div className="guide-title-block">
                    <h3>{guide.title}</h3>
                    <p>{guide.description}</p>
                  </div>
                  <span className={`toggle-arrow ${expandedGuide === guide.id ? "active" : ""}`}>›</span>
                </button>

                {expandedGuide === guide.id && (
                  <div className="guide-content">
                    <ol className="guide-steps">
                      {guide.steps.map((step, idx) => (
                        <li key={idx}>{step}</li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* FAQs Section */}
        <section className="help-section faq-section">
          <div className="section-intro">
            <h2>Frequently Asked Questions</h2>
            <p>Quick answers to common questions</p>
          </div>

          <div className="faq-container">
            {filteredFaqs.map((category) => (
              <div key={category.name} className="faq-category">
                <h3 className="faq-category-title">{category.name}</h3>
                <div className="faq-list">
                  {category.items.map((item) => (
                    <div key={item.q} className="faq-item">
                      <button
                        onClick={() => setExpandedFaq(expandedFaq === item.q ? null : item.q)}
                        className="faq-question-btn"
                      >
                        <span className="faq-q">{item.q}</span>
                        <span className={`faq-chevron ${expandedFaq === item.q ? "open" : ""}`}>›</span>
                      </button>
                      {expandedFaq === item.q && (
                        <div className="faq-answer-content">{item.a}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Support Section */}
        <section className="help-section support-section">
          <div className="support-hero">
            <div className="support-hero-left">
              <h2>Need More Help?</h2>
              <p>Contact our support team directly</p>
            </div>
            <div className="support-stats">
              <div className="stat-item">
                <strong>98%</strong>
                <small>Customer satisfaction</small>
              </div>
              <div className="stat-item">
                <strong>2 hrs</strong>
                <small>Avg response time</small>
              </div>
              <div className="stat-item">
                <strong>24/7</strong>
                <small>Available</small>
              </div>
            </div>
          </div>

          {/* Support Methods */}
          <div className="support-methods">
            <a
              className="support-method support-method-link"
              href="mailto:support@tomox.com?cc=tomoxsp@gmail.com"
              aria-label="Send support email with cc to tomoxsp@gmail.com"
            >
              <h4>Email</h4>
              <span className="contact-info">support@tomox.com</span>
              <small>Response: 2 hours</small>
            </a>
            {whatsappChatUrl ? (
              <a
                className="support-method support-method-link"
                href={whatsappChatUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Open WhatsApp chat support"
              >
                <h4>WhatsApp</h4>
                <span className="contact-info">+1 555 775 5331</span>
                <small>Response: 30 minutes</small>
              </a>
            ) : (
              <div className="support-method">
                <h4>WhatsApp</h4>
                <p className="contact-info">+1 555 775 5331</p>
                <small>Response: 30 minutes</small>
              </div>
            )}
            <div className="support-method">
              <h4>Phone</h4>
              <p className="contact-info">+91 1234567890</p>
              <small>9 AM - 9 PM</small>
            </div>
          </div>

          {/* Live Chat Embedded */}
          <div className="support-form-box">
            <h3>Live Chat Support</h3>
            <p>Chat directly with our support team. We're here to help!</p>
            
            {/* Tawk.to Embedded Chat Container */}
            <div id={TAWK_EMBEDDED_ID} className="tawk-embedded-container">
              {!tawkReady && (
                <div className="chat-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading chat...</p>
                </div>
              )}
            </div>
            
            <div className="chat-features">
              <div className="feature-item">
                <span><i className="fas fa-check-circle" style={{ color: '#28a745' }}></i></span>
                <span>Instant responses</span>
              </div>
              <div className="feature-item">
                <span><i className="fas fa-check-circle" style={{ color: '#28a745' }}></i></span>
                <span>24/7 support</span>
              </div>
              <div className="feature-item">
                <span><i className="fas fa-check-circle" style={{ color: '#28a745' }}></i></span>
                <span>Real human agents</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
