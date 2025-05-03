# Imgur Bulk Deleter ⚙️🗑️

Un script Node.js permettant de supprimer **en lot** les images de votre compte Imgur, qu'elles soient dans des albums ou non.

---

## 🚀 Fonctionnalités

- Récupération automatique du `access_token` via votre `refresh_token`.
- Listing paginé de toutes vos images (hors albums et dans albums).
- Suppression en **batch** avec gestion du rate limit.
- Mode **dry-run** (simulation) par défaut.
- Mode **delete** (suppression réelle) activé via le flag `--delete`.

---

## 📋 Prérequis

- Node.js v16+ installé
- Un compte Imgur et un **Client-ID/Client-Secret** obtenus via le [Dashboard Imgur](https://api.imgur.com/oauth2/addclient)
- Un **Refresh Token** généré au moment de l’autorisation OAuth

---

## 🔧 Configuration

1. Dupliquez le fichier `.env.example` en `.env` à la racine du projet :

   ```bash
   cp .env.example .env
   ```

2. Ouvrez `.env` et renseignez vos clés :

   ```env
   IMGUR_CLIENT_ID=""
   IMGUR_CLIENT_SECRET=""
   IMGUR_REFRESH_TOKEN=""
   ```

> **⚠️ Ne partagez jamais vos identifiants en clair !**

---

## 💾 Installation

Installez toutes les dépendances listées dans `package.json` :

```bash
npm install
```

---

## ▶️ Usage

### Mode simulation (dry-run)

Affiche la liste des images qui seraient supprimées, **sans** effectuer de suppression :

```bash
node delete_v2.js
# ou explicitement
node delete_v2.js --dry-run
```

### Mode suppression (delete)

Supprime réellement toutes les images listées :

```bash
node delete_v2.js --delete
```

---

## ⚙️ Options

| Option      | Description                       |
| ----------- | --------------------------------- |
| `--delete`  | Active le mode suppression réelle |
| `--dry-run` | (Par défaut) Mode simulation      |

---

## 🛡️ Gestion du rate limit

Le script intègre un **délai** entre chaque requête et un **exponential backoff** en cas de réponse `429 Rate Limit`.
Si vous rencontrez des blocages, attendez quelques instants ou ajustez la variable `delayMs` dans le code.

---

## 🤝 Contribuer

1. Forkez ce repo
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos changements (`git commit -m 'Ajoute une fonctionnalité'`)
4. Push sur la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request

---

## 📄 Licence

MIT © \[Votre Nom]
