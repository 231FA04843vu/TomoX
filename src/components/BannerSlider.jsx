import React, { useState, memo, useCallback } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

const API_COMPANY = import.meta.env.VITE_API_COMPANY;
const THEME_GRADIENTS = [
  "linear-gradient(135deg, #fc8019 0%, #ffb020 100%)",
  "linear-gradient(135deg, #fb641b 0%, #ff9f1c 100%)",
  "linear-gradient(135deg, #ff8f00 0%, #ffc107 100%)",
  "linear-gradient(135deg, #f97316 0%, #fbbf24 100%)",
];

const BannerSlider = memo(function BannerSlider({ offers = [] }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const handleSlideChange = useCallback((swiper) => {
    setActiveIndex(swiper.realIndex);
  }, []);

  if (!offers.length) return null;

  return (
    <div className="full-width-banner">
      <Swiper
        modules={[Autoplay, Navigation]}
        autoplay={{ delay: 3000 }}
        loop={offers.length >= 3}
        navigation
        spaceBetween={0}
        slidesPerView={1}
        className="banner-slider"
        onSlideChange={handleSlideChange}
      >
        {offers.map((offer, idx) => {
          const hasImage = Boolean(offer?.image);

          if (hasImage) {
            const imageUrl = String(offer.image).startsWith("http")
              ? offer.image
              : `${API_COMPANY}${offer.image}`;
            const imageClassName = offer?.isAiGenerated
              ? "banner-image ai-banner-image"
              : "banner-image";

            return (
              <SwiperSlide key={offer._id || idx}>
                <div className="banner-slide-container">
                  <img 
                    className={imageClassName} 
                    src={imageUrl} 
                    alt={offer.title || "Offer banner"} 
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={idx === 0 ? "high" : "low"}
                  />
                  <div className="banner-theme-overlay" aria-hidden="true"></div>
                </div>
              </SwiperSlide>
            );
          }

          const discount = offer.discountType === "percentage"
            ? `${offer.discountValue}% OFF`
            : `₹${offer.discountValue} OFF`;

          const cardGradient = THEME_GRADIENTS[idx % THEME_GRADIENTS.length];

          return (
            <SwiperSlide key={offer._id || idx}>
              <div className="banner-slide-container">
                <div
                  className="banner-image"
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "24px 30px",
                    background: cardGradient,
                    color: "#fff",
                  }}
                >
                  <div>
                    <div style={{ fontSize: "12px", fontWeight: 700, letterSpacing: "0.08em", opacity: 0.95 }}>TOMOX COUPON OFFER</div>
                    <div style={{ fontSize: "38px", fontWeight: 900, marginTop: "6px", lineHeight: 1 }}>{offer.code}</div>
                    <div style={{ fontSize: "24px", fontWeight: 800, marginTop: "6px" }}>{discount}</div>
                    <div style={{ fontSize: "16px", marginTop: "10px", maxWidth: "680px", lineHeight: 1.35 }}>
                      {offer.description || "Apply this coupon in checkout"}
                    </div>
                  </div>
                  <div style={{ fontSize: "74px", opacity: 0.9 }} aria-hidden="true">🍕🍔</div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      <div className="custom-progress-pagination">
        {offers.map((_, index) => (
          <div
            key={index}
            className={`progress-dot ${index === activeIndex ? "active" : ""}`}
          />
        ))}
      </div>
    </div>
  );
});

export default BannerSlider;
