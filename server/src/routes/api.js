const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const gameController = require('../controllers/gameController');

// --- USER ---
router.post('/auth/login', userController.login);
router.get('/user/:id', gameController.getUserProfile);
router.get('/user/:id/heroes', userController.getHeroes);
router.get('/user/:id/inventory', userController.getInventory);
router.get('/user/:id/recipes', userController.getRecipes);
router.get('/user/:id/formation', userController.getFormation);
router.get('/user/:id/task', userController.getActiveTask);

// --- ASSETS (SYNC SYSTEM) ---
router.get('/assets/manifest', gameController.getManifest);
router.get('/assets/raw/:category/:id', gameController.getRawAsset);

// --- ACTIONS ---
router.get('/regions', gameController.getAllRegions); // NEW
router.get('/region/:id', gameController.getRegionDetails);
router.post('/action/travel', gameController.travel);
router.post('/action/gather', gameController.gather);
router.post('/action/craft', gameController.craft);
router.post('/action/formation/update', gameController.updateFormation);

// --- TAVERN ---
router.post('/tavern/enter', gameController.enterTavern);
router.post('/tavern/exit', gameController.exitTavern);
router.get('/tavern/mercenaries', gameController.getMercenaries);
router.post('/tavern/recruit', gameController.recruit);

// --- MARKET ---
router.get('/market/listings', gameController.getListings);
router.post('/market/list', gameController.listMarketItem);
router.post('/market/buy', gameController.buyMarketItem);
router.post('/market/sell-npc', gameController.sellToNPC);

// --- QUESTS ---
router.get('/quests/:userId', gameController.getQuests);
router.post('/quests/complete', gameController.completeQuest);

// --- BATTLE ---
router.post('/battle/start', gameController.startBattle);

// --- HERO ---
router.get('/hero/:id/profile', gameController.getHeroProfile);

module.exports = router;
