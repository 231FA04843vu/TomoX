import React, { useEffect, useState, memo, useCallback, useMemo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PageLoader from './PageLoader';
import { normalizeAssetUrl } from '../utils/url';
import '../styles/pageLoader.css';

const API_VENDOR = import.meta.env.VITE_API_VENDOR;
const API_COMPANY = import.meta.env.VITE_API_COMPANY;

const getDeterministicHash = (str = "") => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
};

const normalizeRestaurant = (restaurant) => ({
  ...restaurant,
  logo: normalizeAssetUrl(restaurant?.logo),
  menu: Array.isArray(restaurant?.menu)
    ? restaurant.menu.map((item) => ({
      ...item,
      image: normalizeAssetUrl(item?.image),
    }))
    : restaurant?.menu,
});

const VegIcon = ({ size = 20, color = "#0f8a65" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="6" stroke={color} strokeWidth="2.5"/>
    <circle cx="12" cy="12" r="5" fill={color}/>
  </svg>
);

const NonVegIcon = ({ size = 20, color = "#e43b4f" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="2" y="2" width="20" height="20" rx="6" stroke={color} strokeWidth="2.5"/>
    <path d="M12 7.5L17.5 16H6.5L12 7.5Z" fill={color}/>
  </svg>
);

const BadgeIcon = ({ type }) => {
  let gradient, text1, text2;
  
  if (type === 'mega') {
    // Purple SAVE X 2
    gradient = ['#8264e6', '#4a3e9c'];
    text1 = 'SAVE';
    text2 = 'X 2';
  } else if (type === 'hot') {
    // Red-orange DEAL OF DAY
    gradient = ['#ff7b7b', '#ff5252'];
    text1 = 'DEAL';
    text2 = 'OF DAY';
  } else {
    // Orange %
    gradient = ['#ff9a55', '#ff7222'];
    text1 = '%';
    text2 = '';
  }

  return (
    <svg width="48" height="48" viewBox="0 0 24 24" style={{ filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.15))' }}>
      <defs>
        <linearGradient id={`grad-${type}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={gradient[0]} />
          <stop offset="100%" stopColor={gradient[1]} />
        </linearGradient>
      </defs>
      <path 
        d="M23,12L20.56,9.22L20.9,5.54L17.29,4.72L15.4,1.54L12,3L8.6,1.54L6.71,4.72L3.1,5.53L3.44,9.21L1,12L3.44,14.78L3.1,18.47L6.71,19.29L8.6,22.47L12,21L15.4,22.46L17.29,19.28L20.9,18.46L20.56,14.78L23,12Z" 
        fill={`url(#grad-${type})`} 
      />
      {text2 ? (
        <>
          <text x="12" y="10.5" fill="white" fontSize="3.8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.2">{text1}</text>
          <text x="12" y="15.5" fill="white" fontSize="3.8" fontWeight="900" fontFamily="sans-serif" textAnchor="middle" letterSpacing="0.2">{text2}</text>
        </>
      ) : (
        <text x="12" y="14.5" fill="white" fontSize="11" fontWeight="900" fontFamily="sans-serif" textAnchor="middle">{text1}</text>
      )}
    </svg>
  );
};

const RestaurantMenu = memo(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, dispatch } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [coupons, setCoupons] = useState([]);
  const dealsCarouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [isVegOn, setIsVegOn] = useState(false);
  const [isNonVegOn, setIsNonVegOn] = useState(false);
  const [isBestsellerOn, setIsBestsellerOn] = useState(false);
  const [showVegDropdown, setShowVegDropdown] = useState(false);
  const [vegMode, setVegMode] = useState('pure');

  // Close veg dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = () => setShowVegDropdown(false);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleScroll = () => {
    if (dealsCarouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = dealsCarouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
    }
  };

  const scrollDeals = (direction) => {
    if (dealsCarouselRef.current) {
      const scrollAmount = 316; // width (300) + gap (16)
      dealsCarouselRef.current.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    fetch(`${API_COMPANY}/api/coupons/active`)
      .then(async (response) => {
        if (response.ok) {
          const data = await response.json();
          setCoupons(data);
          // Check scroll right after load
          setTimeout(handleScroll, 100);
        }
      })
      .catch(err => console.error("Error fetching coupons:", err));
  }, []);

  useEffect(() => {
    fetch(`${API_VENDOR}/api/restaurants/${id}`)
      .then((res) => res.json())
      .then((data) => {
        const normalizedRestaurant = normalizeRestaurant(data);
        setRestaurant(normalizedRestaurant);
        if (normalizedRestaurant.menu && normalizedRestaurant.menu.length > 0) {
          setSelectedCategory('all');
        }
      })
      .catch((err) => console.error("Error fetching restaurant:", err));
  }, [id]);

  const cartItems = useMemo(() => cart?.items || [], [cart?.items]);
  const addedItems = useMemo(() => {
    const added = new Set();
    cartItems.forEach((item) => {
      added.add(item.itemId || item._id || item.id);
    });
    return added;
  }, [cartItems]);

  const handleAddToCart = useCallback((item) => {
    const token = localStorage.getItem('token');
    if (!token) {
      window.dispatchEvent(new CustomEvent("tomo:open-auth"));
      return;
    }

    const itemId = item?._id || item?.id;
    dispatch({
      type: 'ADD_ITEM',
      payload: {
        ...item,
        itemId,
        vendorId: restaurant?.vendorId,
        restaurantId: restaurant?._id,
        restaurantName: restaurant?.name,
      },
    });
  }, [dispatch, restaurant, navigate, id]);

  const isItemAdded = useCallback((item) => {
    const itemId = item?._id || item?.id;
    return addedItems.has(itemId);
  }, [addedItems]);

  const menu = restaurant?.menu || [];

  // Group items by category if available - memoized for performance
  const categories = useMemo(() => {
    const cats = new Set();
    menu.forEach(item => {
      if (item.category) cats.add(item.category);
    });
    return cats;
  }, [menu]);

  const filteredMenu = useMemo(() => {
    if (menu.length === 0) return [];
    return selectedCategory === 'all'
      ? menu
      : menu.filter(item => item.category === selectedCategory);
  }, [menu, selectedCategory]);

  const totalCartQuantity = useMemo(() =>
    cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0),
    [cartItems]
  );

  if (!restaurant) return <PageLoader />;

  return (
    <div className="sw-menu-page">
      {/* Breadcrumbs */}
      <div className="sw-breadcrumbs" style={{ fontSize: '11px', color: '#93959f', marginBottom: '16px', letterSpacing: '0.3px', display: 'flex', alignItems: 'center' }}>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', textTransform: 'uppercase', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fc8019'} onMouseLeave={e => e.target.style.color = '#93959f'}>
          HOME
        </span>
        <span style={{ margin: '0 8px' }}>/</span>
        <span onClick={() => navigate('/')} style={{ cursor: 'pointer', textTransform: 'uppercase', transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = '#fc8019'} onMouseLeave={e => e.target.style.color = '#93959f'}>
          {restaurant.location || "LOCATION"}
        </span>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#282c3f', fontWeight: '600', textTransform: 'uppercase' }}>
          {restaurant.name}
        </span>
      </div>

      <h1 className="sw-restaurant-title">{restaurant.name}</h1>

      {/* Hero Image */}
      <div className="sw-hero-image-container">
        <img
          src={restaurant.logo || "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=800&q=80"}
          alt={restaurant.name}
        />
      </div>

      {/* Meta Box */}
      <div className="sw-meta-box">
        <div className="sw-meta-rating">
          <i className="fas fa-star"></i>
          {restaurant.rating || 4.5} ({100 + (getDeterministicHash(restaurant._id || "") % 900)} ratings) &bull; ₹{150 + (getDeterministicHash(restaurant._id || "") % 300)} for two
        </div>
        <div className="sw-meta-cuisine">
          {restaurant.cuisine ? (Array.isArray(restaurant.cuisine) ? restaurant.cuisine.join(", ") : restaurant.cuisine) : "Biryani, South Indian"}
        </div>

        <div className="sw-timeline-box">
          <div className="sw-timeline-row active">
            <span className="sw-timeline-label">Outlet</span>
            <span className="sw-timeline-value">{restaurant.location || "Tenali"}</span>
          </div>
          <div className="sw-timeline-row">
            <span className="sw-timeline-label">35-40 mins</span>
          </div>
        </div>
      </div>

      {/* Deals Section */}
      {coupons.length > 0 && (
        <>
          <div className="sw-deals-header">
            <span>Deals for you</span>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => scrollDeals('left')} style={{ border: 'none', background: canScrollLeft ? '#e9e9eb' : '#f1f1f6', borderRadius: '50%', width: '32px', height: '32px', cursor: canScrollLeft ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                <i className="fas fa-arrow-left" style={{ color: canScrollLeft ? '#282c3f' : '#b9b9b9' }}></i>
              </button>
              <button onClick={() => scrollDeals('right')} style={{ border: 'none', background: canScrollRight ? '#e9e9eb' : '#f1f1f6', borderRadius: '50%', width: '32px', height: '32px', cursor: canScrollRight ? 'pointer' : 'default', transition: 'all 0.2s' }}>
                <i className="fas fa-arrow-right" style={{ color: canScrollRight ? '#282c3f' : '#b9b9b9' }}></i>
              </button>
            </div>
          </div>

          <div ref={dealsCarouselRef} onScroll={handleScroll} className="sw-deals-carousel" style={{ display: 'flex', overflowX: 'auto', gap: '16px', paddingBottom: '16px', scrollBehavior: 'smooth', scrollbarWidth: 'none' }}>
            {coupons.map((coupon) => (
              <div key={coupon._id || coupon.code} className="sw-deal-card" onClick={() => setSelectedCoupon(coupon)} style={{ display: 'flex', alignItems: 'center', padding: '12px 16px', border: '1px solid #e9e9eb', borderRadius: '16px', minWidth: '300px', gap: '16px', background: '#fff', boxShadow: '0 2px 12px rgba(0,0,0,0.03)', cursor: 'pointer' }}>
                <BadgeIcon type={coupon.couponType || 'standard'} />
                <div className="sw-deal-text" style={{ display: 'flex', flexDirection: 'column', gap: '6px', overflow: 'hidden' }}>
                  <h4 style={{ fontSize: '17px', fontWeight: '800', color: '#282c3f', margin: 0, letterSpacing: '-0.3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {coupon.discountType === 'percentage' ? `${coupon.discountValue}% Off Upto ₹${coupon.maxDiscountAmount || 100}` : `Extra ₹${coupon.discountValue} Off`}
                  </h4>
                  <p style={{ fontSize: '11.5px', color: '#7e808c', margin: 0, fontWeight: '700', textTransform: 'uppercase', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', letterSpacing: '0.3px' }}>
                    USE {coupon.code} | ABOVE ₹{coupon.minOrderAmount}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Search & Filters */}
      <div className="sw-menu-search">
        Search for dishes <i className="fas fa-search" style={{ marginLeft: 'auto' }}></i>
      </div>

      <div className="sw-filters" style={{ display: 'flex', gap: '12px', padding: '16px 0', borderBottom: '1px solid #f1f1f6' }}>
        
        {/* Veg Toggle */}
        <div style={{ position: 'relative' }}>
          <div 
            onClick={(e) => {
              e.stopPropagation();
              if (isVegOn) {
                setShowVegDropdown(!showVegDropdown);
              } else {
                setIsVegOn(true);
                setIsNonVegOn(false);
              }
            }}
            style={{ 
              display: 'flex', border: '1px solid #e9e9eb', borderRadius: '30px', padding: '6px 8px', alignItems: 'center', gap: '8px', cursor: 'pointer', 
              boxShadow: '0 2px 4px rgba(0,0,0,0.02)' 
            }}
          >
            <div 
              onClick={(e) => {
                if (isVegOn) {
                  e.stopPropagation();
                  setIsVegOn(false);
                  setShowVegDropdown(false);
                }
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              {isVegOn ? (
                <>
                  <div style={{ width: '18px', height: '12px', background: '#0f8a65', borderRadius: '6px' }}></div>
                  <VegIcon color="#0f8a65" size={22} />
                </>
              ) : (
                <>
                  <VegIcon color="#0f8a65" size={22} />
                  <div style={{ width: '18px', height: '12px', background: '#f1f1f6', borderRadius: '6px' }}></div>
                </>
              )}
            </div>
            
            {isVegOn && (
              <>
                <div style={{ width: '1px', height: '14px', background: '#e9e9eb' }}></div>
                <div>
                  <i className="fas fa-chevron-down" style={{ color: '#7e808c', fontSize: '12px', paddingRight: '4px' }}></i>
                </div>
              </>
            )}
          </div>
          
          {/* Veg Dropdown */}
          {showVegDropdown && (
            <div 
              onClick={(e) => e.stopPropagation()}
              style={{ position: 'absolute', top: '100%', left: 0, marginTop: '8px', background: '#fff', borderRadius: '16px', border: '1px solid #e9e9eb', padding: '16px', boxShadow: '0 8px 24px rgba(0,0,0,0.1)', zIndex: 10, width: 'max-content' }}
            >
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '48px', cursor: 'pointer', marginBottom: '16px' }}>
                <span style={{ fontSize: '15px', fontWeight: vegMode === 'pure' ? '700' : '600', color: vegMode === 'pure' ? '#3d4152' : '#7e808c' }}>Pure Veg</span>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${vegMode === 'pure' ? '#fc8019' : '#d4d5d9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {vegMode === 'pure' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fc8019' }}></div>}
                </div>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '48px', cursor: 'pointer' }}>
                <span style={{ fontSize: '15px', fontWeight: vegMode === 'egg' ? '700' : '600', color: vegMode === 'egg' ? '#3d4152' : '#7e808c' }}>Veg & Egg</span>
                <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: `2px solid ${vegMode === 'egg' ? '#fc8019' : '#d4d5d9'}`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {vegMode === 'egg' && <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: '#fc8019' }}></div>}
                </div>
              </label>
            </div>
          )}
        </div>

        {/* Non-Veg Toggle */}
        <div 
          onClick={() => {
            const newState = !isNonVegOn;
            setIsNonVegOn(newState);
            if (newState) setIsVegOn(false);
          }}
          style={{ display: 'flex', border: '1px solid #e9e9eb', borderRadius: '30px', padding: '6px 8px', alignItems: 'center', gap: '6px', cursor: 'pointer', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
        >
          {isNonVegOn ? (
            <>
              <div style={{ width: '18px', height: '12px', background: '#e43b4f', borderRadius: '6px' }}></div>
              <NonVegIcon color="#e43b4f" size={22} />
            </>
          ) : (
            <>
              <NonVegIcon color="#e43b4f" size={22} />
              <div style={{ width: '18px', height: '12px', background: '#f1f1f6', borderRadius: '6px' }}></div>
            </>
          )}
        </div>

        {/* Bestseller Toggle */}
        <div 
          onClick={() => setIsBestsellerOn(!isBestsellerOn)}
          style={{ display: 'flex', border: `1px solid ${isBestsellerOn ? '#282c3f' : '#e9e9eb'}`, borderRadius: '30px', padding: '8px 16px', alignItems: 'center', cursor: 'pointer', background: '#fff', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
        >
          <span style={{ fontSize: '14px', fontWeight: '800', color: '#282c3f', letterSpacing: '-0.2px' }}>Bestseller</span>
        </div>
        
      </div>

      {/* Menu List */}
      <div className="sw-category-title">
        <span>Recommended ({filteredMenu.length})</span>
        <i className="fas fa-chevron-up"></i>
      </div>

      <div>
        {filteredMenu.map((item, index) => {
          const isVeg = item.isVeg !== false; // Default to veg if undefined
          const isBestseller = index % 3 === 0; // Simulate bestseller
          return (
            <div key={item._id || item.id || `item-${index}`} className="sw-menu-item">
              <div className="sw-item-info">
                <div className="sw-item-type">
                  {isVeg ? <div className="sw-veg-icon"></div> : <div className="sw-nonveg-icon"></div>}
                  {isBestseller && (
                    <div className="sw-bestseller-tag">
                      <i className="fas fa-star"></i> Bestseller
                    </div>
                  )}
                </div>
                <h3 className="sw-item-title">{item.name}</h3>
                <div className="sw-item-price">₹{item.price}</div>
                <div className="sw-item-rating">
                  <i className="fas fa-star"></i> 4.{getDeterministicHash(item._id || item.name) % 9} <span>({10 + (getDeterministicHash(item._id || item.name) % 90)})</span>
                </div>
                <p className="sw-item-desc">{item.description}</p>
              </div>

              <div className="sw-item-media">
                <img src={item.image || '/default-food.png'} alt={item.name} onError={(e) => { e.target.onerror = null; e.target.src = '/default-food.png'; }} />

                {isItemAdded(item) ? (
                  <button className="sw-add-btn" style={{ color: '#fff', background: '#116649', border: 'none' }} onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item._id || item.id })}>
                    ADDED
                  </button>
                ) : (
                  <button className="sw-add-btn" onClick={() => handleAddToCart(item)}>
                    ADD
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sections */}
      <div className="sw-bottom-section">
        <h3 className="sw-bottom-title">Related to {restaurant.name}</h3>
        <div className="sw-related-carousel">
          <div className="sw-related-card">
            <img src="https://images.unsplash.com/photo-1631515243349-e0cb75fb8d3a?auto=format&fit=crop&w=300&q=80" alt="Related" className="sw-related-img" />
            <div className="sw-related-overlay">
              <h4>30% OFF</h4>
              <p>UPTO ₹75</p>
            </div>
            <div className="sw-related-info">
              <h5>NGKB's Cook Corner</h5>
              <p><i className="fas fa-star" style={{ color: '#116649' }}></i> 4.3 • 55-65 mins</p>
              <p>Biryani • Tenali</p>
            </div>
          </div>
          <div className="sw-related-card">
            <img src="https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?auto=format&fit=crop&w=300&q=80" alt="Related" className="sw-related-img" />
            <div className="sw-related-overlay">
              <h4 style={{ fontSize: '12px' }}>ITEMS</h4>
              <p>AT ₹79</p>
            </div>
            <div className="sw-related-info">
              <h5>Hyderabadi Biryani...</h5>
              <p><i className="fas fa-star" style={{ color: '#116649' }}></i> 4.3 • 40-45 mins</p>
              <p>Biryani, Chinese • Tenali</p>
            </div>
          </div>
          <div className="sw-related-card">
            <img src="https://images.unsplash.com/photo-1589302168068-964664d93cb0?auto=format&fit=crop&w=300&q=80" alt="Related" className="sw-related-img" />
            <div className="sw-related-overlay">
              <h4>30% OFF</h4>
              <p>UPTO ₹75</p>
            </div>
            <div className="sw-related-info">
              <h5>Delight BBQ</h5>
              <p><i className="fas fa-star" style={{ color: '#116649' }}></i> 3.5 • 50-60 mins</p>
              <p>Biryani, Indian • Tenali</p>
            </div>
          </div>
        </div>
      </div>

      <div className="sw-bottom-section" style={{ borderTop: 'none', paddingTop: '0' }}>
        <h3 className="sw-bottom-title">About {restaurant.name}</h3>
        <div className="sw-about-box">
          <h4>Best-Selling Dishes at {restaurant.name}</h4>
          <p>{restaurant.name} is a popular food destination in {restaurant.location}, known for serving delicious indian food. Customers can order from {restaurant.name} for fresh preparation, satisfying portions, and flavorful dishes.</p>
          <span className="see-more">See more <i className="fas fa-chevron-down"></i></span>
        </div>
      </div>

      <div className="sw-bottom-section" style={{ borderTop: 'none', paddingTop: '0' }}>
        <h3 className="sw-bottom-title">FAQs about {restaurant.name}</h3>
        <div className="sw-faq-item">
          Does {restaurant.name} deliver food in {restaurant.location} on TomoX?
          <i className="fas fa-chevron-up"></i>
        </div>
        <div className="sw-faq-item">
          What is {restaurant.name} known for?
          <i className="fas fa-chevron-down"></i>
        </div>
        <div className="sw-faq-item">
          What are the most popular dishes at {restaurant.name}?
          <i className="fas fa-chevron-down"></i>
        </div>
      </div>

      <div className="sw-bottom-section">
        <h3 className="sw-bottom-heading">Disclaimer</h3>
        <ul className="sw-disclaimer-list">
          <li>All prices are set directly by the restaurant.</li>
          <li>All nutritional information is indicative, values are per serve as shared by the restaurant and may vary depending on the ingredients and portion size.</li>
          <li>An average active adult requires 2,000 kcal energy per day, however, calorie needs may vary.</li>
        </ul>

        <div className="sw-fssai-section">
          <img src="/fssai.png" alt="FSSAI" className="sw-fssai-logo" />
          <span>License No. 10124007000527</span>
        </div>

        <div className="sw-restaurant-details-footer">
          <p className="sw-res-name">{restaurant.name}</p>
          <p className="sw-res-loc">(Outlet: {restaurant.location})</p>
          <p className="sw-res-address">
            <i className="fas fa-map-marker-alt"></i>
            D.No.20-3-17, Opp Chinnaravuru Park, Tenali, Guntur, Andhra Pradesh-522201
          </p>
        </div>

        <h3 className="sw-bottom-heading" style={{ marginTop: '40px' }}>Popular Searches</h3>
        
        <div className="sw-popular-searches">
          <div className="sw-popular-group">
            <h4>Popular Restaurant Near Tenali</h4>
            <div className="sw-popular-links">
              <a href="#">Sajjas Food Court</a>
              <a href="#">Chandus Eat Grid</a>
              <a href="#">Naidu Gari kunda Biryani</a>
              <a href="#">Sasi Delicious Food Court</a>
              <a href="#">Swaad Restaurant</a>
              <a href="#">Hotel Seethamba</a>
              <a href="#">Mirchi Family Restaurant</a>
              <a href="#">Karthikeya Chitti Nethi Idly Hotel</a>
              <a href="#">New Bismillah Biryani's And Kichidi Point</a>
            </div>
            <span className="sw-see-more-link">See more <i className="fas fa-chevron-down"></i></span>
          </div>

          <div className="sw-popular-group">
            <h4>Popular Restaurant In Guntur</h4>
            <div className="sw-popular-links">
              <a href="#">AK Atif Khan Biryani House</a>
              <a href="#">Hotel Sri Sankara Vilas</a>
              <a href="#">Amogham</a>
              <a href="#">Ak Special Hyderabadi Biryani House</a>
              <a href="#">Mourya Tasty Foods</a>
              <a href="#">Hoskote Four Am Biryani</a>
              <a href="#">Viceroy Biryani Point</a>
              <a href="#">Ginger And Garlic Family Restaurant</a>
            </div>
            <span className="sw-see-more-link">See more <i className="fas fa-chevron-down"></i></span>
          </div>

          <div className="sw-popular-group">
            <h4>City Hub Page</h4>
            <div className="sw-popular-links">
              <a href="#">Bangalore</a>
              <a href="#">Hyderabad</a>
              <a href="#">Mumbai</a>
              <a href="#">Chennai</a>
              <a href="#">Delhi</a>
              <a href="#">Pune</a>
              <a href="#">Kolkata</a>
              <a href="#">Gurgaon</a>
              <a href="#">Noida 1</a>
              <a href="#">Kochi</a>
              <a href="#">Ahmedabad</a>
              <a href="#">Chandigarh</a>
              <a href="#">Coimbatore</a>
              <a href="#">Jaipur</a>
              <a href="#">Lucknow</a>
              <a href="#">Thiruvananthapuram</a>
              <a href="#">Vizag</a>
              <a href="#">Central Goa</a>
              <a href="#">Noida</a>
              <a href="#">Surat</a>
            </div>
            <span className="sw-see-more-link">See more <i className="fas fa-chevron-down"></i></span>
          </div>
        </div>
      </div>

      {/* Floating Menu Button */}
      <button className="sw-floating-menu" onClick={() => window.scrollTo({ top: 500, behavior: 'smooth' })}>
        <i className="fas fa-utensils"></i>
        MENU
      </button>

      {/* Coupon Modal */}
      {selectedCoupon && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={() => setSelectedCoupon(null)}>
          <div style={{ background: '#fff', borderRadius: '24px', padding: '32px', width: '100%', maxWidth: '600px', position: 'relative', boxShadow: '0 8px 32px rgba(0,0,0,0.12)' }} onClick={e => e.stopPropagation()}>
            <button 
              onClick={() => setSelectedCoupon(null)} 
              style={{ position: 'absolute', top: '24px', right: '24px', background: '#fff', border: '1px solid #e9e9eb', borderRadius: '50%', width: '36px', height: '36px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#3d4152', fontSize: '14px', boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}
            >
              <i className="fas fa-times"></i>
            </button>
            <h3 style={{ fontSize: '22px', fontWeight: '800', color: '#3d4152', margin: '0 0 24px 0', paddingRight: '40px', letterSpacing: '-0.3px' }}>
              {selectedCoupon.description || selectedCoupon.title}
            </h3>
            <div style={{ height: '1px', background: '#e9e9eb', width: '100%', marginBottom: '24px' }}></div>
            <h4 style={{ fontSize: '16px', fontWeight: '700', color: '#3d4152', margin: '0 0 16px 0' }}>Terms and Conditions</h4>
            <ul style={{ paddingLeft: '24px', margin: 0, color: '#3d4152', fontSize: '15px', lineHeight: '1.6' }}>
              {selectedCoupon.termsAndConditions && selectedCoupon.termsAndConditions.length > 0 ? (
                selectedCoupon.termsAndConditions.map((term, i) => (
                  <li key={i} style={{ marginBottom: '12px' }}>{term}</li>
                ))
              ) : (
                <li style={{ marginBottom: '12px' }}>Offer valid till {new Date(selectedCoupon.validUntil || Date.now() + 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} 11:59 PM</li>
              )}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
});

RestaurantMenu.displayName = 'RestaurantMenu';

export default RestaurantMenu;
