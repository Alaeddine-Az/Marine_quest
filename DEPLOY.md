# Deployment Guide for Maritime Quest

This application is a **Node.js + Express + Socket.io** app that serves a **Vite React** frontend. It requires a persistent server process (for WebSockets), so it cannot be deployed to static hosts like Vercel or Netlify directly.

We recommend **Railway** or **Render** for easiest deployment.

## Prerequisites

1.  **Push to GitHub**: Ensure this project is pushed to a GitHub repository.
2.  **Gemini API Key**: You will need your `API_KEY` from `.env.local`.

---

## Option 1: Railway (Recommended)

1.  Sign up at [railway.app](https://railway.app/).
2.  Click **"New Project"** -> **"Deploy from GitHub repo"**.
3.  Select your repository.
4.  Railway will automatically detect the `package.json` and `start` script.
5.  **Environment Variables**:
    *   Go to the **Variables** tab.
    *   Add `API_KEY` and paste your Google Gemini API key.
    *   (Optional) Add `PORT` = `3000` (Railway usually handles this automatically).
6.  **Build Command**:
    *   Go to **Settings** -> **Build**.
    *   Ensure the build command is `npm install && npm run build`.
7.  Deploy!

## Option 2: Render

1.  Sign up at [render.com](https://render.com/).
2.  Click **"New"** -> **"Web Service"**.
3.  Connect your GitHub repository.
4.  **Settings**:
    *   **Runtime**: Node
    *   **Build Command**: `npm install && npm run build`
    *   **Start Command**: `npm start`
5.  **Environment Variables**:
    *   Scroll down to "Advanced".
    *   Add Key: `API_KEY`, Value: `[Your Gemini API Key]`.
6.  Click **"Create Web Service"**.

---

## Local Testing (Production Mode)

To test the production build locally before deploying:

1.  Run `npm run build` to create the `dist` folder.
2.  Run `npm start` to launch the server.
3.  Open `http://localhost:3001` (or whatever port is logged).

## Troubleshooting

*   **WebSockets failing?** Ensure your host supports sticky sessions or WebSockets (Railway and Render do by default).
*   **Audio not playing?** Browsers block auto-play. Ensure you interact with the page first (the "Start Game" button handles this).
*   **Gemini Errors?** Check your server logs to ensure the `API_KEY` is loaded correctly.
