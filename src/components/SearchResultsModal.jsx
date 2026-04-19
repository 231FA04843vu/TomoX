import React, { memo, useCallback } from "react";
import { Link } from "react-router-dom";
import RestaurantCard from "./RestaurantCard";

const SearchResultsModal = memo(function SearchResultsModal({
  isOpen,
  query,
  suggestions,
  restaurants,
  items,
  offers,
  onClose,
  onSuggestionClick,
}) {
  const handleStopPropagation = useCallback((event) => {
    event.stopPropagation();
  }, []);

  if (!isOpen) return null;

  return (
    <div className="search-modal-backdrop" role="presentation" onClick={onClose}>
      <div
        className="search-modal"
        role="dialog"
        aria-modal="true"
        onClick={handleStopPropagation}
      >
        <div className="search-modal-header">
          <div>
            <p className="search-modal-kicker">Search results</p>
            <h2>"{query}"</h2>
            <span className="search-modal-meta">
              {restaurants.length} places found
            </span>
          </div>
          <button
            type="button"
            className="search-modal-close"
            onClick={onClose}
            aria-label="Close search"
          >
            Close
          </button>
        </div>

        <div className="search-modal-body">
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
                    onClick={() => onSuggestionClick(item.label)}
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
                        src={item.image}
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
                        src={offer.imageUrl}
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
    </div>
  );
});

export default SearchResultsModal;
