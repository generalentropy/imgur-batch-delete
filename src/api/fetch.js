import { apiClient } from "./apiClient.js";

/**
 * Récupère tous les items paginés d'un endpoint, sans pause fixe.
 * @param {string} path    – Chemin relatif (ex. "/account/me/images")
 * @param {Object} headers – En-têtes HTTP avec token
 * @returns {Promise<Array>}
 */
export async function fetchPaginated(path, headers) {
  const items = [];
  let page = 0;

  while (true) {
    const res = await apiClient.get(path, {
      headers,
      params: { page },
    });
    const list = Array.isArray(res.data.data) ? res.data.data : [];
    if (list.length === 0) break;
    items.push(...list);
    page++;
  }

  return items;
}
