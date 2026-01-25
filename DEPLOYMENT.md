# Textical: Deployment Guide

This guide explains how to host the Textical RPG engine on a live server.

## 1. Backend (Node.js Server)

### Local Docker Build
To test the container locally:
```bash
cd server
docker build -t textical-server .
docker run -p 3000:3000 textical-server
```

### Production Hosting
We recommend using **Fly.io**, **DigitalOcean**, or **Railway** for deployment.
*   **Database:** Since we use SQLite, ensure you mount a **Persistent Volume** at `/app/prisma` to keep player data across restarts.
*   **Env Variables:**
    *   `DATABASE_URL="file:./dev.db"`
    *   `PORT=3000`

---

## 2. Frontend (Godot 4 Client)

### Web Export
1.  Open Godot 4.
2.  Go to **Project -> Export**.
3.  Add a **Web (HTML5)** preset.
4.  Set the **Remote Host** in `GameState.gd` or `ServerConnector.gd` to your live server URL (e.g., `https://api.textical.game/api`).
5.  Export to a `dist/` folder.

### Serving the Game
You can serve the exported Godot files using:
*   **Nginx:** High-performance static serving.
*   **Vercel/Netlify:** Drag-and-drop the `dist/` folder.
*   **The Server itself:** Update `server.js` to use `express.static('public')` and place your Godot files there.

---

## 3. High Availability
*   The `TaskProcessor.js` acts as a background worker. For large player bases, consider moving this to a separate microservice.
*   **Auth:** Current implementation uses simplified username-only login. Replace with **JWT (JSON Web Tokens)** for live production.
