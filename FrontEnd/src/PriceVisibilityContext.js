import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

const PriceVisibilityContext = createContext();

export const PriceVisibilityProvider = ({ children }) => {
  const API_BASE_URL = process.env.REACT_APP_API_URL;
  const [hidePrices, setHidePrices] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchHidePrices() {
      try {
        const { data } = await axios.get(
          `${API_BASE_URL}/site-settings/price-visibility`
        );
        setHidePrices(data.hidePrices ?? false);
      } catch (error) {
        console.error("Failed to fetch price visibility:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchHidePrices();
  }, []);

  // Update backend when hidePrices changes (skip initial load)
  useEffect(() => {
    if (loading) return;

    async function updateHidePrices() {
      try {
        await axios.post(`${API_BASE_URL}/site-settings/price-visibility`, {
          hidePrices,
        });
      } catch (error) {
        console.error("Failed to update price visibility:", error);
      }
    }
    updateHidePrices();
  }, [hidePrices, loading]);

  const togglePrices = () => setHidePrices((prev) => !prev);

  return (
    <PriceVisibilityContext.Provider value={{ hidePrices, togglePrices }}>
      {children}
    </PriceVisibilityContext.Provider>
  );
};

export const usePriceVisibility = () => useContext(PriceVisibilityContext);
