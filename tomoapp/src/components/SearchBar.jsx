import React from "react";

const SearchBar = ({ value, onChange }) => {
  const handleSubmit = (event) => {
    event.preventDefault();
  };

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <input
        type="text"
        placeholder="Search restaurants or dishes..."
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />
      <button type="submit" className="fas fa-search" aria-label="Search" />
    </form>
  );
};

export default SearchBar;
