// import axios from "axios";
import axios from "axios";
import { API_BASE } from "../config/constants.js";
import { apiClient } from "./apiClient.js";
import qs from "qs";

/**
 * Récupère un access token via le refresh token
 * @returns {Promise<string>} Token d'accès
 * @throws {Error} Si la récupération du token échoue
 */

export async function getAccessToken() {
  const params = new URLSearchParams({
    refresh_token: process.env.IMGUR_REFRESH_TOKEN,
    client_id: process.env.IMGUR_CLIENT_ID,
    client_secret: process.env.IMGUR_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const { data } = await apiClient.post(
    `${API_BASE}/oauth2/token`,
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (!data.access_token) {
    throw new Error(` Token invalide : ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

let accessToken = process.env.IMGUR_ACCESS_TOKEN;
let refreshToken = process.env.IMGUR_REFRESH_TOKEN;

// Renvoie un token valide, refresh si nécessaire
export async function getAuthHeader() {
  // (Optionnel) vérifier ici la date d’expiration et refresh avant qu’il n’expire
  if (!accessToken) {
    const resp = await axios.post(
      "https://api.imgur.com/oauth2/token",
      qs.stringify({
        refresh_token: refreshToken,
        client_id: process.env.IMGUR_CLIENT_ID,
        client_secret: process.env.IMGUR_CLIENT_SECRET,
        grant_type: "refresh_token",
      })
    );
    accessToken = resp.data.access_token;
    refreshToken = resp.data.refresh_token;
  }
  return { Authorization: `Bearer ${accessToken}` };
}
