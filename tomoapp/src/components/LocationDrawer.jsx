import React, { useState, useEffect, useRef } from "react";
import { useLocationContext } from "../context/LocationContext";
import "../index.css";

// Debounce hook
const useDebounce = (value, delay) => {
  const [debouncedValue, setDebouncedValue] = useState(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
};

const LocationDrawer = ({ isOpen, onClose }) => {
  const { updateLocation } = useLocationContext();
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedQuery = useDebounce(searchQuery, 600);
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isFetchingGPS, setIsFetchingGPS] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setIsSearching(false);
      return;
    }

    const fetchLocations = async () => {
      setIsSearching(true);
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            debouncedQuery
          )}&format=json&addressdetails=1&limit=5`,
          {
            headers: {
              "Accept-Language": "en-US,en;q=0.9",
            }
          }
        );
        const data = await response.json();
        setResults(data || []);
      } catch (err) {
        console.error("Geocoding error:", err);
      } finally {
        setIsSearching(false);
      }
    };

    fetchLocations();
  }, [debouncedQuery]);

  const handleSelectLocation = (place) => {
    let name = place.name || place.display_name.split(",")[0];
    if (place.address && (place.address.suburb || place.address.neighbourhood || place.address.city)) {
      name = place.address.suburb || place.address.neighbourhood || place.address.city || name;
    }

    updateLocation({
      address: name,
      fullAddress: place.display_name,
      lat: place.lat,
      lon: place.lon,
    });
    onClose();
  };

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsFetchingGPS(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
            {
              headers: {
                "Accept-Language": "en-US,en;q=0.9",
              }
            }
          );
          const data = await response.json();
          if (data) {
            let name = data.name || (data.address && (data.address.suburb || data.address.neighbourhood || data.address.city || data.address.town)) || "Current Location";
            updateLocation({
              address: name,
              fullAddress: data.display_name,
              lat: latitude,
              lon: longitude,
            });
            onClose();
          }
        } catch (err) {
          console.error("Reverse geocoding error:", err);
          alert("Failed to get location details.");
        } finally {
          setIsFetchingGPS(false);
        }
      },
      (err) => {
        console.error("Geolocation error:", err);
        alert("Failed to get your location. Please check your permissions.");
        setIsFetchingGPS(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="loc-drawer-backdrop" onClick={onClose}></div>
      <div className={`loc-drawer ${isOpen ? "open" : ""}`}>
        <div className="loc-drawer-header">
          <button className="loc-close-btn" onClick={onClose} aria-label="Close">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className="loc-drawer-content">
          <div className="loc-search-box">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search for area, street name.."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="loc-search-input"
            />
          </div>

          {!searchQuery && (
            <div className="loc-gps-box" onClick={handleGetLocation}>
              <div className="loc-gps-icon">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="3"></circle>
                </svg>
              </div>
              <div className="loc-gps-text">
                <h3>Get current location</h3>
                <p>Using GPS</p>
              </div>
              {isFetchingGPS && <div className="loc-loading-spinner" />}
            </div>
          )}

          {searchQuery && (
            <div className="loc-results">
              {isSearching ? (
                <div className="loc-loading">Searching...</div>
              ) : results.length > 0 ? (
                results.map((place) => (
                  <div key={place.place_id} className="loc-result-item" onClick={() => handleSelectLocation(place)}>
                    <div className="loc-result-icon">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93959f" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                        <circle cx="12" cy="10" r="3"></circle>
                      </svg>
                    </div>
                    <div className="loc-result-info">
                      <h4>{place.name || (place.address && (place.address.suburb || place.address.city || place.address.town)) || "Unknown Location"}</h4>
                      <p>{place.display_name}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="loc-no-results">No results found</div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default LocationDrawer;
