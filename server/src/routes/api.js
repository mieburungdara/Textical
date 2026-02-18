const express = require('express');
const router = express.Router();

// Import Modular Controllers
const userController = require('../controllers/userController');
const sessionController = require('../controllers/SessionController');
const heroController = require('../controllers/HeroController');
const inventoryController = require('../controllers/InventoryController');
const recipeController = require('../controllers/RecipeController');
const formationController = require('../controllers/FormationController');
const taskController = require('../controllers/TaskController');
const socialController = require('../controllers/SocialController');
const achievementController = require('../controllers/AchievementController');
const assetController = require('../controllers/AssetController');
const travelController = require('../controllers/TravelController');
const gatheringController = require('../controllers/GatheringController');
const craftingController = require('../controllers/CraftingController');
const tavernController = require('../controllers/TavernController');
const marketController = require('../controllers/MarketController');
const questController = require('../controllers/QuestController');
const battleController = require('../controllers/BattleController');
const regionController = require('../controllers/RegionController');
const equipmentController = require('../controllers/EquipmentController');
const worldController = require('../controllers/WorldController');
const privateIslandController = require('../controllers/PrivateIslandController');
const playerReputationController = require('../controllers/PlayerReputationController');
const chatRoutes = require('./chatRoutes');
const statRoutes = require('./statRoutes');
const arenaRoutes = require('./arena');
const skillMasteryController = require('../controllers/skillMasteryController');
const dataRoutes = require('./dataRoutes');
const socketRoutes = require('./socketRoutes');
const dungeonController = require('../controllers/DungeonController');
const treasureMapService = require('../services/TreasureMapService');

// --- ASSETS (SYNC SYSTEM) ---
router.use('/data', dataRoutes);
router.get('/assets/manifest', (req, res) => assetController.getManifest(req, res));
router.get('/assets/templates/:category', (req, res) => assetController.getTemplates(req, res));
router.get('/assets/raw/:category/:id', (req, res) => assetController.getRawAsset(req, res));

// --- AUTH & SESSIONS ---
router.post('/auth/login', (req, res) => sessionController.login(req, res));
router.post('/auth/logout', (req, res) => sessionController.logout(req, res));
router.get('/auth/sessions', (req, res) => sessionController.getActiveSessions(req, res));

// --- USER ---
router.use('/chat', chatRoutes);
router.get('/world/state', (req, res) => worldController.getWorldState(req, res));
    router.get('/user/:id', (req, res) => userController.getUserProfile(req, res));
    router.put('/user/:id/settings', (req, res) => userController.updateSettings(req, res));

// --- HEROES ---
router.get('/user/:id/heroes', (req, res) => heroController.getHeroes(req, res));
router.get('/hero/:id/profile', (req, res) => heroController.getHeroProfile(req, res));

// --- INVENTORY ---
router.get('/user/:id/inventory', (req, res) => inventoryController.getInventory(req, res));

// --- RECIPES ---
router.get('/user/:id/recipes', (req, res) => recipeController.getRecipes(req, res));

// --- FORMATION ---
router.get('/user/:id/formation', (req, res) => formationController.getFormation(req, res));

// --- HERO BONDS (Party Synergy) ---
router.get('/user/:id/bonds', async (req, res) => {
    try {
        const HeroBondResolver = require('../services/stat/HeroBondResolver');
        const userId = parseInt(req.params.id);
        const bonds = await HeroBondResolver.calculateActiveBonds(userId);
        res.json({ success: true, bonds });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/hero/:id/bond-bonuses', async (req, res) => {
    try {
        const HeroBondResolver = require('../services/stat/HeroBondResolver');
        const heroId = parseInt(req.params.id);
        const bonuses = await HeroBondResolver.getHeroBondBonuses(heroId);
        res.json({ success: true, bonuses });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/user/:id/bonds/recalculate', async (req, res) => {
    try {
        const HeroBondResolver = require('../services/stat/HeroBondResolver');
        const userId = parseInt(req.params.id);
        const bonds = await HeroBondResolver.recalculateBonds(userId);
        res.json({ success: true, bonds });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

// --- TASKS ---
router.get('/user/:id/task', (req, res) => taskController.getActiveTask(req, res));

// --- SOCIAL ---
router.get('/user/:id/friends', (req, res) => socialController.getFriends(req, res));

// --- ACHIEVEMENTS ---
router.get('/user/:id/achievements', (req, res) => achievementController.getAchievements(req, res));
router.get('/achievements/categories', (req, res) => achievementController.getAchievementsByCategory(req, res));
router.get('/achievements/:code', (req, res) => achievementController.getAchievement(req, res));
router.get('/achievements/:id/progress', (req, res) => achievementController.getProgress(req, res));
router.post('/user/:id/achievements/:code/claim', (req, res) => achievementController.claimReward(req, res));
router.get('/user/:id/titles', (req, res) => achievementController.getTitles(req, res));
router.post('/user/:id/titles/equip', (req, res) => achievementController.equipTitle(req, res));
router.post('/user/:id/titles/unequip', (req, res) => achievementController.unequipTitle(req, res));

// Admin route to seed achievements
router.post('/admin/achievements/seed', (req, res) => achievementController.seedAchievements(req, res));

// --- REGIONS ---
router.get('/regions', (req, res) => regionController.getAllRegions(req, res));
router.get('/regions/influence', (req, res) => regionController.getGlobalInfluence(req, res));
router.get('/region/:id', (req, res) => regionController.getRegionDetails(req, res));

// --- ACTIONS ---
router.post('/action/travel', (req, res) => travelController.travel(req, res));
router.post('/action/gather', (req, res) => gatheringController.gather(req, res));
router.post('/action/craft', (req, res) => craftingController.craft(req, res));

// --- CRAFTING FAIL SYSTEM ---
router.get('/crafting/success-rate', (req, res) => craftingController.getSuccessRate(req, res));
router.get('/crafting/skills/:userId', (req, res) => craftingController.getSkills(req, res));
router.get('/crafting/skill/:userId', (req, res) => craftingController.getSkill(req, res));

router.post('/inventory/discard', (req, res) => inventoryController.discardItem(req, res));
router.post('/inventory/use', (req, res) => inventoryController.useItem(req, res));

// --- FORMATION ---
router.post('/action/formation/update', (req, res) => battleController.updateFormation(req, res));
router.post('/action/formation/move', (req, res) => battleController.moveFormationUnit(req, res));
router.post('/action/formation/swap', (req, res) => battleController.swapFormationUnits(req, res));

// --- EQUIPMENT ---
router.post('/action/equip', (req, res) => equipmentController.equipItem(req, res));
router.post('/action/unequip', (req, res) => equipmentController.unequipItem(req, res));

// --- SOCKET (GEM SOCKETING) ---
router.use('/socket', socketRoutes);

// --- TAVERN ---
router.post('/tavern/enter', (req, res) => tavernController.enterTavern(req, res));
router.post('/tavern/exit', (req, res) => tavernController.exitTavern(req, res));
router.get('/tavern/mercenaries', (req, res) => tavernController.getMercenaries(req, res));
router.post('/tavern/recruit', (req, res) => tavernController.recruit(req, res));

// --- MARKET ---
router.get('/market/listings', (req, res) => marketController.getListings(req, res));
router.get('/market/price-index/:templateId', (req, res) => marketController.getPriceIndex(req, res));
router.post('/market/list', (req, res) => marketController.listMarketItem(req, res));
router.post('/market/buy', (req, res) => marketController.buyMarketItem(req, res));
router.post('/market/sell-npc', (req, res) => marketController.sellToNPC(req, res));

// --- QUESTS ---
router.get('/quests/:userId', (req, res) => questController.getQuests(req, res));
router.post('/quests/complete', (req, res) => questController.completeQuest(req, res));

// --- BATTLE ---
router.post('/battle/start', (req, res) => battleController.startBattle(req, res));
router.post('/battle/start-async', (req, res) => battleController.startAsyncBattle(req, res));
router.get('/battle/status/:battleId', (req, res) => battleController.getBattleStatus(req, res));
router.get('/battle/replay/:battleId', (req, res) => battleController.getReplay(req, res));

// --- STREAMS ---
router.use('/stats', statRoutes);

// --- ARENA ---
router.use('/arena', arenaRoutes);

// --- SKILL MASTERY ---
router.use('/skill-mastery', skillMasteryController);

// --- PRIVATE ISLAND ---
router.get('/island/:userId', (req, res) => privateIslandController.getIsland(req, res));
router.get('/island/:userId/status', (req, res) => privateIslandController.getIslandStatus(req, res));
router.post('/island/unlock', (req, res) => privateIslandController.unlockIsland(req, res));
router.post('/island/plant', (req, res) => privateIslandController.plant(req, res));
router.post('/island/harvest', (req, res) => privateIslandController.harvest(req, res));
router.post('/island/storage/add', (req, res) => privateIslandController.addToStorage(req, res));
router.post('/island/storage/remove', (req, res) => privateIslandController.removeFromStorage(req, res));
router.post('/island/upgrade/plots', (req, res) => privateIslandController.upgradePlots(req, res));
router.post('/island/upgrade/storage', (req, res) => privateIslandController.upgradeStorage(req, res));
router.get('/island/crops', (req, res) => privateIslandController.getCropTemplates(req, res));

// --- PLAYER REPUTATION (LIKE/DISLIKE) ---
router.post('/reputation/give', (req, res) => playerReputationController.giveReputation(req, res));
router.delete('/reputation/:toUserId', (req, res) => playerReputationController.removeReputation(req, res));
router.get('/reputation/:userId', (req, res) => playerReputationController.getUserReputation(req, res));
router.get('/reputation/:userId/comments', (req, res) => playerReputationController.getUserComments(req, res));
router.get('/reputation/me/given', (req, res) => playerReputationController.getGivenReputations(req, res));
router.get('/reputation/can-give/:toUserId', (req, res) => playerReputationController.canGiveReputation(req, res));
router.get('/reputation/interactable', (req, res) => playerReputationController.getInteractableUsers(req, res));
router.get('/reputation/leaderboard', (req, res) => playerReputationController.getLeaderboard(req, res));
router.get('/reputation/guild/:guildId', (req, res) => playerReputationController.getGuildReputation(req, res));

// --- DYNAMIC DUNGEONS ---
router.get('/dungeons', (req, res) => dungeonController.getAllDungeons(req, res));
router.get('/dungeons/modifiers', (req, res) => dungeonController.getAllModifiers(req, res));
router.get('/dungeon/:dungeonKey', (req, res) => dungeonController.getDungeonByKey(req, res));
router.get('/dungeons/user/:userId', (req, res) => dungeonController.getUserDungeons(req, res));
router.get('/dungeons/user/:userId/dungeon/:dungeonId', (req, res) => dungeonController.getUserDungeonEntry(req, res));
router.get('/dungeons/user/:userId/dungeon/:dungeonId/floor/:floorNumber', (req, res) => dungeonController.getFloorDetails(req, res));
router.post('/dungeons/enter', (req, res) => dungeonController.enterDungeon(req, res));
router.post('/dungeons/complete-floor', (req, res) => dungeonController.completeFloor(req, res));

// --- TREASURE MAPS ---
router.get('/treasure/maps/:userId', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const maps = await treasureMapService.getUserTreasureMaps(userId);
        res.json({ success: true, data: maps });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/treasure/maps/:userId/unused', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const maps = await treasureMapService.getUnusedTreasureMaps(userId);
        res.json({ success: true, data: maps });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.get('/treasure/maps/:userId/active', async (req, res) => {
    try {
        const userId = parseInt(req.params.userId);
        const maps = await treasureMapService.getActiveTreasureMaps(userId);
        res.json({ success: true, data: maps });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

router.post('/treasure/use', async (req, res) => {
    try {
        const { userId, mapId } = req.body;
        const result = await treasureMapService.useTreasureMap(userId, mapId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/treasure/check-dig', async (req, res) => {
    try {
        const { userId, mapId } = req.body;
        const result = await treasureMapService.checkDigEligibility(userId, mapId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/treasure/start-dig', async (req, res) => {
    try {
        const { userId, mapId } = req.body;
        const result = await treasureMapService.startDig(userId, mapId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

router.post('/treasure/complete-dig', async (req, res) => {
    try {
        const { userId, mapId, taskId } = req.body;
        const result = await treasureMapService.completeDig(userId, mapId, taskId);
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

module.exports = router;
