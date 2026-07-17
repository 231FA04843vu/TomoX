import React, { createContext, useContext, useState } from "react";

const LocationContext = createContext();

const LOCATION_STORAGE_KEY = "tomo.location.v1";

export const LocationProvider = ({ children }) => {
  const [location, setLocation] = useState(() => {
    try {
      const stored = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Failed to parse location from storage", e);
    }
    return {
      address: "Your Location",
      lat: null,
      lon: null,
    };
  });

  const updateLocation = (newLocation) => {
    setLocation(newLocation);
    try {
      localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newLocation));
    } catch (e) {
      console.error("Failed to save location to storage", e);
    }
  };

  return (
    <LocationContext.Provider value={{ location, updateLocation }}>
      {children}
    </LocationContext.Provider>
  );
};

export const useLocationContext = () => useContext(LocationContext);
