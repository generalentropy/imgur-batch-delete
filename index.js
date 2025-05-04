import "dotenv/config";
import ora from "ora";

import { checkEnvironmentVariables } from "./src/utils/env.js";
import { displayCurrentMode, displaySummary } from "./src/ui/display.js";
import { deleteImages } from "./src/api/deleteImages.js";
import { doDelete } from "./src/config/cli.js";
import { getAllImages } from "./src/api/images.js";

async function main() {
  displayCurrentMode();

  try {
    // 1) Vérifier la config
    checkEnvironmentVariables();

    // 2) Lister toutes les images (unique IDs)
    const listSpinner = ora("Fetching all images…").start();
    const ids = await getAllImages();
    listSpinner.succeed(` Found ${ids.length} unique images`);

    if (ids.length === 0) {
      console.log("No images to delete.");
      return;
    }

    // 3) Selon le mode, simuler ou supprimer
    if (!doDelete) {
      console.log(
        ` \n[Dry-run] Would delete ${ids.length} images. No changes made.`
      );
      console.log(
        "\n👉 To actually delete all images, run:\n   npm run delete\n"
      );
      return;
    }

    // 4) Suppression effective
    const deleteSpinner = ora(` Deleting ${ids.length} images…`).start();
    const { deleted, failed } = await deleteImages(ids);
    deleteSpinner.succeed(
      ` Deletion complete — ${deleted} deleted, ${failed} failed`
    );

    // 5) Afficher le bilan
    displaySummary({ found: ids.length, deleted, failed });
  } catch (err) {
    ora().fail(
      ` Fatal error: ${
        err.response?.data?.error || err.response?.data || err.message
      }`
    );
    process.exit(1);
  }
}

main();
