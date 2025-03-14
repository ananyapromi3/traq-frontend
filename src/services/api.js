import axios from "axios";

const api = axios.create({
  baseURL: "https://traq.duckdns.org/api/v3",
  headers: {
    "Content-Type": "application/json",
    Accept: "*/*",
  },
  withCredentials: true, // This is crucial for cookies to be sent and received
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    config.referrerPolicy = "strict-origin-when-cross-origin";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
