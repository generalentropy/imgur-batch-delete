import "dotenv/config";
import axios from "axios";

// Vérification de la variable d'environnement
if (!process.env.IMGUR_CLIENT_ID) {
  console.error("❗ La variable d'env IMGUR_CLIENT_ID est manquante !");
  process.exit(1);
}

// Vérification des crédits API via GET /3/credits
async function checkApiCredits() {
  const headers = { Authorization: `Client-ID ${process.env.IMGUR_CLIENT_ID}` };
  try {
    const res = await axios.get("https://api.imgur.com/3/credits", { headers });
    const d = res.data.data;

    console.log("=== API Credits (Client-ID) ===");
    console.log(`UserLimit:       ${d.UserLimit}`);
    console.log(`UserRemaining:   ${d.UserRemaining}`);
    console.log(`ClientLimit:     ${d.ClientLimit}`);
    console.log(`ClientRemaining: ${d.ClientRemaining}`);
  } catch (e) {
    console.error(
      "❗ Échec de la requête de crédits API :",
      e.response?.data || e.message
    );
    process.exit(1);
  }
}

(async () => {
  await checkApiCredits();
  console.log(
    "\nℹ️  Note: l'endpoint OAuth d'Imgur (/oauth2/token) ne retourne pas d'en-têtes X-RateLimit pour l'instant."
  );
})();
