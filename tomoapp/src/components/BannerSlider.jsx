import React, { useState, memo, useCallback, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { normalizeAssetUrl } from "../utils/url";

const API_COMPANY = import.meta.env.VITE_API_COMPANY;

const THEME_GRADIENTS = [
  "linear-gradient(135deg, #fc8019 0%, #ffb020 100%)",
  "linear-gradient(135deg, #e37410 0%, #fc8019 100%)",
  "linear-gradient(135deg, #ff6f00 0%, #ffa726 100%)",
  "linear-gradient(135deg, #f57c00 0%, #ffca28 100%)",
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
        autoplay={{ delay: 3500, disableOnInteraction: false }}
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
              ? normalizeAssetUrl(offer.image)
              : normalizeAssetUrl(`${API_COMPANY}${offer.image}`);
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
                  <div className="banner-theme-overlay" aria-hidden="true" />
                </div>
              </SwiperSlide>
            );
          }

          const discount =
            offer.discountType === "percentage"
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
                    padding: "28px 36px",
                    background: cardGradient,
                    color: "#fff",
                    minHeight: 200,
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: 11,
                        fontWeight: 800,
                        letterSpacing: "0.12em",
                        opacity: 0.9,
                        textTransform: "uppercase",
                        marginBottom: 6,
                      }}
                    >
                      TomoX Exclusive Offer
                    </div>
                    <div
                      style={{
                        fontSize: 40,
                        fontWeight: 900,
                        lineHeight: 1,
                        marginBottom: 4,
                      }}
                    >
                      {offer.code}
                    </div>
                    <div style={{ fontSize: 26, fontWeight: 800, marginBottom: 10 }}>
                      {discount}
                    </div>
                    <div
                      style={{
                        fontSize: 15,
                        maxWidth: 560,
                        lineHeight: 1.4,
                        opacity: 0.92,
                      }}
                    >
                      {offer.description || "Apply this coupon at checkout"}
                    </div>
                  </div>
                  <div style={{ fontSize: 80, opacity: 0.85 }} aria-hidden="true">
                    🍕🍔
                  </div>
                </div>
              </div>
            </SwiperSlide>
          );
        })}
      </Swiper>

      {/* Dot indicators */}
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
