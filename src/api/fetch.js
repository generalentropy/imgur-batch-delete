import axios from "axios";
import { API_V3, delayMs } from "../config/constants.js";
import { sleep } from "../utils/sleep.js";

/**
 * Récupère tous les items paginés d'un endpoint
 * @param {string} path - Chemin de l'API
 * @param {Object} headers - En-têtes HTTP avec token d'authentification
 * @returns {Promise<Array>} Liste des items récupérés
 */
export async function fetchPaginated(path, headers) {
  const items = [];
  let page = 0;

  while (true) {
    const res = await axios.get(`${API_V3}${path}/${page}`, { headers });
    const list = Array.isArray(res.data.data) ? res.data.data : [];
    if (list.length === 0) break;
    items.push(...list);
    page++;
    await sleep(delayMs);
  }

  return items;
}
