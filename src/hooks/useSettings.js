"use client";

import { useState, useEffect, useCallback } from "react";

const DEFAULT_SETTINGS = {
  currency: "$",
  currencyCode: "USD",
  dateFormat: "MM/DD/YYYY",
  itemsPerPage: 5,
};

const STORAGE_KEY = "spendwise-settings";

export const CURRENCIES = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "PKR", symbol: "₨", name: "Pakistani Rupee" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CHF", symbol: "Fr", name: "Swiss Franc" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "BRL", symbol: "R$", name: "Brazilian Real" },
  { code: "SGD", symbol: "S$", name: "Singapore Dollar" },
];

export function useSettings() {
  const [settings, setSettings] = useState(DEFAULT_SETTINGS);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed = JSON.parse(stored);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
        }
      } catch (e) {
        console.error("Failed to load settings", e);
      }
      setIsReady(true);
    }
  }, []);

  const updateSettings = useCallback((newSettings) => {
    setSettings((prev) => {
      const merged = { ...prev, ...newSettings };
      if (typeof window !== "undefined") {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      }
      return merged;
    });
  }, []);

  const resetSettings = useCallback(() => {
    setSettings(DEFAULT_SETTINGS);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_SETTINGS));
    }
  }, []);

  return { settings, updateSettings, resetSettings, isReady };
}

export function formatMoney(amount, settings) {
  if (amount === undefined || amount === null || amount === "") return `${settings?.currency || "$"}0`;
  const num = Number(amount);
  if (isNaN(num)) return `${settings?.currency || "$"}0`;
  return `${settings?.currency || "$"}${num.toLocaleString()}`;
}
