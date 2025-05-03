// src/config/apiClient.js
import axios from "axios";
import { sleep } from "../utils/sleep.js";
import { API_V3 } from "../config/constants.js";

export const apiClient = axios.create({
  baseURL: API_V3,
  timeout: 30_000,
});

// Interceptor “retry up to maxRetries on 429”
apiClient.interceptors.response.use(
  (response) => {
    // console.log("✅ HTTP %s %s", response.status, response.config.url);
    // console.log("→ data:", response.data);
    return response;
  },
  async (error) => {
    const { config, response } = error;
    const maxRetries = config.maxRetries ?? 3;
    config.__retryCount = config.__retryCount || 0;

    if (response?.status === 429 && config.__retryCount < maxRetries) {
      const retryAfter =
        parseInt(response.headers["retry-after"] || "5", 10) * 1000;
      config.__retryCount++;
      // stopAndPersist ici si vous voulez logger via ora
      await sleep(retryAfter);
      return apiClient.request(config);
    }

    // On a fait maxRetries ou ce n'est pas un 429 => on rejette
    return Promise.reject(error);
  }
);
