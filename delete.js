import "dotenv/config";
import axios from "axios";

const API_BASE = "https://api.imgur.com";
const API_V3 = `${API_BASE}/3`;

// Détermine le mode à partir du flag --delete
const doDelete = process.argv.includes("--delete");
console.log(
  doDelete
    ? "🗑️ Running in DELETE mode – this will permanently delete your images."
    : "🚧 Running in DRY-RUN mode – no deletions will occur."
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

// Paginate helper pour récupérer tous les items d'un endpoint paginé
async function fetchPaginated(path, headers) {
  const items = [];
  let page = 0;

  while (true) {
    const res = await axios.get(`${API_V3}${path}/${page}`, { headers });
    const list = Array.isArray(res.data.data) ? res.data.data : [];
    if (list.length === 0) break;
    items.push(...list);
    page++;
  }

  return items;
}

// Liste toutes les images (hors albums + dans albums)
async function listAllAccountImages() {
  const token = await getAccessToken();
  const headers = { Authorization: `Bearer ${token}` };

  // 1) Images hors album
  const standalone = await fetchPaginated("/account/me/images", headers);

  // 2) Liste des albums
  const albums = await fetchPaginated("/account/me/albums", headers);

  // 3) Images dans chaque album
  const inAlbums = [];
  for (const { id: albumId } of albums) {
    const res = await axios.get(`${API_V3}/album/${albumId}/images`, {
      headers,
    });
    const imgs = Array.isArray(res.data.data) ? res.data.data : [];
    if (imgs.length) inAlbums.push(...imgs);
  }

  return [...standalone, ...inAlbums];
}

(async () => {
  try {
    const images = await listAllAccountImages();
    const stats = { found: images.length, simulated: 0, deleted: 0, failed: 0 };

    console.log(`\n🔍 Found ${stats.found} image(s) total.`);

    // Boucle sur toutes les images
    for (const { id, link } of images) {
      if (!doDelete) {
        console.log(`[SIMULATION] Would delete ${id} → ${link}`);
        stats.simulated++;
      } else {
        try {
          await axios.delete(`${API_V3}/image/${id}`, {
            headers: { Authorization: `Bearer ${await getAccessToken()}` },
          });
          console.log(`✔ Deleted ${id}`);
          stats.deleted++;
        } catch (e) {
          console.error(
            `✖ Failed to delete ${id}: ${
              e.response?.data?.data?.error || e.message
            }`
          );
          stats.failed++;
        }
      }
    }

    // Bilan
    console.log("\n📊 Summary:");
    console.log(` • Total images found   : ${stats.found}`);
    if (doDelete) {
      console.log(` • Successfully deleted : ${stats.deleted}`);
      console.log(` • Failed deletions     : ${stats.failed}`);
    } else {
      console.log(` • Simulated deletions  : ${stats.simulated}`);
      console.log(" • No actual deletions performed.");
    }
  } catch (err) {
    console.error("❗ Fatal error:", err.response?.data || err.message);
    process.exit(1);
  }
})();
