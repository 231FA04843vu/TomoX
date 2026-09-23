import React, { memo, useCallback, useRef } from "react";

const shortcuts = [
  { label: "Pizza", image: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/v1674029856/PC_Creative%20refresh/3D_bau/banners_new/Pizza.png" },
  { label: "North Indian", image: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/v1675667625/PC_Creative%20refresh/North_Indian_4.png" },
  { label: "Chinese", image: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/v1674029848/PC_Creative%20refresh/3D_bau/banners_new/Chinese.png" },
  { label: "Burger", image: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/v1674029845/PC_Creative%20refresh/3D_bau/banners_new/Burger.png" },
  { label: "Rolls", image: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/v1674029858/PC_Creative%20refresh/3D_bau/banners_new/Rolls.png" },
  { label: "Biryani", image: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/v1675667625/PC_Creative%20refresh/Biryani_2.png" },
  { label: "Cakes", image: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/v1674029845/PC_Creative%20refresh/3D_bau/banners_new/Cakes.png" },
  { label: "More", image: "https://media-assets.swiggy.com/swiggy/image/upload/fl_lossy,f_auto,q_auto,w_288,h_360/v1674029850/PC_Creative%20refresh/3D_bau/banners_new/Dosa.png" }, // using dosa image for more temporarily
];

const CategoryShortcuts = memo(function CategoryShortcuts() {
  const scrollRef = useRef(null);

  const handleCategoryClick = useCallback((label) => {
    window.dispatchEvent(
      new CustomEvent("search:category", { detail: { category: label } })
    );
  }, []);

  const scrollLeft = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: -280, behavior: "smooth" });
    }
  }, []);

  const scrollRight = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 280, behavior: "smooth" });
    }
  }, []);

  return (
    <div className="category-section">
      {/* Section header */}
      <div className="section-header">
        <h2 className="section-title">What&apos;s on your mind?</h2>
        <div className="section-nav">
          <button
            type="button"
            className="section-nav-btn"
            onClick={scrollLeft}
            aria-label="Scroll categories left"
          >
            <i className="fas fa-chevron-left" />
          </button>
          <button
            type="button"
            className="section-nav-btn"
            onClick={scrollRight}
            aria-label="Scroll categories right"
          >
            <i className="fas fa-chevron-right" />
          </button>
        </div>
      </div>

      {/* Horizontal scroll row */}
      <section
        ref={scrollRef}
        className="category-shortcuts"
        aria-label="Quick categories"
      >
        {shortcuts.map((item, index) => (
          <button
            key={item.label}
            type="button"
            className="shortcut-card"
            onClick={() => handleCategoryClick(item.label)}
            aria-label={`Browse ${item.label}`}
          >
            <span className="shortcut-image">
              <img
                src={item.image}
                alt={item.label}
                loading={index < 4 ? "eager" : "lazy"}
                decoding="async"
                fetchPriority={index < 4 ? "high" : "low"}
              />
            </span>
            <span className="shortcut-label desktop-hidden">{item.label}</span>
          </button>
        ))}
      </section>

      {/* Swiggy-style thick divider below categories */}
      <div className="category-divider" />
    </div>
  );
});

export default CategoryShortcuts;
