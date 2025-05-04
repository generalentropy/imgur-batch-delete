// deleteImages.js
import pRetry from "p-retry";
import pMap from "p-map";
import ora from "ora";
import { apiClient } from "./apiClient.js";

async function deleteOne(id) {
  return pRetry(
    async () => {
      const resp = await apiClient.delete(`/image/${id}`);
      if (resp.status !== 200) {
        throw new Error(` HTTP ${resp.status}`);
      }
    },
    {
      retries: 5,
      factor: 2,
      minTimeout: 1000, // 1s
      maxTimeout: 30_000, // 30s
      onFailedAttempt: (err) =>
        console.warn(
          ` Attempt ${err.attemptNumber} failed for ${id}: ${err.message}`
        ),
    }
  );
}

export async function deleteImages(ids) {
  const spinner = ora(` Deleting ${ids.length} images…`).start();
  const stats = {
    found: ids.length,
    deleted: 0,
    failed: 0,
    simulated: 0,
  };

  await pMap(
    ids,
    async (id) => {
      try {
        await deleteOne(id);
        stats.deleted++;
        ora().succeed(` Deleted ${id}`);
      } catch (e) {
        stats.failed++;
        ora().fail(` Failed delete ${id}: ${e.message}`);
      }
    },
    { concurrency: 3 }
  );

  spinner.stop();
  return stats;
}
