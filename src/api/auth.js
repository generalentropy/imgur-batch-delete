import axios from "axios";
import { API_BASE } from "../config/constants.js";

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

  const { data } = await axios.post(
    `${API_BASE}/oauth2/token`,
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (!data.access_token) {
    throw new Error(`Token invalide : ${JSON.stringify(data)}`);
  }
  return data.access_token;
}
