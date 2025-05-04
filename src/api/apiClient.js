// apiClient.js
import axios from "axios";
import { getAuthHeader } from "./auth.js";
import axiosRetry from "axios-retry";

export const apiClient = axios.create({
  baseURL: "https://api.imgur.com/3",
  timeout: 10000,
});

// Intercepteur pour ajouter l’Authorization
apiClient.interceptors.request.use(async (config) => {
  const header = await getAuthHeader();
  config.headers = { ...config.headers, ...header };
  return config;
});

// Retry automatique sur 5xx et réseau
axiosRetry(apiClient, {
  retries: 3,
  retryDelay: axiosRetry.exponentialDelay,
  retryCondition: (err) =>
    axiosRetry.isNetworkOrIdempotentRequestError(err) ||
    err.response?.status >= 500,
});
