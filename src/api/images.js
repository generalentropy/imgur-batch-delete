// import axios from "axios";
import ora from "ora";
import { API_V3, delayMs, maxRetries } from "../config/constants.js";
import { fetchPaginated } from "./fetch.js";
import { sleep } from "../utils/sleep.js";
import { doDelete } from "../config/cli.js";
import { apiClient } from "./apiClient.js";

/**
 * Récupère toutes les images d'un compte (séquentiel pour éviter les 429).
 * Dry-run : on ne fait que compter.
 */
export async function getAllImages(headers) {
  const spinner = ora("Listing images…").start();

  // standalone
  const standalone = await fetchPaginated("/account/me/images", headers);

  let inAlbums = [];
  if (doDelete) {
    // albums
    const albums = await fetchPaginated("/account/me/albums", headers);
    for (const { id: albumId } of albums) {
      const res = await apiClient.get(`/album/${albumId}/images`, { headers });
      const imgs = Array.isArray(res.data.data) ? res.data.data : [];
      inAlbums.push(...imgs);
    }
  }

  const images = [...standalone, ...inAlbums];
  spinner.succeed(` Found ${images.length} images`);
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
  const stats = { found: images.length, simulated: 0, deleted: 0, failed: 0 };
  if (!doDelete) {
    const spinner = ora(` Simulating delete of ${stats.found} images`).start();
    stats.simulated = stats.found;
    spinner.succeed(` Simulated delete ${stats.found} images`);
    return stats;
  }

  let consecutiveFails = 0;

  for (const { id } of images) {
    const spinner = ora(`Deleting ${id}`).start();
    try {
      await apiClient.delete(`/image/${id}`, { headers, maxRetries });
      spinner.succeed(`Deleted ${id}`);
      stats.deleted++;
      consecutiveFails = 0; // reset on succès
    } catch (e) {
      const status = e.response?.status;
      if (status === 429) {
        spinner.fail(` Rate limit hit deleting ${id} - (HTTP ${status})`);
      } else {
        spinner.fail(` Failed delete ${id} (${status || e.message})`);
      }
      stats.failed++;
      consecutiveFails++;

      if (consecutiveFails >= 5) {
        // Échec critique : on stoppe et on affiche les stats
        spinner.fail(
          ` Imgur API has limited us 5 times in a row. Stopping the script...`
        );
        // Nouveau spinner juste pour l’info
        // ora().info(
        //   ` Summary: ${stats.found} images found, ${stats.deleted} deleted, ${stats.failed} failed.`
        // );
        return stats;
      }
    }

    await sleep(delayMs);
  }

  return stats;
}
