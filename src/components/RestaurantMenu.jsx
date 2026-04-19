import React, { useEffect, useState, memo, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import PageLoader from './PageLoader';
import { normalizeAssetUrl } from '../utils/url';
import '../styles/pageLoader.css';

const API_VENDOR = import.meta.env.VITE_API_VENDOR;

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

const RestaurantMenu = memo(() => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { cart, dispatch } = useCart();
  const [restaurant, setRestaurant] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);

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
  }, [dispatch, restaurant]);

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
    <div className="restaurant-menu-page rm-page">
      <section className="rm-hero">
        <div className="rm-hero-media">
          <img
            src={restaurant.logo}
            alt={restaurant.name}
            className="rm-hero-image"
            loading="eager"
            decoding="async"
          />
          <div className="rm-hero-overlay"></div>
        </div>

        <div className="rm-hero-content">
          <div className="rm-hero-top">
            <button className="rm-back-btn" onClick={() => navigate(-1)}>
              <i className="fas fa-arrow-left"></i>
            </button>
            <h1 className="rm-title">{restaurant.name}</h1>
          </div>

          <div className="rm-meta">
            <div className="rm-meta-chip">
              <i className="fas fa-star"></i>
              <span>{restaurant.rating || 4.5}</span>
            </div>
            <div className="rm-meta-chip">
              <i className="fas fa-utensils"></i>
              <span>{restaurant.cuisine ? (Array.isArray(restaurant.cuisine) ? restaurant.cuisine.slice(0, 2).join(", ") : restaurant.cuisine) : "Restaurant"}</span>
            </div>
            <div className="rm-meta-chip">
              <i className="fas fa-map-marker-alt"></i>
              <span>{restaurant.location}</span>
            </div>
          </div>
        </div>
      </section>

      <section className="rm-content-wrap">
        <div className="rm-toolbar">
          <div>
            <h2 className="rm-section-title">Menu</h2>
            <p className="rm-section-subtitle">{filteredMenu.length} dishes available</p>
          </div>
          {categories.size > 0 && (
            <div className="rm-categories">
              <button
                className={`rm-cat-btn ${selectedCategory === 'all' ? 'active' : ''}`}
                onClick={() => setSelectedCategory('all')}
              >
                All
              </button>
              {Array.from(categories).map((cat) => (
                <button
                  key={cat}
                  className={`rm-cat-btn ${selectedCategory === cat ? 'active' : ''}`}
                  onClick={() => setSelectedCategory(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="rm-grid-wrap">
          {filteredMenu && filteredMenu.length > 0 ? (
            <div className="rm-grid">
              {filteredMenu.map((item, index) => (
                <article key={item._id || item.id || `item-${index}`} className="rm-card">
                  <div className="rm-card-media">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="rm-card-image"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-food.png';
                      }}
                    />
                    {item.category && (
                      <span className="rm-card-badge">{item.category}</span>
                    )}
                  </div>

                  <div className="rm-card-body">
                    <h3 className="rm-item-name">{item.name}</h3>
                    <p className="rm-item-description">{item.description}</p>

                    <div className="rm-card-footer">
                      <span className="rm-item-price">₹{item.price}</span>
                      <div className="rm-actions">
                        {isItemAdded(item) ? (
                          <span className="rm-added-pill">
                            <i className="fas fa-check"></i>
                            Added
                          </span>
                        ) : (
                          <button
                            className="rm-add-btn"
                            onClick={() => handleAddToCart(item)}
                          >
                            <i className="fas fa-plus"></i> Add
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          ) : (
            <div className="rm-empty-state">
              <i className="fas fa-inbox"></i>
              <p>No items available in this category</p>
            </div>
          )}
        </div>
      </section>

      {/* Top-right Cart Preview */}
      {cartItems.length > 0 && (
        <div className="menu-cart-preview-fixed">
          <div className="menu-cart-preview">
            <div className="menu-cart-preview-head">
              <h4>Cart Preview</h4>
              <span>{totalCartQuantity} {totalCartQuantity === 1 ? 'item' : 'items'}</span>
            </div>

            <div className="menu-cart-preview-list">
              {cartItems.slice(0, 3).map((item, index) => (
                <div key={item.itemId || item._id || item.id || `preview-item-${index}`} className="menu-cart-preview-row">
                  <div className="menu-cart-preview-item-main">
                    <img
                      src={normalizeAssetUrl(item.image) || '/default-food.png'}
                      alt={item.name}
                      className="menu-cart-preview-thumb"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = '/default-food.png';
                      }}
                    />
                    <p>{item.name}</p>
                  </div>
                  <div className="menu-cart-preview-actions">
                    <span className="cart-item-quantity">x{item.quantity || 1}</span>
                    <button
                      className="cart-item-remove-btn"
                      onClick={() => dispatch({ type: 'REMOVE_ITEM', payload: item.itemId || item._id || item.id })}
                      title="Remove item"
                    >
                      <i className="fas fa-times"></i>
                    </button>
                  </div>
                </div>
              ))}
              {cartItems.length > 3 && (
                <div className="menu-cart-preview-more">+{cartItems.length - 3} more items</div>
              )}
            </div>

            <button className="view-cart-btn" onClick={() => navigate('/cart')}>
              View Cart
            </button>
          </div>
        </div>
      )}
    </div>
  );
});

RestaurantMenu.displayName = 'RestaurantMenu';

export default RestaurantMenu;
