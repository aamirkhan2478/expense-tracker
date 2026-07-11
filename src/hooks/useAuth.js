"use client";

import { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

/**
 * Listens for session expiry events from axios interceptors
 * and triggers logout through the auth context.
 */
export function useSessionExpiryListener() {
  const { logout } = useAuth();

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
}

/**
 * Hook to check if current user is authenticated.
 * Returns boolean based on auth context state.
 */
export function useIsAuthenticated() {
  const { isAuthenticated, isLoading } = useAuth();
  return { isAuthenticated, isLoading };
}

/**
 * Hook to get current user data.
 */
export function useCurrentUser() {
  const { user, isLoading } = useAuth();
  return { user, isLoading };
}

/**
 * Legacy compatibility hook for existing components.
 * Wraps the new auth context for backward compatibility.
 */
export function useAuthActions() {
  const { login, register, logout, isLoading } = useAuth();
  return { login, register, logout, isLoading };
}
