// File: src/components/RestaurantCard.jsx

import React, { memo, useCallback } from "react";
import { useNavigate } from "react-router-dom";

const RestaurantCard = memo(function RestaurantCard({ restaurant }) {
  const navigate = useNavigate();

  const { _id, name, cuisine, logo, rating = 4.5 } = restaurant;

  const handleClick = useCallback(() => {
    navigate(`/restaurant/${_id}`);
  }, [_id, navigate]);

  return (
    <div
      className="restaurant-card"
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <div className="restaurant-image-wrapper">
        <img
          src={logo}
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
        <div className="restaurant-overlay"></div>
      </div>
      <div className="restaurant-info">
        <h3 className="restaurant-name">{name}</h3>
        <div className="restaurant-meta">
          <div className="rating-section">
            <i className="fas fa-star" style={{ color: '#FFB800', marginRight: '4px' }}></i>
            <span className="stars">{rating}</span>
            <span className="divider">•</span>
            <span className="cuisine-type">{Array.isArray(cuisine) ? cuisine.join(", ") : cuisine}</span>
          </div>
        </div>
      </div>
    </div>
  );
});

export default RestaurantCard;
