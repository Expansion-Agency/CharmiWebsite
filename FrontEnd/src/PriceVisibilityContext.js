import React, { createContext, useContext, useEffect, useState } from "react";

const PriceVisibilityContext = createContext();

export const PriceVisibilityProvider = ({ children }) => {
  const [hidePrices, setHidePrices] = useState(() => {
    // Initialize from localStorage or default to false
    const saved = localStorage.getItem("hidePrices");
    return saved ? JSON.parse(saved) : false;
  });

  useEffect(() => {
    // Update localStorage when hidePrices changes
    localStorage.setItem("hidePrices", JSON.stringify(hidePrices));
  }, [hidePrices]);

  const togglePrices = () => setHidePrices((prev) => !prev);

  return (
    <PriceVisibilityContext.Provider value={{ hidePrices, togglePrices }}>
      {children}
    </PriceVisibilityContext.Provider>
  );
};

export const usePriceVisibility = () => useContext(PriceVisibilityContext);
