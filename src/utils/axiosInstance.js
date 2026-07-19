import axios from "axios";

const baseURL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 30 second timeout
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request Interceptor ──────────────────────────────────────────
axiosInstance.interceptors.request.use(
  function (config) {
    if (typeof window === "undefined") return config;

    // Get token from localStorage
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Attach abort signal if one exists
    if (window.__authAbortController__) {
      config.signal = window.__authAbortController__.signal;
    }

    return config;
  },
  function (error) {
    return Promise.reject(error);
  }
);

// ─── Auth Endpoints that should NEVER trigger session expiry ──────
const AUTH_ENDPOINTS = [
  "/api/auth/login",
  "/api/auth", // registration
  "/api/auth/forgot-password",
  "/api/auth/reset-password",
  "/api/auth/verify-email",
  "/api/auth/resend-verification",
];

function isAuthEndpoint(url) {
  return AUTH_ENDPOINTS.some((endpoint) => url?.includes(endpoint));
}

// ─── Response Interceptor ─────────────────────────────────────────
// Track if we're currently refreshing to prevent multiple refresh requests
let isRefreshing = false;
let refreshSubscribers = [];

function onTokenRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  async function (error) {
    const originalRequest = error.config;

    // Network errors (no response object)
    if (!error.response) {
      if (error.code === "ERR_CANCELED" || error.code === "ECONNABORTED") {
        return Promise.reject(error);
      }
      return Promise.reject({
        ...error,
        message: "Network error. Please check your connection and try again.",
      });
    }

    const status = error.response.status;

    // ── Auth endpoints: never treat auth failures as session expiry ──
    if (isAuthEndpoint(originalRequest.url)) {
      return Promise.reject(error);
    }

    // ── 401 Unauthorized — token expired ──
    if (status === 401 && !originalRequest._retry) {
      // Only attempt refresh if there's actually a stored token
      const existingToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (!existingToken) {
        return Promise.reject(error);
      }

      if (originalRequest.url?.includes("/api/auth/refresh")) {
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
        }
        return Promise.reject(error);
      }

      originalRequest._retry = true;

      if (isRefreshing) {
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(axiosInstance(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axiosInstance.post("/api/auth/refresh", {
          refreshToken,
        });

        const { token, refreshToken: newRefreshToken } = response.data;

        localStorage.setItem("token", token);
        if (newRefreshToken) {
          localStorage.setItem("refreshToken", newRefreshToken);
        }

        axiosInstance.defaults.headers.common["Authorization"] = `Bearer ${token}`;

        onTokenRefreshed(token);

        originalRequest.headers.Authorization = `Bearer ${token}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        onTokenRefreshed(null);
        if (typeof window !== "undefined") {
          window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // ── 403 Forbidden — token rejected (only if authenticated) ──
    if (status === 403) {
      const existingToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      if (existingToken && typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("auth:sessionExpired"));
      }
      return Promise.reject(error);
    }

    // ── 429 Too Many Requests ──
    if (status === 429) {
      return Promise.reject({
        ...error,
        message: error.response.data?.error || "Too many requests. Please try again later.",
      });
    }

    // ── 423 Locked (account lockout) ──
    if (status === 423) {
      return Promise.reject({
        ...error,
        message: error.response.data?.error || "Account temporarily locked. Please try again later.",
      });
    }

    // ── 504 Gateway Timeout ──
    if (status === 504) {
      return Promise.reject({
        ...error,
        message: "Server timeout. Please try again.",
      });
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
