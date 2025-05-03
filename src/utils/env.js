/**
 * Vérifie que toutes les variables d'environnement requises sont présentes
 * @throws {Error} Si une variable d'environnement est manquante
 */
export function checkEnvironmentVariables() {
  for (const name of [
    "IMGUR_CLIENT_ID",
    "IMGUR_CLIENT_SECRET",
    "IMGUR_REFRESH_TOKEN",
  ]) {
    if (!process.env[name]) {
      console.error(`❗ La variable d'env ${name} est manquante !`);
      process.exit(1);
    }
  }
}
