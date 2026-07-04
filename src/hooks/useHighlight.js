"use client";

import { createContext, useContext, useState, useCallback } from "react";

const HighlightContext = createContext({
  highlightId: null,
  setHighlightId: () => {},
  clearHighlight: () => {},
});

export const HighlightProvider = ({ children }) => {
  const [highlightId, setHighlightIdState] = useState(null);

  const setHighlightId = useCallback((id) => {
    setHighlightIdState(id);
    // Auto-clear highlight after 2.5 seconds
    if (id) {
      setTimeout(() => {
        setHighlightIdState((current) => (current === id ? null : current));
      }, 2500);
    }
  }, []);

  const clearHighlight = useCallback(() => {
    setHighlightIdState(null);
  }, []);

  return (
    <HighlightContext.Provider value={{ highlightId, setHighlightId, clearHighlight }}>
      {children}
    </HighlightContext.Provider>
  );
};

export const useHighlight = () => useContext(HighlightContext);
