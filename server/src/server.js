require('dotenv').config(); // NEW: Load .env first
const WebSocket = require('ws');
const express = require('express');
const path = require('path');

// Handlers
const authHandler = require('./handlers/authHandler');
const inventoryHandler = require('./handlers/inventoryHandler');
const breedingHandler = require('./handlers/breedingHandler');
const battleHandler = require('./handlers/battleHandler');
const worldHandler = require('./handlers/worldHandler');
const AdminHandler = require('./handlers/adminHandler');
const dataSyncService = require('./services/dataSyncService');
const assetService = require('./services/assetService'); // NEW
const regionRepository = require('./repositories/regionRepository');

const app = express();
app.use(express.json()); // NEW: JSON Parsing for API
app.use(express.static(path.join(__dirname, '../public')));

const server = app.listen(3000, async () => {
    console.log("Textical AAA Modular Server: http://localhost:3000");
    console.log("Admin Panel: http://localhost:3000/admin/");
    
    // AUTO-LOAD ASSETS ON STARTUP
    await assetService.loadAllAssets();
});

// Initialize Admin API Routes
new AdminHandler(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log("[NETWORK] Player connected.");

    ws.on('message', async (message) => {
        try {
            const request = JSON.parse(message);

            // --- ADMIN SOCKET COMMANDS ---
            if (request.type === "admin_sync_import") {
                await dataSyncService.importFromCurrentJson();
                ws.send(JSON.stringify({ type: "success", message: "Imported JSON to DB" }));
                return;
            }
            if (request.type === "admin_sync_export") {
                await dataSyncService.exportToJson();
                ws.send(JSON.stringify({ type: "success", message: "Exported DB to JSON" }));
                return;
            }

            // --- GAME COMMANDS ---
            if (request.type === "login") {
                await authHandler.handleLogin(ws, request);
                return;
            }

            switch (request.type) {
                case "register": await authHandler.handleRegister(ws, request); break;
                case "travel": await worldHandler.handleTravel(ws, request); break;
                case "equip_item": await inventoryHandler.handleEquip(ws, request); break;
                case "unequip_item": await inventoryHandler.handleUnequip(ws, request); break;
                case "breed_heroes": await breedingHandler.handleBreed(ws, request); break;
                case "start_battle": await battleHandler.handleStartBattle(ws, request); break;
                default: console.warn("Unknown request type:", request.type);
            }

        } catch (err) {
            console.error("Critical Server Error:", err);
            if (ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: "error", message: "Internal server error" }));
            }
        }
    });
});