/**
 * Crée une pause dans l'exécution pour la durée spécifiée
 * @param {number} ms - Durée de la pause en millisecondes
 * @returns {Promise<void>}
 */
export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
