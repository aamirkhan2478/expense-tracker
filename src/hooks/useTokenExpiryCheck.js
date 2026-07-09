"use client";

import { useEffect } from "react";
import { isTokenExpired, getAuthToken } from "@/utils/auth";
import { useAuth } from "@/hooks/useAuth";

/**
 * Periodically checks if the JWT token has expired.
 * Runs on window focus and every 60 seconds.
 * Triggers automatic logout if the token is expired.
 */
export function useTokenExpiryCheck() {
  const { logout } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    const check = () => {
      const token = getAuthToken();
      if (token && isTokenExpired(token)) {
        logout({ sessionExpired: true });
      }
    };

    // Check immediately on mount
    check();

    // Check when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        check();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Periodic check every 60 seconds
    const interval = setInterval(check, 60000);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
      clearInterval(interval);
    };
  }, [logout]);
}
