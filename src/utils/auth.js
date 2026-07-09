"use client";

// ─── Centralized Authentication Utilities ─────────────────────────
// Production-ready session management with deduplication,
// cross-tab sync, and secure cleanup.

let isLoggingOut = false;

/**
 * Decode a JWT token WITHOUT verifying its signature.
 * Returns the payload object or null if invalid.
 */
export function decodeJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    if (!base64Url) return null;
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

/**
 * Check whether the JWT access token has expired.
 * Returns true if expired or invalid.
 */
export function isTokenExpired(token) {
  const payload = decodeJwt(token);
  if (!payload || !payload.exp) return true;
  // exp is in seconds; Date.now() is in milliseconds
  return payload.exp * 1000 < Date.now();
}

/**
 * Get the stored access token from localStorage.
 */
export function getAuthToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("token");
}

/**
 * Completely remove ALL authentication-related data from the browser.
 * No stale data should remain after logout.
 */
export function clearAllAuthData() {
  if (typeof window === "undefined") return;

  // LocalStorage
  localStorage.removeItem("token");
  localStorage.removeItem("user");

  // SessionStorage
  sessionStorage.removeItem("token");
  sessionStorage.removeItem("user");

  // Cookies (client-accessible)
  document.cookie = "token=; path=/; max-age=0; SameSite=Strict";

  // Broadcast logout to other tabs
  try {
    const bc = new BroadcastChannel("spendwise_auth");
    bc.postMessage({ type: "LOGOUT" });
    bc.close();
  } catch {
    // Fallback: storage event
    localStorage.setItem("__spendwise_logout__", Date.now().toString());
    localStorage.removeItem("__spendwise_logout__");
  }
}

/**
 * Clear React Query cache (and any other client caches).
 * Must be called from a component that has access to the queryClient.
 */
export function clearClientCache(queryClient) {
  if (queryClient) {
    queryClient.clear();
    queryClient.removeQueries();
  }
}

/**
 * Centralized logout handler with deduplication.
 *
 * @param {Object} options
 * @param {import('@tanstack/react-query').QueryClient} [options.queryClient] — React Query client to clear
 * @param {Function} [options.showToast] — Chakra UI toast function for notifications
 * @param {boolean} [options.sessionExpired=false] — true if triggered by 401/JWT expiry
 * @param {string} [options.redirectTo="/auth"] — path to redirect after logout
 * @param {boolean} [options.skipRedirect=false] — if true, only clear data without redirect
 */
export function logout(options = {}) {
  const {
    queryClient,
    showToast,
    sessionExpired = false,
    redirectTo = "/auth",
    skipRedirect = false,
  } = options;

  // ── Deduplication: prevent multiple simultaneous logouts ──
  if (isLoggingOut) return;
  isLoggingOut = true;

  // ── Cancel pending API requests ──
  if (typeof window !== "undefined" && window.__authAbortController__) {
    window.__authAbortController__.abort();
    window.__authAbortController__ = null;
  }

  // ── Show single toast notification ──
  if (showToast && sessionExpired) {
    // Prevent duplicate toasts by checking a flag
    if (!window.__spendwise_session_expired_toast_shown__) {
      window.__spendwise_session_expired_toast_shown__ = true;
      showToast({
        title: "Session expired",
        description: "Your login session has expired for security reasons. Please sign in again.",
        status: "warning",
        duration: 5000,
        isClosable: true,
        position: "top-right",
      });
      // Reset flag after a delay so future sessions can show it again
      setTimeout(() => {
        window.__spendwise_session_expired_toast_shown__ = false;
      }, 6000);
    }
  }

  // ── Clear all auth data ──
  clearAllAuthData();

  // ── Clear client caches ──
  if (queryClient) {
    clearClientCache(queryClient);
  }

  // ── Redirect ──
  if (!skipRedirect && typeof window !== "undefined") {
    // Preserve intended destination for post-login redirect
    const currentPath = window.location.pathname + window.location.search;
    const isAuthPage = currentPath.startsWith("/auth");
    if (!isAuthPage) {
      const redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}`;
      window.location.replace(redirectUrl);
    } else {
      window.location.replace(redirectTo);
    }
  }

  // ── Release lock after navigation starts ──
  setTimeout(() => {
    isLoggingOut = false;
  }, 500);
}

/**
 * Reset the logout deduplication lock.
 * Useful in tests or after a hard refresh.
 */
export function resetLogoutLock() {
  isLoggingOut = false;
  if (typeof window !== "undefined") {
    window.__spendwise_session_expired_toast_shown__ = false;
  }
}

/**
 * Create a fresh AbortController for authenticated requests.
 * The controller can be aborted during logout to cancel pending requests.
 */
export function createAuthAbortController() {
  if (typeof window === "undefined") return null;
  const controller = new AbortController();
  window.__authAbortController__ = controller;
  return controller;
}
