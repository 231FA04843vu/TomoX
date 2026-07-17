// File: src/components/RestaurantCard.jsx

import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { normalizeAssetUrl } from "../utils/url";

// Delivery time ranges based on position (deterministic but varied)
const DELIVERY_TIMES = [
  "20–25 mins",
  "25–30 mins",
  "30–35 mins",
  "35–40 mins",
  "15–20 mins",
  "40–50 mins",
];

// Offer labels for visual variety
const OFFER_LABELS = [
  "60% OFF up to ₹120",
  "₹50 OFF above ₹199",
  "FREE DELIVERY",
  "40% OFF up to ₹80",
  "ITEMS AT ₹99",
  "₹100 OFF above ₹499",
];

function hashIndex(str, len) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h * 31 + str.charCodeAt(i)) >>> 0;
  return h % len;
}

const RestaurantCard = memo(function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  const { _id, name, cuisine, logo, rating = 4.5, location } = restaurant;
  const logoUrl = normalizeAssetUrl(logo);

  const deliveryTime = DELIVERY_TIMES[hashIndex(_id || name || "", DELIVERY_TIMES.length)];
  const offerLabel = OFFER_LABELS[hashIndex((name || "") + (_id || ""), OFFER_LABELS.length)];
  const cuisineText = Array.isArray(cuisine) ? cuisine.join(", ") : cuisine;

  const handleClick = useCallback(() => {
    navigate(`/restaurant/${_id}`);
  }, [_id, navigate]);

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        navigate(`/restaurant/${_id}`);
      }
    },
    [_id, navigate]
  );

  return (
    <div
      className="restaurant-card"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label={`${name} — ${cuisineText}`}
    >
      {/* Image with overlay offer badge */}
      <div className="restaurant-image-wrapper">
        <img
          src={logoUrl}
          alt={name}
          className="restaurant-image"
          loading="lazy"
          decoding="async"
          fetchPriority="low"
          onError={(e) => {
            e.target.onerror = null;
            e.target.src = "/default-restaurant.png";
          }}
        />
        <div className="restaurant-overlay" aria-hidden="true" />
        {/* Offer badge at bottom of image */}
        <div className="restaurant-offer-badge">
          <i className="fas fa-percent" style={{ marginRight: 5, fontSize: 11 }} />
          {offerLabel}
        </div>
      </div>

      {/* Info below image */}
      <div className="restaurant-info">
        <h3 className="restaurant-name">{name}</h3>

        <div className="restaurant-meta">
          {/* Green rating pill */}
          <span className="rating-section">
            <i className="fas fa-star" />
            {Number(rating).toFixed(1)}
          </span>

          {/* Dot separator */}
          <span style={{ color: "#d4d4d4" }}>•</span>

          {/* Delivery time */}
          <span className="restaurant-delivery">
            <i className="fas fa-clock" />
            {deliveryTime}
          </span>
        </div>

        {/* Cuisine */}
        {cuisineText && (
          <div className="restaurant-cuisine">{cuisineText}</div>
        )}

        {/* Location */}
        {location && (
          <div className="restaurant-location">{location}</div>
        )}
      </div>
    </div>
  );
});

export default RestaurantCard;
