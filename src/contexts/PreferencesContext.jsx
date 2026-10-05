"use client";

import { createContext, useContext, useState, useEffect, useCallback, useRef } from "react";
import axiosInstance from "@/utils/axiosInstance";

const PreferencesContext = createContext(null);

const DEFAULT_PREFERENCES = {
  dateFormat: "MM/DD/YYYY",
  itemsPerPage: 10,
};

function getUserId() {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user).id : null;
  } catch {
    return null;
  }
}

export function PreferencesProvider({ children }) {
  const [preferences, setPreferences] = useState(DEFAULT_PREFERENCES);
  const [loaded, setLoaded] = useState(false);
  const [loading, setLoading] = useState(false);
  const lastUserIdRef = useRef(null);

  const fetchPreferences = useCallback(async (userId) => {
    if (!userId) return;
    lastUserIdRef.current = userId;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/api/user/preferences/settings`);
      if (res.data?.preferences) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...res.data.preferences });
      }
    } catch {
      setPreferences(DEFAULT_PREFERENCES);
    } finally {
      setLoaded(true);
      setLoading(false);
    }
  }, []);

  // Watch for auth state changes via localStorage
  useEffect(() => {
    const userId = getUserId();
    if (userId && userId !== lastUserIdRef.current) {
      setLoaded(false);
      fetchPreferences(userId);
    } else if (!userId) {
      setPreferences(DEFAULT_PREFERENCES);
      setLoaded(false);
      lastUserIdRef.current = null;
    }
  }, [fetchPreferences]);

  // Listen for storage events (cross-tab login/logout)
  useEffect(() => {
    const handleStorage = () => {
      const userId = getUserId();
      if (userId && userId !== lastUserIdRef.current) {
        setLoaded(false);
        fetchPreferences(userId);
      } else if (!userId) {
        setPreferences(DEFAULT_PREFERENCES);
        setLoaded(false);
        lastUserIdRef.current = null;
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [fetchPreferences]);

  const updatePreferences = useCallback(async (userId, updates) => {
    if (!userId) return false;
    try {
      const res = await axiosInstance.post("/api/user/preferences/settings", {
        preferences: updates,
      });
      if (res.data?.preferences) {
        setPreferences({ ...DEFAULT_PREFERENCES, ...res.data.preferences });
      }
      return true;
    } catch {
      return false;
    }
  }, []);

  return (
    <PreferencesContext.Provider value={{ preferences, loaded, loading, fetchPreferences, updatePreferences }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePreferences must be used within PreferencesProvider");
  return ctx;
}

export default PreferencesContext;
