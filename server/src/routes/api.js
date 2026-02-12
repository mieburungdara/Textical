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
const chatRoutes = require('./chatRoutes');
const statRoutes = require('./statRoutes');
const dataRoutes = require('./dataRoutes');

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
router.post('/user/settings', (req, res) => userController.updateSettings(req, res));

// --- HEROES ---
router.get('/user/:id/heroes', (req, res) => heroController.getHeroes(req, res));
router.get('/hero/:id/profile', (req, res) => heroController.getHeroProfile(req, res));

// --- INVENTORY ---
router.get('/user/:id/inventory', (req, res) => inventoryController.getInventory(req, res));

// --- RECIPES ---
router.get('/user/:id/recipes', (req, res) => recipeController.getRecipes(req, res));

// --- FORMATION ---
router.get('/user/:id/formation', (req, res) => formationController.getFormation(req, res));

// --- TASKS ---
router.get('/user/:id/task', (req, res) => taskController.getActiveTask(req, res));

// --- SOCIAL ---
router.get('/user/:id/friends', (req, res) => socialController.getFriends(req, res));

// --- ACHIEVEMENTS ---
router.get('/user/:id/achievements', (req, res) => achievementController.getAchievements(req, res));

// --- REGIONS ---
router.get('/regions', (req, res) => regionController.getAllRegions(req, res));
router.get('/regions/influence', (req, res) => regionController.getGlobalInfluence(req, res));
router.get('/region/:id', (req, res) => regionController.getRegionDetails(req, res));

// --- ACTIONS ---
router.post('/action/travel', (req, res) => travelController.travel(req, res));
router.post('/action/gather', (req, res) => gatheringController.gather(req, res));
router.post('/action/craft', (req, res) => craftingController.craft(req, res));
router.post('/inventory/discard', (req, res) => inventoryController.discardItem(req, res));
router.post('/inventory/use', (req, res) => inventoryController.useItem(req, res));

// --- FORMATION ---
router.post('/action/formation/update', (req, res) => battleController.updateFormation(req, res));
router.post('/action/formation/move', (req, res) => battleController.moveFormationUnit(req, res));
router.post('/action/formation/swap', (req, res) => battleController.swapFormationUnits(req, res));

// --- EQUIPMENT ---
router.post('/action/equip', (req, res) => equipmentController.equipItem(req, res));
router.post('/action/unequip', (req, res) => equipmentController.unequipItem(req, res));

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

// --- HERO PROFILE ---
router.get('/hero/:id/profile', (req, res) => heroController.getHeroProfile(req, res));

// --- STATS ---
router.use('/stats', statRoutes);

module.exports = router;
