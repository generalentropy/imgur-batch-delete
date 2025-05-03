import "dotenv/config";
import ora from "ora";

import { checkEnvironmentVariables } from "./src/utils/env.js";
import { getAccessToken } from "./src/api/auth.js";
import { getAllImages, processImages } from "./src/api/images.js";
import { displayCurrentMode, displaySummary } from "./src/ui/display.js";
import { doDelete } from "./src/config/cli.js";

async function main() {
  displayCurrentMode();

  try {
    // 1) Vérification de l'environnement
    checkEnvironmentVariables();

    // 2) Récupère un access token
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    // 3) Récupère toutes les images
    const images = await getAllImages(headers);

    // 4) Traite chaque image
    const stats = await processImages(images, doDelete, headers);

    // 5) Affiche le bilan
    displaySummary(stats);
  } catch (err) {
    ora().fail(`Fatal error: ${err.response?.data || err.message}`);
    process.exit(1);
  }
}

main();
