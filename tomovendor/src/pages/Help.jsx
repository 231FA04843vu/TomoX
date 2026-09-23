import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const API_URL = import.meta.env.VITE_API || 'http://localhost:5000';

function Help() {
  const navigate = useNavigate();
  const [activeTopic, setActiveTopic] = useState(null);
  const [showForm, setShowForm] = useState(false);
  
  const [formData, setFormData] = useState({
    message: '',
    phone: ''
  });
  
  const vendorInfo = JSON.parse(localStorage.getItem('vendorInfo') || '{}');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const topics = [
    { 
      id: 'order_delivery', 
      title: 'Order and Delivery', 
      desc: 'Live orders, delivery methods, accepting and preparing orders.', 
      icon: <i className="fas fa-shopping-bag" style={{ color: 'var(--sw-orange)' }}></i>,
      faqs: [
        { q: 'How do I accept a live order?', a: 'Go to your Dashboard, click on Live Orders, and press the Accept button.' },
        { q: 'What happens if a delivery executive is delayed?', a: 'You can mark the food as ready and our system will automatically re-assign if needed.' }
      ]
    },
    { 
      id: 'invoices_payments', 
      title: 'Invoices, refunds, payments and taxes', 
      desc: 'Learn more about invoices, taxes and how you will receive payments', 
      icon: <i className="fas fa-file-invoice-dollar" style={{ color: 'var(--sw-orange)' }}></i>,
      faqs: [
        { q: 'When do I get my payouts?', a: 'Payouts are processed weekly on Wednesdays for the previous Monday-Sunday cycle.' },
        { q: 'Where can I find my GST invoices?', a: 'Go to the Finance section and click on Download Invoices for the respective month.' }
      ]
    },
    { 
      id: 'growth', 
      title: 'Grow your business', 
      desc: 'Improve ratings, Run Discounts/Ads & use SmartLinks', 
      icon: <i className="fas fa-chart-line" style={{ color: 'var(--sw-orange)' }}></i>,
      faqs: [
        { q: 'How do I create a discount?', a: 'Go to the Discounts section and select a Quick Setup template to create an offer.' },
        { q: 'What are Ads?', a: 'Ads help boost your restaurant visibility on the top of user searches.' }
      ]
    },
    { 
      id: 'menu', 
      title: 'Manage your Menu', 
      desc: 'Managing menu, categories, items and packaging', 
      icon: <i className="fas fa-utensils" style={{ color: 'var(--sw-orange)' }}></i>,
      faqs: [
        { q: 'How to mark an item out of stock?', a: 'Go to Manage Menu and toggle the switch next to the item.' },
        { q: 'Can I add a new category?', a: 'Yes, in Manage Menu, click Add Category.' }
      ]
    },
    { 
      id: 'outlet', 
      title: 'Manage your outlet', 
      desc: 'Keep your restaurant up to date with everything ON during operating hours.', 
      icon: <i className="fas fa-store" style={{ color: 'var(--sw-orange)' }}></i>,
      faqs: [
        { q: 'How do I change my operating hours?', a: 'Go to Restaurant Info and update your operational timings.' }
      ]
    },
  ];

  const handleTopicClick = (topic) => {
    setActiveTopic(topic);
    setShowForm(false);
  };

  const handleBack = () => {
    if (showForm) {
      setShowForm(false);
    } else {
      setActiveTopic(null);
    }
  };

  const handleSubmitTicket = async (e) => {
    e.preventDefault();
    if (!formData.message) {
      alert("Please enter your message/issue.");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem('vendorToken');
      await axios.post(`${API_URL}/api/support/vendor`, {
        name: vendorInfo.ownerName || vendorInfo.name || "Vendor",
        email: vendorInfo.email || "vendor@example.com",
        phone: formData.phone || vendorInfo.phone || "",
        issueType: activeTopic ? activeTopic.title : "General",
        message: formData.message
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      alert("Ticket submitted successfully. Our Customer Care team will reach out to you shortly.");
      setFormData({ message: '', phone: '' });
      handleBack(); // Go back to FAQ or list
      navigate('/tickets'); // Redirect to tickets to view the ticket
    } catch (err) {
      console.error(err);
      alert("Failed to submit ticket. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (activeTopic) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <button onClick={handleBack} style={{ background: 'none', border: 'none', color: 'var(--sw-orange)', cursor: 'pointer', fontSize: '14px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <i className="fas fa-arrow-left"></i> Back to Help Topics
        </button>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '32px' }}>
          <div style={{ fontSize: '28px', background: '#fcf8e3', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>{activeTopic.icon}</div>
          <h1 style={{ fontSize: '24px', margin: 0 }}>{activeTopic.title}</h1>
        </div>

        {showForm ? (
          <div className="sw-setting-card" style={{ padding: '32px' }}>
            <h2 style={{ margin: '0 0 24px 0', fontSize: '20px' }}>Raise a Ticket</h2>
            <form onSubmit={handleSubmitTicket} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Restaurant Name</label>
                <input type="text" value={vendorInfo.name || ''} disabled style={{ width: '100%', padding: '12px', border: '1px solid var(--sw-border)', borderRadius: '4px', background: '#f5f5f6' }} />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Contact Number (Optional)</label>
                <input 
                  type="text" 
                  placeholder={vendorInfo.phone || "Enter mobile number"}
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--sw-border)', borderRadius: '4px' }} 
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>Describe your issue</label>
                <textarea 
                  rows="5" 
                  placeholder="Please provide details about your issue..."
                  value={formData.message}
                  onChange={(e) => setFormData({...formData, message: e.target.value})}
                  style={{ width: '100%', padding: '12px', border: '1px solid var(--sw-border)', borderRadius: '4px', resize: 'vertical' }}
                  required
                ></textarea>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '16px', marginTop: '16px' }}>
                <button type="button" onClick={() => setShowForm(false)} className="sw-btn" style={{ background: '#f5f5f6', color: 'var(--sw-text-dark)', border: '1px solid var(--sw-border)' }}>Cancel</button>
                <button type="submit" className="sw-btn" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Ticket'}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <>
            <div style={{ marginBottom: '40px' }}>
              <h2 style={{ fontSize: '18px', marginBottom: '24px' }}>Frequently Asked Questions</h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activeTopic.faqs.map((faq, idx) => (
                  <div key={idx} style={{ background: 'white', border: '1px solid var(--sw-border)', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ margin: '0 0 12px 0', fontSize: '15px' }}>{faq.q}</h3>
                    <p style={{ margin: 0, fontSize: '14px', color: 'var(--sw-text-light)', lineHeight: '1.5' }}>{faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ background: 'white', border: '1px solid var(--sw-border)', borderRadius: '8px', padding: '32px', textAlign: 'center' }}>
              <h3 style={{ margin: '0 0 16px 0', fontSize: '18px' }}>Didn't find what you were looking for?</h3>
              <p style={{ color: 'var(--sw-text-light)', marginBottom: '24px' }}>Our Customer Care team is here to help you resolve your issue.</p>
              <button onClick={() => setShowForm(true)} className="sw-btn sw-btn-dark" style={{ padding: '12px 32px' }}>
                Need more help? Raise a ticket
              </button>
            </div>
          </>
        )}
      </div>
    );
  }

  return (
    <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', margin: 0 }}>Please Select What You Need Help With</h1>
        <button onClick={() => navigate('/tickets')} className="sw-btn" style={{ background: '#f5f5f6', color: 'var(--sw-orange)', border: '1px solid var(--sw-orange)' }}>View Tickets</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {topics.map(topic => (
          <div key={topic.id} onClick={() => handleTopicClick(topic)} className="sw-setting-card" style={{ display: 'flex', alignItems: 'center', gap: '24px', cursor: 'pointer', padding: '24px', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
            <div style={{ fontSize: '28px', background: '#fcf8e3', width: '64px', height: '64px', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '12px' }}>
              {topic.icon}
            </div>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '16px' }}>{topic.title}</h3>
              <p style={{ margin: 0, fontSize: '13px', color: 'var(--sw-text-light)' }}>{topic.desc}</p>
            </div>
            <div style={{ color: 'var(--sw-text-light)', fontSize: '20px' }}>›</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Help;
