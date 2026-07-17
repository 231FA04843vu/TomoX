import React, { memo } from "react";

const SearchBar = memo(function SearchBar({ value, onChange }) {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <i className="fas fa-search" style={{ color: "#7e808c", fontSize: 16, flexShrink: 0 }} />
      <input
        type="text"
        placeholder="Search for restaurants and food..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label="Search restaurants or dishes"
      />
      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          style={{
            background: "none",
            border: "none",
            color: "#7e808c",
            padding: "4px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
          }}
        >
          <i className="fas fa-times" style={{ fontSize: 14 }} />
        </button>
      )}
    </form>
  );
});

export default SearchBar;
