"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@chakra-ui/react";

/**
 * Client-side auth initialization and session management.
 * Handles session expiry events and auth state restoration.
 */
export default function AuthInitializer({ children }) {
  const { logout, isAuthenticated } = useAuth();
  const toast = useToast();

  // Listen for session expiry events from axios interceptors
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleSessionExpired = () => {
      logout({ sessionExpired: true });
    };

    window.addEventListener("auth:sessionExpired", handleSessionExpired);

    return () => {
      window.removeEventListener("auth:sessionExpired", handleSessionExpired);
    };
  }, [logout]);

  // Handle session_expired query param on auth pages
  useEffect(() => {
    if (typeof window === "undefined") return;

    const params = new URLSearchParams(window.location.search);
    if (params.get("session_expired") === "true" && !isAuthenticated) {
      toast({
        title: "Session expired",
        description: "Your session has expired. Please sign in again.",
        status: "warning",
        duration: 6000,
        isClosable: true,
        position: "top-right",
      });
      // Remove the param from URL without reloading
      const url = new URL(window.location.href);
      url.searchParams.delete("session_expired");
      window.history.replaceState({}, "", url.toString());
    }
  }, [isAuthenticated, toast]);

  return children;
}
