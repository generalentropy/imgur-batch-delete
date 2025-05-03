import axios from "axios";
import ora from "ora";
import { API_V3, delayMs, maxRetries } from "../config/constants.js";
import { fetchPaginated } from "./fetch.js";
import { sleep } from "../utils/sleep.js";
import { doDelete } from "../config/cli.js";

/**
 * Récupère toutes les images d'un compte (séquentiel, pour éviter les problèmes de rate limit)
 * En dry-run (doDelete=false) on saute entièrement la boucle albums.
 * @param {Object} headers - En-têtes HTTP avec token d'authentification
 * @returns {Promise<Array>} Liste de toutes les images
 */
export async function getAllImages(headers) {
  const spinner = ora("Listing images...").start();
  // en dry-run on récupère quand même les standalone pour le count, sans pause
  const standalone = await fetchPaginated("/account/me/images", headers);

  let inAlbums = [];
  if (doDelete) {
    // en delete mode on collecte les images d'album, avec pause pour rate-limit
    const albums = await fetchPaginated("/account/me/albums", headers);
    for (const { id: albumId } of albums) {
      const res = await axios.get(`${API_V3}/album/${albumId}/images`, {
        headers,
      });
      const imgs = Array.isArray(res.data.data) ? res.data.data : [];
      if (imgs.length) inAlbums.push(...imgs);
      await sleep(delayMs);
    }
  }

  const images = [...standalone, ...inAlbums];
  spinner.succeed(`Found ${images.length} images`);
  return images;
}

/**
 * Traite chaque image :
 * - dry-run (doDelete=false) : on simule tout en une fois, sans boucle ni sleep
 * - delete mode : logique existante avec retry + delay entre chaque delete
 * @param {Array} images - Liste des images à traiter
 * @param {Object} headers - En-têtes HTTP
 * @returns {Promise<Object>} Statistiques des opérations
 */
export async function processImages(images, headers) {
  const stats = {
    found: images.length,
    simulated: 0,
    deleted: 0,
    failed: 0,
  };

  if (!doDelete) {
    // DRY MODE : un seul spinner, aucun sleep
    const spinner = ora(`Simulating delete of ${stats.found} images`).start();
    stats.simulated = stats.found;
    spinner.succeed(`Simulated delete ${stats.found} images`);
    return stats;
  }

  // DELETE MODE : on applique delayMs entre chaque delete
  for (const { id } of images) {
    const spinner = ora(`Deleting ${id}`).start();
    let attempt = 0;

    while (attempt <= maxRetries) {
      try {
        await axios.delete(`${API_V3}/image/${id}`, { headers });
        spinner.succeed(`Deleted ${id}`);
        stats.deleted++;
        break;
      } catch (e) {
        const status = e.response?.status;
        if (status === 429 && attempt < maxRetries) {
          const retryAfter = e.response.headers["retry-after"]
            ? parseInt(e.response.headers["retry-after"], 10) * 1000
            : 5000;
          spinner.warn(
            ` Rate limit, retrying ${id} after ${retryAfter / 1000}s`
          );
          await sleep(retryAfter);
          attempt++;
          continue;
        }
        spinner.fail(` Failed delete ${id}`);
        stats.failed++;
        break;
      }
    }

    // pause globale pour respecter le rate limit
    await sleep(delayMs);
  }

  return stats;
}
