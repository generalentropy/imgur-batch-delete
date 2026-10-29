# Imgur Batch Delete 🗑️

A Node.js script that automatically deletes the images from your Imgur account, whether they are in albums or not.

---

## Features

- Automatically fetches an `access_token` from your `refresh_token`.
- **Batch** deletion with rate limit handling.
- **Dry-run** mode (simulation).
- **Delete** mode (actual deletion).

---

## Requirements

- Node.js v22+
- An Imgur account and a **Client ID / Client Secret** from the [Imgur dashboard](https://api.imgur.com/oauth2/addclient)
- A **refresh token**, generated during OAuth authorization

---

## Getting your Imgur API keys

1. **Create an application**

   - Go to https://api.imgur.com/oauth2/addclient
   - Choose "OAuth2 without callback" (or with a callback if you have a URL)
   - Write down the **Client ID** and the **Client Secret**.

2. **Generate a refresh token**

   - Open this URL in your browser:

     ```
     https://api.imgur.com/oauth2/authorize?client_id=YOUR_CLIENT_ID&response_type=token
     ```

     _Replace `YOUR_CLIENT_ID` with your own Client ID._

   - Authorize the application, then copy the `refresh_token` value from the redirect URL in your browser.

## Configuration

1. Copy `.env.example` to `.env` at the root of the project:

   ```bash
   cp .env.example .env
   ```

2. Open `.env` and add your keys:

   ```ini
   IMGUR_CLIENT_ID="your_client_id"
   IMGUR_CLIENT_SECRET="your_client_secret"
   IMGUR_REFRESH_TOKEN="your_refresh_token"
   ```

> **Warning:** never share your credentials in plain text.

---

## Installation

Install the dependencies listed in `package.json`:

```bash
npm install
```

---

## Usage

### Dry-run mode

Shows how many images would be deleted, **without** deleting anything:

```bash
npm run dry
```

### Delete mode

Actually deletes all the listed images:

```bash
npm run delete
```

---

## Rate limit handling

Deletions run with limited concurrency (3 requests at a time), and each failed request is retried with **exponential backoff** (up to 5 retries, from 1 s to 30 s), which covers `429 Rate Limit` responses.
If you keep getting blocked, wait a moment, or lower the `concurrency` value in `src/api/deleteImages.js`.

---

## Contributing

1. Fork this repo
2. Create a branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m 'Add a feature'`)
4. Push the branch (`git push origin feature/my-feature`)
5. Open a pull request
