import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/dashboard.css';
import { io } from 'socket.io-client';

const API_URL = import.meta.env.VITE_API || 'http://localhost:5000';

function Ratings() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReviewId, setSelectedReviewId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const vendorToken = localStorage.getItem('vendorToken');
  const vendorInfo = JSON.parse(localStorage.getItem('vendorInfo') || '{}');

  useEffect(() => {
    fetchReviews();
  }, []);

  useEffect(() => {
    if (!vendorToken) return;
    
    const socket = io(API_URL, {
      auth: { token: vendorToken, isVendor: true }
    });

    socket.on('new-review', (newReview) => {
      setReviews(prev => [newReview, ...prev]);
    });

    return () => socket.disconnect();
  }, [vendorToken]);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/api/reviews/vendor`, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      setReviews(res.data || []);
      if (res.data?.length > 0) {
        setSelectedReviewId(res.data[0]._id);
      }
    } catch (err) {
      console.error("Failed to fetch reviews", err);
    } finally {
      setLoading(false);
    }
  };

  const handleResolve = async (reviewId) => {
    if (!replyText.trim()) return;
    setIsSubmitting(true);
    try {
      const res = await axios.put(`${API_URL}/api/reviews/${reviewId}/resolve`, { reply: replyText }, {
        headers: { Authorization: `Bearer ${vendorToken}` }
      });
      setReviews(prev => prev.map(r => r._id === reviewId ? res.data : r));
      setReplyText("");
    } catch (err) {
      console.error("Failed to resolve review", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
    : 0;

  const selectedReview = reviews.find(r => r._id === selectedReviewId);

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', height: '100%', display: 'flex', flexDirection: 'column' }}>
      
      {/* Top Section */}
      <div style={{ marginBottom: '32px' }}>
        <h2 style={{ fontSize: '18px', margin: '0 0 16px 0' }}>Your Performance <i className="fas fa-info-circle" style={{ color: 'var(--sw-text-light)', fontSize: '12px' }}></i></h2>
        
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Trend Card */}
          <div className="sw-setting-card" style={{ flex: 1, padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
              <div>
                <div style={{ fontWeight: 'bold' }}>Average Rating</div>
                <div style={{ fontSize: '12px', color: 'var(--sw-text-light)' }}>Based on {reviews.length} reviews</div>
              </div>
              <div style={{ fontSize: '28px', fontWeight: 'bold', color: avgRating >= 4 ? 'var(--sw-green)' : '#e91e63' }}>★ {avgRating}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div>
                <div style={{ fontSize: '12px', fontWeight: 'bold' }}>Unresolved</div>
                <div style={{ fontSize: '12px', color: 'var(--sw-orange)', fontWeight: 'bold' }}>{reviews.filter(r => !r.isResolved).length} pending replies</div>
              </div>
            </div>
          </div>
          
          {/* Video Card */}
          <div className="sw-setting-card" style={{ flex: 1, background: '#f5f5f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <h3 style={{ margin: '0 0 8px 0' }}>You can now see all your reviews and order ratings!</h3>
              <p style={{ fontSize: '13px', color: 'var(--sw-text-light)', margin: 0 }}>Reply to customers to build loyalty.</p>
            </div>
            <div style={{ width: '150px', height: '100px', background: '#ccc', borderRadius: '8px', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <i className="fas fa-comments" style={{ color: '#fff', fontSize: '32px' }}></i>
            </div>
          </div>
        </div>
      </div>

      {/* Ratings Section */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '16px' }}>
        <div>
          <h2 style={{ fontSize: '18px', margin: '0 0 4px 0' }}>Your ratings <i className="fas fa-info-circle" style={{ color: 'var(--sw-text-light)', fontSize: '12px' }}></i></h2>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--sw-text-light)' }}>Respond to the customers and retain them now!</p>
        </div>
      </div>

      <div className="sw-layout-split" style={{ flex: 1, border: '1px solid var(--sw-border)', borderRadius: '8px', overflow: 'hidden', minHeight: '500px' }}>
        
        {/* Ratings List Sidebar */}
        <div className="sw-layout-sidebar" style={{ width: '350px', background: 'var(--sw-bg)', padding: '16px', overflowY: 'auto' }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>Loading reviews...</div>
          ) : reviews.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px', color: 'var(--sw-text-light)' }}>No ratings yet.</div>
          ) : (
            reviews.map(review => (
              <div 
                key={review._id}
                onClick={() => setSelectedReviewId(review._id)}
                style={{ 
                  background: 'white', 
                  borderRadius: '8px', 
                  padding: '16px', 
                  marginBottom: '16px', 
                  borderLeft: `4px solid ${review.rating >= 4 ? 'var(--sw-green)' : review.rating === 3 ? 'var(--sw-orange)' : 'var(--sw-red)'}`,
                  boxShadow: selectedReviewId === review._id ? '0 0 0 2px var(--sw-orange)' : '0 1px 3px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  opacity: review.isResolved ? 0.7 : 1
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <div style={{ background: review.rating >= 4 ? 'var(--sw-green)' : review.rating === 3 ? 'var(--sw-orange)' : 'var(--sw-red)', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
                    ★ {review.rating}
                  </div>
                  <div style={{ fontSize: '11px', color: review.isResolved ? 'var(--sw-green)' : 'var(--sw-text-light)', fontWeight: 'bold' }}>
                    {review.isResolved ? 'RESOLVED ✓' : 'UNRESOLVED ⓘ'}
                  </div>
                </div>
                <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '4px' }}>{review.customerName} <span style={{ background: '#ffefe5', color: 'var(--sw-orange)', fontSize: '10px', padding: '2px 4px', borderRadius: '2px' }}>SWIGGY</span></div>
                <div style={{ fontSize: '11px', color: 'var(--sw-text-light)', marginBottom: '8px' }}>
                  {new Date(review.createdAt).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
                </div>
                {review.comment && (
                  <div style={{ fontSize: '12px', fontStyle: 'italic', color: '#555', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    "{review.comment}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>

        {/* Rating Detail Main Area */}
        <div className="sw-layout-main" style={{ background: 'white', padding: 0, overflowY: 'auto' }}>
          {selectedReview ? (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 24px', borderBottom: '1px solid var(--sw-border)' }}>
                <div>
                  <div style={{ fontWeight: 'bold' }}>Order #{String(selectedReview.orderId).slice(-6).toUpperCase()}</div>
                  <div style={{ fontSize: '12px', color: 'var(--sw-text-light)' }}>
                    {new Date(selectedReview.createdAt).toLocaleString('en-IN')}
                  </div>
                </div>
              </div>
              
              <div style={{ padding: '24px' }}>
                <div className="sw-setting-card" style={{ marginBottom: '16px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                    <div style={{ background: selectedReview.rating >= 4 ? 'var(--sw-green)' : selectedReview.rating === 3 ? 'var(--sw-orange)' : 'var(--sw-red)', color: 'white', padding: '2px 8px', borderRadius: '4px', fontSize: '14px', fontWeight: 'bold' }}>
                      ★ {selectedReview.rating}
                    </div>
                    <div style={{ fontSize: '12px', color: selectedReview.isResolved ? 'var(--sw-green)' : 'var(--sw-text-light)', fontWeight: 'bold' }}>
                      {selectedReview.isResolved ? 'RESOLVED ✓' : 'UNRESOLVED ⓘ'}
                    </div>
                  </div>
                  
                  <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>{selectedReview.customerName}</div>
                  <div style={{ fontSize: '12px', color: 'var(--sw-text-light)', marginBottom: '16px' }}>Customer Review</div>
                  
                  {selectedReview.comment && (
                    <div style={{ background: '#f8f9fa', padding: '16px', borderRadius: '8px', fontSize: '14px', marginBottom: '16px', borderLeft: '3px solid #ddd' }}>
                      "{selectedReview.comment}"
                    </div>
                  )}
                  
                  {selectedReview.isResolved ? (
                    <div style={{ background: '#e5f3ea', padding: '16px', borderRadius: '8px', fontSize: '13px' }}>
                      <strong style={{ color: 'var(--sw-green)' }}><i className="fas fa-check-circle"></i> Replied:</strong>
                      <p style={{ margin: '8px 0 0 0' }}>{selectedReview.reply}</p>
                    </div>
                  ) : (
                    <div style={{ background: '#fff', padding: '16px', borderRadius: '8px', border: '1px solid var(--sw-border)' }}>
                      <div style={{ fontWeight: 'bold', fontSize: '14px', marginBottom: '12px' }}>Reply to Customer</div>
                      <textarea 
                        value={replyText}
                        onChange={(e) => setReplyText(e.target.value)}
                        placeholder="Thank the customer or address their concern..."
                        style={{ width: '100%', height: '80px', padding: '12px', border: '1px solid var(--sw-border)', borderRadius: '4px', resize: 'none', marginBottom: '12px' }}
                      />
                      <button 
                        className="sw-btn" 
                        style={{ width: '100%', background: 'var(--sw-green)', color: 'white' }}
                        onClick={() => handleResolve(selectedReview._id)}
                        disabled={isSubmitting || !replyText.trim()}
                      >
                        {isSubmitting ? 'Sending...' : 'Send Reply & Resolve'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--sw-text-light)' }}>
              Select a review to view details
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Ratings;
