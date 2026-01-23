require('dotenv').config(); 
const WebSocket = require('ws');
const express = require('express');
const path = require('path');

// Handlers
const authHandler = require('./handlers/authHandler');
const inventoryHandler = require('./handlers/inventoryHandler');
const breedingHandler = require('./handlers/breedingHandler');
const battleHandler = require('./handlers/battleHandler');
const worldHandler = require('./handlers/worldHandler');
const guildHandler = require('./handlers/guildHandler');
const marketHandler = require('./handlers/marketHandler');
const buildingHandler = require('./handlers/buildingHandler'); // NEW
const AdminHandler = require('./handlers/adminHandler');

// Services
const dataSyncService = require('./services/dataSyncService');
const assetService = require('./services/assetService'); 
const regionRepository = require('./repositories/regionRepository');

const app = express();
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '../public')));

const server = app.listen(3000, async () => {
    console.log("Textical AAA Modular Server: http://localhost:3000");
    console.log("Admin Panel: http://localhost:3000/admin/");
    await assetService.loadAllAssets();
});

new AdminHandler(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log("[NETWORK] Player connected.");

    ws.on('message', async (message) => {
        try {
            const request = JSON.parse(message);

            // --- ADMIN COMMANDS ---
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

            // --- MESSAGE ROUTING ---
            switch (request.type) {
                case "login": await authHandler.handleLogin(ws, request); break;
                case "register": await authHandler.handleRegister(ws, request); break;
                case "travel": await worldHandler.handleTravel(ws, request); break;
                case "equip_item": await inventoryHandler.handleEquip(ws, request); break;
                case "unequip_item": await inventoryHandler.handleUnequip(ws, request); break;
                case "breed_heroes": await breedingHandler.handleBreed(ws, request); break;
                case "start_battle": await battleHandler.handleStartBattle(ws, request); break;
                case "create_guild": await guildHandler.handleCreateGuild(ws, request); break;
                case "join_guild": await guildHandler.handleJoinGuild(ws, request); break;
                case "market_fetch": await marketHandler.handleListItems(ws, request); break;
                case "market_post": await marketHandler.handlePostListing(ws, request); break;
                case "market_buy": await marketHandler.handleBuy(ws, request); break;
                // NEW: BUILDING INTERACTIONS
                case "fetch_recipes": await buildingHandler.handleFetchRecipes(ws, request); break;
                case "craft_item": await buildingHandler.handleCraft(ws, request); break;
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
