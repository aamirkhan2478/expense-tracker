"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useRouter, usePathname } from "next/navigation";
import { useToast } from "@chakra-ui/react";
import axiosInstance from "@/utils/axiosInstance";

// ─── Auth Context ────────────────────────────────────────────────

const AuthContext = createContext(null);

// ─── Constants ───────────────────────────────────────────────────

const TOKEN_KEY = "token";
const REFRESH_TOKEN_KEY = "refreshToken";
const USER_KEY = "user";
const REMEMBER_ME_KEY = "rememberMe";
const SESSION_WARNING_SHOWN_KEY = "__spendwise_session_warning_shown__";
const SESSION_EXPIRED_SHOWN_KEY = "__spendwise_session_expired_toast_shown__";

// ─── Cookie Helpers ──────────────────────────────────────────────

/**
 * Set a browser cookie.
 * @param {string} name
 * @param {string} value
 * @param {number} maxAgeSeconds
 */
function setCookie(name, value, maxAgeSeconds) {
  if (typeof document === "undefined") return;
  const isProd = process.env.NODE_ENV === "production";
  const secure = isProd ? "; Secure" : "";
  const maxAge = maxAgeSeconds ? `; Max-Age=${maxAgeSeconds}` : "";
  document.cookie = `${name}=${encodeURIComponent(value)}${maxAge}${secure}; Path=/; SameSite=Lax`;
}

/**
 * Delete a browser cookie.
 * @param {string} name
 */
function deleteCookie(name) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=; Max-Age=0; Path=/; SameSite=Lax`;
}

// ─── Storage Helpers ─────────────────────────────────────────────

function getStoredToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

function getStoredRefreshToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
}

function getStoredUser() {
  if (typeof window === "undefined") return null;
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
}

function decodeJwtPayload(token) {
  try {
    if (!token || token.split(".").length !== 3) return null;
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

function isTokenExpired(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return true;
  return payload.exp * 1000 < Date.now() + 60000;
}

function getTokenExpiryTime(token) {
  const payload = decodeJwtPayload(token);
  if (!payload || !payload.exp) return null;
  return payload.exp * 1000;
}

// ─── Provider ────────────────────────────────────────────────────

export function AuthProvider({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();

  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const isLoggingOutRef = useRef(false);
  const refreshPromiseRef = useRef(null);
  const warningTimeoutRef = useRef(null);
  const expiryIntervalRef = useRef(null);

  // ─── Initialize Auth State ──
  useEffect(() => {
    const token = getStoredToken();
    const storedUser = getStoredUser();

    if (token && storedUser && !isTokenExpired(token)) {
      setUser(storedUser);
      setIsAuthenticated(true);
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

      // Sync the regular cookie from localStorage (production recovery)
      const maxAge = 24 * 60 * 60;
      setCookie("_token", token, maxAge);
    } else if (token && isTokenExpired(token)) {
      clearAuthData();
    }

    setIsLoading(false);
  }, []);

  // ─── Session Expiry Warning & Detection ──
  useEffect(() => {
    if (!isAuthenticated) {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (expiryIntervalRef.current) clearInterval(expiryIntervalRef.current);
      return;
    }

    const token = getStoredToken();
    if (!token) return;

    const expiryTime = getTokenExpiryTime(token);
    if (!expiryTime) return;

    const now = Date.now();
    const timeUntilExpiry = expiryTime - now;
    const warningTime = Math.max(timeUntilExpiry - 5 * 60 * 1000, 0);

    if (warningTime > 0) {
      warningTimeoutRef.current = setTimeout(() => {
        if (!sessionStorage.getItem(SESSION_WARNING_SHOWN_KEY)) {
          toast({
            title: "Session expiring soon",
            description: "Your session will expire in 5 minutes. Please save your work.",
            status: "warning",
            duration: 10000,
            isClosable: true,
            position: "top-right",
          });
          sessionStorage.setItem(SESSION_WARNING_SHOWN_KEY, "true");
        }
      }, warningTime);
    }

    expiryIntervalRef.current = setInterval(() => {
      const currentToken = getStoredToken();
      if (currentToken && isTokenExpired(currentToken)) {
        logout({ sessionExpired: true });
      }
    }, 30000);

    return () => {
      if (warningTimeoutRef.current) clearTimeout(warningTimeoutRef.current);
      if (expiryIntervalRef.current) clearInterval(expiryIntervalRef.current);
    };
  }, [isAuthenticated, toast]);

  // ─── Cross-Tab Sync ──
  useEffect(() => {
    if (typeof window === "undefined") return;

    let bc = null;
    try {
      bc = new BroadcastChannel("spendwise_auth");
      bc.onmessage = (event) => {
        if (event.data?.type === "LOGOUT") {
          handleCrossTabLogout();
        }
        if (event.data?.type === "LOGIN") {
          handleCrossTabLogin(event.data);
        }
      };
    } catch {
      bc = null;
    }

    const handleStorage = (event) => {
      if (event.key === "__spendwise_logout__") {
        handleCrossTabLogout();
      }
      if (event.key === "__spendwise_login__") {
        try {
          const data = JSON.parse(event.newValue);
          handleCrossTabLogin(data);
        } catch {
          // Ignore parse errors
        }
      }
    };

    window.addEventListener("storage", handleStorage);

    return () => {
      if (bc) bc.close();
      window.removeEventListener("storage", handleStorage);
    };
  }, []);

  function handleCrossTabLogout() {
    if (isLoggingOutRef.current) return;
    isLoggingOutRef.current = true;

    clearAuthData({ skipBroadcast: true });
    setUser(null);
    setIsAuthenticated(false);

    const protectedRoutes = ["/dashboard", "/income", "/expense", "/category", "/settings", "/reports"];
    if (protectedRoutes.some((route) => pathname?.startsWith(route))) {
      window.location.href = "/auth?session_expired=true";
    }

    isLoggingOutRef.current = false;
  }

  function handleCrossTabLogin(data) {
    if (data?.token && data?.user) {
      setUser(data.user);
      setIsAuthenticated(true);
      axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${data.token}`;
      setCookie("_token", data.token, 24 * 60 * 60);
    }
  }

  // ─── Clear Auth Data ──
  const clearAuthData = useCallback((options = {}) => {
    const { skipBroadcast = false } = options;

    if (typeof window === "undefined") return;

    if (window.__authAbortController__) {
      window.__authAbortController__.abort();
      window.__authAbortController__ = null;
    }

    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    sessionStorage.removeItem(SESSION_WARNING_SHOWN_KEY);
    sessionStorage.removeItem(SESSION_EXPIRED_SHOWN_KEY);

    delete axiosInstance.defaults.headers.common["Authorization"];

    // Clear ALL cookies
    deleteCookie("token");
    deleteCookie("_token");

    if (!skipBroadcast) {
      try {
        const bc = new BroadcastChannel("spendwise_auth");
        bc.postMessage({ type: "LOGOUT" });
        bc.close();
      } catch {
        localStorage.setItem("__spendwise_logout__", Date.now().toString());
        localStorage.removeItem("__spendwise_logout__");
      }
    }
  }, []);

  // ─── Logout ──
  const logout = useCallback(
    async (options = {}) => {
      const { sessionExpired = false, skipRedirect = false, redirectTo = "/auth" } = options;

      if (isLoggingOutRef.current) return;
      isLoggingOutRef.current = true;

      try {
        const token = getStoredToken();
        if (token) {
          await axiosInstance.post("/api/auth/logout", null, {
            headers: { Authorization: `Bearer ${token}` },
          }).catch(() => {});
        }
      } catch {
        // Ignore logout API errors
      }

      if (sessionExpired && !sessionStorage.getItem(SESSION_EXPIRED_SHOWN_KEY)) {
        toast({
          title: "Session expired",
          description: "Your session has expired for security reasons. Please sign in again.",
          status: "warning",
          duration: 6000,
          isClosable: true,
          position: "top-right",
        });
        sessionStorage.setItem(SESSION_EXPIRED_SHOWN_KEY, "true");
      }

      clearAuthData();
      setUser(null);
      setIsAuthenticated(false);

      if (!skipRedirect) {
        const currentPath = pathname + (typeof window !== "undefined" ? window.location.search : "");
        const isAuthPage = currentPath.startsWith("/auth");

        if (!isAuthPage) {
          const url = `${redirectTo}?redirect=${encodeURIComponent(currentPath)}${sessionExpired ? "&session_expired=true" : ""}`;
          window.location.replace(url);
        } else {
          window.location.replace(redirectTo);
        }
      }

      setTimeout(() => {
        isLoggingOutRef.current = false;
      }, 500);
    },
    [clearAuthData, toast, pathname]
  );

  // ─── Login ──
  const login = useCallback(
    async (credentials) => {
      try {
        const response = await axiosInstance.post("/api/auth/login", credentials);
        const { token, refreshToken, user: userData } = response.data;

        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(userData));

        if (refreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
        }

        if (credentials.rememberMe) {
          localStorage.setItem(REMEMBER_ME_KEY, "true");
        } else {
          localStorage.removeItem(REMEMBER_ME_KEY);
        }

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Sync regular cookie for middleware compatibility
        const maxAge = credentials.rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
        setCookie("_token", token, maxAge);

        setUser(userData);
        setIsAuthenticated(true);

        sessionStorage.removeItem(SESSION_WARNING_SHOWN_KEY);
        sessionStorage.removeItem(SESSION_EXPIRED_SHOWN_KEY);

        try {
          const bc = new BroadcastChannel("spendwise_auth");
          bc.postMessage({ type: "LOGIN", token, user: userData });
          bc.close();
        } catch {
          localStorage.setItem("__spendwise_login__", JSON.stringify({ token, user: userData }));
          localStorage.removeItem("__spendwise_login__");
        }

        return { success: true, data: response.data };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || "Login failed. Please try again.",
          code: error.response?.data?.code,
        };
      }
    },
    []
  );

  // ─── Register ──
  const register = useCallback(
    async (userData) => {
      try {
        const response = await axiosInstance.post("/api/auth", userData);
        return { success: true, data: response.data };
      } catch (error) {
        return {
          success: false,
          error: error.response?.data?.error || "Registration failed. Please try again.",
        };
      }
    },
    []
  );

  // ─── Refresh Token ──
  const refreshToken = useCallback(async () => {
    if (refreshPromiseRef.current) {
      return refreshPromiseRef.current;
    }

    const storedRefreshToken = getStoredRefreshToken();
    if (!storedRefreshToken) {
      return { success: false, error: "No refresh token available" };
    }

    refreshPromiseRef.current = (async () => {
      try {
        setIsRefreshing(true);
        const response = await axiosInstance.post("/api/auth/refresh", {
          refreshToken: storedRefreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem(TOKEN_KEY, token);
        if (newRefreshToken) {
          localStorage.setItem(REFRESH_TOKEN_KEY, newRefreshToken);
        }

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        // Sync regular cookie
        setCookie("_token", token, 24 * 60 * 60);

        setIsRefreshing(false);
        refreshPromiseRef.current = null;

        return { success: true, token };
      } catch (error) {
        setIsRefreshing(false);
        refreshPromiseRef.current = null;
        logout({ sessionExpired: true });
        return { success: false, error: "Session expired" };
      }
    })();

    return refreshPromiseRef.current;
  }, [logout]);

  // ─── Update User ──
  const updateUser = useCallback((userData) => {
    setUser(userData);
    if (typeof window !== "undefined") {
      localStorage.setItem(USER_KEY, JSON.stringify(userData));
    }
  }, []);

  // ─── Value ──
  const value = {
    user,
    isAuthenticated,
    isLoading,
    isRefreshing,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ──

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
