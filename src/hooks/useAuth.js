"use client";

import { useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@chakra-ui/react";
import { useMutation, useQueryClient } from "react-query";
import axiosInstance from "@/utils/axiosInstance";
import {
  logout as centralizedLogout,
  isTokenExpired,
  getAuthToken,
} from "@/utils/auth";

// ─── Legacy auth mutations (sign up / sign in) ────────────────────

const signup = (values) => {
  return axiosInstance.post("/api/auth", values);
};

const signin = (values) => {
  return axiosInstance.post("/api/auth/login", values);
};

export const useSignUpUser = (onSuccess, onError) => {
  return useMutation(signup, { onError, onSuccess });
};

export const useSignInUser = (onSuccess, onError) => {
  return useMutation(signin, { onError, onSuccess });
};

// ─── Centralized auth hook ────────────────────────────────────────

/**
 * Production-ready authentication hook.
 * Provides centralized logout, token expiry checks, and cross-tab sync.
 */
export function useAuth() {
  const router = useRouter();
  const toast = useToast();
  const queryClient = useQueryClient();

  // Expose toast to axios interceptors via a global window property
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.__chakra_toast__ = toast;
    }
  }, [toast]);

  /**
   * Centralized logout.
   * Clears all auth data, caches, and redirects to login.
   */
  const doLogout = useCallback(
    (options = {}) => {
      centralizedLogout({
        queryClient,
        showToast: toast,
        ...options,
      });
    },
    [queryClient, toast]
  );

  /**
   * Check if the user is currently authenticated
   * and the token is not expired.
   */
  const isAuthenticated = useCallback(() => {
    const token = getAuthToken();
    return !!token && !isTokenExpired(token);
  }, []);

  return { logout: doLogout, isAuthenticated };
}

/**
 * Cross-tab authentication synchronization.
 * Listens for logout events from other browser tabs and logs this tab out too.
 */
export function useCrossTabAuthSync() {
  const { logout } = useAuth();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let bc = null;

    // Primary: BroadcastChannel API
    try {
      bc = new BroadcastChannel("spendwise_auth");
      bc.onmessage = (event) => {
        if (event.data?.type === "LOGOUT") {
          // Logout without redirect — the tab that initiated logout already did
          logout({ skipRedirect: true });
          // Then force a reload so the UI updates cleanly
          window.location.reload();
        }
      };
    } catch {
      // BroadcastChannel not supported — fallback below
      bc = null;
    }

    // Fallback: storage event (works across all modern browsers)
    const handleStorage = (event) => {
      if (event.key === "__spendwise_logout__") {
        logout({ skipRedirect: true });
        window.location.reload();
      }
    };
    window.addEventListener("storage", handleStorage);

    return () => {
      if (bc) {
        bc.close();
      }
      window.removeEventListener("storage", handleStorage);
    };
  }, [logout]);
}
