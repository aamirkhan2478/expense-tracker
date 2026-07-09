import axios from "axios";
import { getAuthToken, isTokenExpired, logout } from "./auth";

const baseURL = process.env.NEXTAUTH_URL;

const axiosInstance = axios.create({
  baseURL,
});

// ─── Request Interceptor ──────────────────────────────────────────
// 1. Inject the Authorization header from localStorage
// 2. Check JWT expiry BEFORE sending the request
// 3. Attach an AbortSignal so pending requests can be cancelled on logout
axiosInstance.interceptors.request.use(
  function (config) {
    if (typeof window === "undefined") return config;

    const token = getAuthToken();

    // If token exists, attach it
    if (token) {
      // Check expiry proactively — if expired, abort this request
      // and trigger logout immediately without hitting the server
      if (isTokenExpired(token)) {
        logout({
          sessionExpired: true,
          showToast: window.__chakra_toast__, // set by a hook in layout
        });
        // Return a promise that never resolves so the request is dropped
        return new Promise(() => {});
      }

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

// ─── Response Interceptor ─────────────────────────────────────────
// Detect 401 / 403 from the backend and trigger centralized logout.
axiosInstance.interceptors.response.use(
  function (response) {
    return response;
  },
  function (error) {
    // Network errors (no response object)
    if (!error.response) {
      return Promise.reject(error);
    }

    const status = error.response.status;

    // 401 Unauthorized — token is expired or invalid
    // 403 Forbidden — token rejected (e.g. user deleted, token revoked)
    if (status === 401 || status === 403) {
      logout({
        sessionExpired: true,
        showToast: window.__chakra_toast__,
      });
      // Reject so the calling code knows the request failed
      return Promise.reject(error);
    }

    // 504 Gateway Timeout — reload the page
    if (status === 504) {
      window.location.reload();
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
