const WebSocket = require('ws');
const express = require('express');
const path = require('path');

// Handlers
const authHandler = require('./handlers/authHandler');
const inventoryHandler = require('./handlers/inventoryHandler');
const breedingHandler = require('./handlers/breedingHandler');
const battleHandler = require('./handlers/battleHandler');

const app = express();
app.use(express.static(path.join(__dirname, '../public')));

const server = app.listen(3000, () => {
    console.log("Textical AAA Modular Server: http://localhost:3000");
});

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log("[NETWORK] Player connected.");

    ws.on('message', async (message) => {
        try {
            const request = JSON.parse(message);

            switch (request.type) {
                case "register":
                    await authHandler.handleRegister(ws, request);
                    break;
                case "login":
                    await authHandler.handleLogin(ws, request);
                    break;
                case "equip_item":
                    await inventoryHandler.handleEquip(ws, request);
                    break;
                case "unequip_item":
                    await inventoryHandler.handleUnequip(ws, request);
                    break;
                case "breed_heroes":
                    await breedingHandler.handleBreed(ws, request);
                    break;
                case "start_battle":
                    await battleHandler.handleStartBattle(ws, request);
                    break;
                default:
                    console.warn("Unknown request type:", request.type);
            }

        } catch (err) {
            console.error("Critical Server Error:", err);
            ws.send(JSON.stringify({ type: "error", message: "Internal server error" }));
        }
    });
});
