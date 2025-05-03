# Imgur Batch Delete 🗑️

Un script Node.js permettant de supprimer de façon automatique les images de votre compte Imgur, qu'elles soient dans des albums ou non.

---

## 🚀 Fonctionnalités

- Récupération automatique du `access_token` via votre `refresh_token`.
- Listing paginé de toutes vos images (hors albums et dans albums).
- Suppression en **batch** avec gestion du rate limit.
- Mode **dry-run** (simulation)
- Mode **delete** (suppression réelle).

---

## 📋 Prérequis

- Node.js v16+ installé
- Un compte Imgur et un **Client-ID/Client-Secret** obtenus via le [Dashboard Imgur](https://api.imgur.com/oauth2/addclient)
- Un **Refresh Token** généré au moment de l’autorisation OAuth

---

## 🔑 Comment récupérer vos clés Imgur API

1. **Créer une application**

   - Allez sur https://api.imgur.com/oauth2/addclient
   - Choisissez « OAuth2 without callback » (ou avec callback si vous avez une URL)
   - Notez le **Client ID** et le **Client Secret**.

2. **Générer un refresh token**

   - Ouvrez dans votre navigateur :

     ```
     https://api.imgur.com/oauth2/authorize?client_id=VOTRE_CLIENT_ID&response_type=token
     ```

     _ℹ️ remplacez VOTRE_CLIENT_ID par votre id_

- Autorisez l’application et récupérez la valeur de `refresh_token` dans l’URL de redirection (dans le navigateur).

## 🔧 Configuration

1. Dupliquez le fichier `.env.example` en `.env` à la racine du projet :

   ```bash
   cp .env.example .env
   ```

2. Ouvrez `.env` et ajoutez vos clés :

   ```ini
   IMGUR_CLIENT_ID="votre_client_id"
   IMGUR_CLIENT_SECRET="votre_client_secret"
   IMGUR_REFRESH_TOKEN="votre_refresh_token"
   ```

> **⚠️ Ne partagez jamais vos identifiants en clair**

---

## 💾 Installation

Installez toutes les dépendances listées dans `package.json` :

```bash
npm install
```

---

## ▶️ Usage

### Mode simulation (dry-run)

Affiche le nombre d'images qui seraient supprimées, **sans** effectuer de suppression :

```bash
npm run dry
```

### Mode suppression (delete)

Supprime réellement toutes les images listées :

```bash
npm run delete
```

---

## 🛡️ Gestion du rate limit

Le script intègre un **délai** entre chaque requête et un **exponential backoff** en cas de réponse `429 Rate Limit`.
Si vous rencontrez des blocages, attendez quelques instants ou ajustez la variable `delayMs` dans le code _(config/constants.js_.

---

## 🤝 Contribuer

1. Forkez ce repo
2. Créez une branche (`git checkout -b feature/ma-feature`)
3. Commitez vos changements (`git commit -m 'Ajoute une fonctionnalité'`)
4. Push sur la branche (`git push origin feature/ma-feature`)
5. Ouvrez une Pull Request
