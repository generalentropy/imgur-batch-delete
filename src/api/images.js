import ora from "ora";
import { delayMs, maxRetries } from "../config/constants.js";
import { sleep } from "../utils/sleep.js";
import { doDelete } from "../config/cli.js";
import { apiClient } from "./apiClient.js";

export async function getAllImages() {
  // Renvoie toutes les images, albums ou non
  const res = await apiClient.get("/account/me/images");

  // 2) Déduplication
  const unique = Array.from(
    new Map(res.data.data.map((img) => [img.id, img])).values()
  );

  // 3) On retour les ids
  return unique.map((img) => img.id);
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
