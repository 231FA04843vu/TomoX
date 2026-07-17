import React, { useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import RestaurantCard from "../components/RestaurantCard";
import { normalizeAssetUrl } from "../utils/url";

import pizzasImg from '../assets/categories/pizzas.jpg';
import burgersImg from '../assets/categories/burgers.jpg';
import drinksImg from '../assets/categories/drinks.jpg';
import snacksImg from '../assets/categories/snacks.jpg';
import cafesImg from '../assets/categories/cafes.jpg';
import tiffinsImg from '../assets/categories/tiffins.jpg';
import lunchImg from '../assets/categories/lunch.jpg';
import kfcImg from '../assets/categories/kfc.jpg';

const POPULAR_CUISINES = [
  { name: 'Pizzas', image: pizzasImg },
  { name: 'Burgers', image: burgersImg },
  { name: 'Drinks', image: drinksImg },
  { name: 'Snacks', image: snacksImg },
  { name: 'Cafes', image: cafesImg },
  { name: 'Tiffins', image: tiffinsImg },
  { name: 'Lunch', image: lunchImg },
  { name: 'KFC Foods', image: kfcImg }
];

export default function Search({
  query,
  setQuery,
  suggestions,
  restaurants,
  items,
  offers
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleCuisineClick = (cuisineName) => {
    setQuery(cuisineName);
  };

  return (
    <div className="search-page-container" style={{ maxWidth: '860px', margin: '0 auto', paddingTop: '40px', paddingBottom: '60px', minHeight: '80vh' }}>
      
      {/* Search Input */}
      <div className="search-input-wrapper" style={{ position: 'relative', margin: '0 20px 40px' }}>
        <input 
          ref={inputRef}
          type="text" 
          placeholder="Search for restaurants and food" 
          value={query}
          onChange={e => setQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '16px 48px 16px 20px',
            fontSize: '16px',
            border: '1px solid #d4d5d9',
            borderRadius: '4px',
            outline: 'none',
            boxShadow: 'none',
            fontWeight: '500',
            fontFamily: 'ProximaNova, arial, "Helvetica Neue", sans-serif'
          }}
        />
        <i className="fas fa-search" style={{ position: 'absolute', right: '20px', top: '50%', transform: 'translateY(-50%)', color: '#686b78', fontSize: '20px' }}></i>
      </div>

      {/* Popular Cuisines (only show if no query) */}
      {!query && (
        <div className="popular-cuisines-section" style={{ padding: '0 20px' }}>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#3d4152', marginBottom: '24px', fontFamily: 'ProximaNova, arial, "Helvetica Neue", sans-serif' }}>
            Popular Cuisines
          </h2>
          
          <div className="cuisines-grid" style={{
            display: 'flex',
            flexWrap: 'nowrap',
            overflowX: 'auto',
            gap: '30px',
            paddingBottom: '20px',
            scrollbarWidth: 'none', /* Firefox */
            msOverflowStyle: 'none'  /* IE and Edge */
          }}>
            {POPULAR_CUISINES.map((cuisine, idx) => (
              <div 
                key={idx} 
                className="cuisine-item" 
                onClick={() => handleCuisineClick(cuisine.name)}
                style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', cursor: 'pointer' }}
              >
                <img 
                  src={cuisine.image} 
                  alt={cuisine.name} 
                  style={{ width: '80px', height: '80px', borderRadius: '50%', objectFit: 'cover', marginBottom: '12px', border: '1px solid #e9e9eb' }}
                />
                <span style={{ fontSize: '14px', color: '#3d4152', textAlign: 'center', fontWeight: '500' }}>{cuisine.name}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Results (only show if query exists) */}
      {query && (
        <div className="search-results-container" style={{ padding: '0 20px' }}>
          <div className="search-modal-body" style={{ padding: 0, borderTop: 'none', height: 'auto', overflowY: 'visible' }}>
            <section className="search-section">
              <div className="search-section-header">
                <h3>Suggestions</h3>
                <span>Tap to search</span>
              </div>
              <div className="search-suggestions">
                {suggestions.length > 0 ? (
                  suggestions.map((item) => (
                    <button
                      key={`${item.type}-${item.label}`}
                      type="button"
                      className="suggestion-chip"
                      onClick={() => setQuery(item.label)}
                    >
                      <span className="chip-type">{item.type}</span>
                      <span className="chip-label">{item.label}</span>
                    </button>
                  ))
                ) : (
                  <div className="search-empty">No suggestions yet.</div>
                )}
              </div>
            </section>

            <section className="search-section">
              <div className="search-section-header">
                <h3>Restaurants</h3>
                <span>Top matches</span>
              </div>
              <div className="search-results-grid">
                {restaurants.map((res) => (
                  <div key={res._id} className="search-result-card">
                    <RestaurantCard restaurant={res} />
                  </div>
                ))}
                {restaurants.length === 0 && (
                  <div className="search-empty">
                    No restaurants match your search.
                  </div>
                )}
              </div>
            </section>

            <section className="search-section">
              <div className="search-section-header">
                <h3>Items</h3>
                <span>Menu highlights</span>
              </div>
              <div className="search-items-grid">
                {items.length > 0 ? (
                  items.map((item) => (
                    <div
                      key={`${item.restaurantId || "res"}-${item.id || item._id || item.name}`}
                      className="search-item-card"
                    >
                      {item.image ? (
                        <img
                          src={normalizeAssetUrl(item.image)}
                          alt={item.name}
                          className="search-item-image"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="search-item-image placeholder" />
                      )}
                      <div className="search-item-info">
                        <h4>{item.name}</h4>
                        <p className="search-item-description">
                          {item.description || "Popular pick"}
                        </p>
                        <div className="search-item-meta">
                          <span>₹{item.price}</span>
                          {item.restaurantId ? (
                            <Link
                              to={`/restaurant/${item.restaurantId}`}
                              className="search-item-link"
                            >
                              {item.restaurantName}
                            </Link>
                          ) : (
                            <span className="search-item-link">
                              {item.restaurantName}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="search-empty">No items found yet.</div>
                )}
              </div>
            </section>

            <section className="search-section">
              <div className="search-section-header">
                <h3>Offers & picks</h3>
                <span>Handpicked deals</span>
              </div>
              <div className="search-offers">
                {offers.length > 0 ? (
                  offers.map((offer) => (
                    <div key={offer.id} className="offer-card">
                      {offer.imageUrl ? (
                        <img
                          src={normalizeAssetUrl(offer.imageUrl)}
                          alt={offer.title}
                          className="offer-image"
                          loading="lazy"
                          decoding="async"
                        />
                      ) : (
                        <div className="offer-image placeholder" />
                      )}
                      <div className="offer-content">
                        <h4>{offer.title}</h4>
                        <p>{offer.subtitle}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="search-empty">Offers coming soon.</div>
                )}
              </div>
            </section>
          </div>
        </div>
      )}
    </div>
  );
}
