import React, { memo, useCallback } from "react";
import tiffinsImg from "../assets/categories/tiffins.jpg";
import lunchImg from "../assets/categories/lunch.jpg";
import cafesImg from "../assets/categories/cafes.jpg";
import drinksImg from "../assets/categories/drinks.jpg";
import snacksImg from "../assets/categories/snacks.jpg";
import pizzasImg from "../assets/categories/pizzas.jpg";
import burgersImg from "../assets/categories/burgers.jpg";
import kfcImg from "../assets/categories/kfc.jpg";

const shortcuts = [
  { label: "Tiffins", image: tiffinsImg },
  { label: "Lunch", image: lunchImg },
  { label: "Cafes", image: cafesImg },
  { label: "Drinks", image: drinksImg },
  { label: "Snacks", image: snacksImg },
  { label: "Pizzas", image: pizzasImg },
  { label: "Burgers", image: burgersImg },
  { label: "KFC Foods", image: kfcImg },
];

const CategoryShortcuts = memo(function CategoryShortcuts() {
  const handleCategoryClick = useCallback((label) => {
    // Trigger search for category
    window.dispatchEvent(
      new CustomEvent("search:category", { detail: { category: label } })
    );
  }, []);

  return (
    <section className="category-shortcuts" aria-label="Quick categories">
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
          <span className="shortcut-label">{item.label}</span>
        </button>
      ))}
    </section>
  );
});

export default CategoryShortcuts;
