"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Periodically checks if the JWT token has expired.
 * Runs on window focus and every 60 seconds.
 * Triggers automatic logout if the token is expired.
 * 
 * Note: The AuthContext already handles expiry warnings and intervals,
 * but this hook adds visibilitychange detection for immediate checks
 * when the user returns to the tab.
 */
export function useTokenExpiryCheck() {
  const { logout, isAuthenticated } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined" || !isAuthenticated) return;

    const check = () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const base64Url = token.split(".")[1];
        if (!base64Url) return;
        const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
        const jsonPayload = decodeURIComponent(
          atob(base64)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join("")
        );
        const payload = JSON.parse(jsonPayload);

        if (payload.exp && payload.exp * 1000 < Date.now()) {
          logout({ sessionExpired: true });
        }
      } catch {
        // Invalid token - logout
        logout({ sessionExpired: true });
      }
    };

    // Check when user returns to the tab
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        check();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [logout, isAuthenticated]);
}
