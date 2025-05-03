// index.js
import "dotenv/config";
import axios from "axios";
import ora from "ora"; // spinner

const API_BASE = "https://api.imgur.com";
const API_V3 = `${API_BASE}/3`;
const doDelete = process.argv.includes("--delete");

// Delay between requests to avoid rate limiting (in milliseconds)
const delayMs = 1200; // 1.2 seconds
// Max retries on 429 errors
const maxRetries = 3;

console.log(
  doDelete
    ? "⚡ Running in DELETE mode – this will permanently delete your images."
    : "⛔ Running in DRY-RUN mode – no deletions will occur."
);

// Vérification des variables d'environnement
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

// Sleep helper
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Récupère l'access token via le refresh token
async function getAccessToken() {
  const params = new URLSearchParams({
    refresh_token: process.env.IMGUR_REFRESH_TOKEN,
    client_id: process.env.IMGUR_CLIENT_ID,
    client_secret: process.env.IMGUR_CLIENT_SECRET,
    grant_type: "refresh_token",
  });

  const { data } = await axios.post(
    `${API_BASE}/oauth2/token`,
    params.toString(),
    { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
  );

  if (!data.access_token) {
    throw new Error(`Token invalide : ${JSON.stringify(data)}`);
  }
  return data.access_token;
}

// Récupère tous les items paginés d'un endpoint
async function fetchPaginated(path, headers) {
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

(async () => {
  try {
    // 1) Récupère un access token unique au démarrage
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    // 2) Lister toutes les images (hors album + dans albums)
    const spinnerList = ora("Listing images...").start();
    const standalone = await fetchPaginated("/account/me/images", headers);
    const albums = await fetchPaginated("/account/me/albums", headers);

    const inAlbums = [];
    for (const { id: albumId } of albums) {
      const res = await axios.get(`${API_V3}/album/${albumId}/images`, {
        headers,
      });
      const imgs = Array.isArray(res.data.data) ? res.data.data : [];
      if (imgs.length) inAlbums.push(...imgs);
      await sleep(delayMs);
    }
    const images = [...standalone, ...inAlbums];
    spinnerList.succeed(`Found ${images.length} images`);

    const stats = { found: images.length, simulated: 0, deleted: 0, failed: 0 };

    // 3) Boucle de suppression ou simulation avec spinner par image
    for (const { id, link } of images) {
      const action = doDelete ? "Deleting" : "Simulating";
      const spinner = ora(`${action} ${id}`).start();

      if (!doDelete) {
        await sleep(200); // pause pour la visibilité du spinner
        spinner.succeed(`Simulated delete ${id}`);
        stats.simulated++;
      } else {
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
                `Rate limit, retrying ${id} after ${retryAfter / 1000}s`
              );
              await sleep(retryAfter);
              attempt++;
              continue;
            }
            spinner.fail(`Failed delete ${id}`);
            stats.failed++;
            break;
          }
        }
      }
      await sleep(delayMs);
    }

    // 4) Affiche le bilan
    ora().info(`
📊 Summary:
 • Total found   : ${stats.found}
 • Deleted       : ${stats.deleted}
 • Failed        : ${stats.failed}
 • Simulated     : ${stats.simulated}
    `);
  } catch (err) {
    ora().fail(`Fatal error: ${err.response?.data || err.message}`);
    process.exit(1);
  }
})();
