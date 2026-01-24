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
const buildingHandler = require('./handlers/buildingHandler');
const questHandler = require('./handlers/questHandler');
const dialogueHandler = require('./handlers/dialogueHandler');
const economyHandler = require('./handlers/economyHandler');
const siegeHandler = require('./handlers/siegeHandler');
const leaderboardHandler = require('./handlers/leaderboardHandler');
const mailHandler = require('./handlers/mailHandler'); // NEW
const AdminHandler = require('./handlers/adminHandler');

// Services
const dataSyncService = require('./services/dataSyncService');
const assetService = require('./services/assetService'); 

const app = express();
app.use(express.json()); 
app.use(express.static(path.join(__dirname, '../public')));

const server = app.listen(3000, async () => {
    console.log("Textical AAA Modular Server: http://localhost:3000");
    await assetService.loadAllAssets();
});

new AdminHandler(app);

const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    ws.on('message', async (message) => {
        try {
            const request = JSON.parse(message);

            switch (request.type) {
                case "login": await authHandler.handleLogin(ws, request); break;
                case "register": await authHandler.handleRegister(ws, request); break;
                case "travel": await worldHandler.handleTravel(ws, request); break;
                case "equip_item": await inventoryHandler.handleEquip(ws, request); break;
                case "unequip_item": await inventoryHandler.handleUnequip(ws, request); break;
                case "repair_item": await inventoryHandler.handleRepair(ws, request); break;
                case "breed_heroes": await breedingHandler.handleBreed(ws, request); break;
                case "start_battle": await battleHandler.handleStartBattle(ws, request); break;
                case "create_guild": await guildHandler.handleCreateGuild(ws, request); break;
                case "join_guild": await guildHandler.handleJoinGuild(ws, request); break;
                case "market_fetch": await marketHandler.handleListItems(ws, request); break;
                case "market_post": await marketHandler.handlePostListing(ws, request); break;
                case "market_buy": await marketHandler.handleBuy(ws, request); break;
                case "fetch_recipes": await buildingHandler.handleFetchRecipes(ws, request); break;
                case "craft_item": await buildingHandler.handleCraft(ws, request); break;
                case "accept_quest": await questHandler.handleAcceptQuest(ws, request); break;
                case "fetch_quests": await questHandler.handleFetchActiveQuests(ws, request); break;
                case "convert_currency": await economyHandler.handleConvert(ws, request); break;
                case "start_dialogue": await dialogueHandler.handleDialogue(ws, request); break;
                case "get_siege_status": await siegeHandler.handleGetSiegeStatus(ws, request); break;
                case "trigger_siege": await siegeHandler.handleTriggerSiege(ws, request); break;
                case "fetch_leaderboard": await leaderboardHandler.handleFetchLeaderboard(ws, request); break;
                // NEW: MAIL SYSTEM
                case "fetch_inbox": await mailHandler.handleFetchInbox(ws, request); break;
                case "claim_mail": await mailHandler.handleClaimMail(ws, request); break;
                default: console.warn("Unknown request type:", request.type);
            }
        } catch (err) { console.error(err); }
    });
});
