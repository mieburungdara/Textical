const express = require('express');
const router = express.Router();
const userController = require('../controllers/admin/AdminUserController');
const monsterController = require('../controllers/admin/AdminMonsterController');
const itemController = require('../controllers/admin/AdminItemController');
const questController = require('../controllers/admin/AdminQuestController');
const regionController = require('../controllers/admin/AdminRegionController');
const skillController = require('../controllers/admin/AdminSkillController');
const traitController = require('../controllers/admin/AdminTraitController');
const factionController = require('../controllers/admin/AdminFactionController');
const analyticsController = require('../controllers/admin/AdminAnalyticsController');
const systemController = require('../controllers/admin/AdminSystemController');

// --- Dashboard ---
router.get('/dashboard', (req, res) => analyticsController.getDashboardStats(req, res));

// --- Users Management ---
router.get('/users', (req, res) => userController.getUsers(req, res));
router.get('/users/:id', (req, res) => userController.getUserById(req, res));
router.put('/users/:id', (req, res) => userController.updateUser(req, res));
router.delete('/users/:id', (req, res) => userController.deleteUser(req, res));
router.post('/users/:id/adjust-silver', (req, res) => userController.adjustUserSilver(req, res));

// --- Heroes Management ---
router.get('/heroes', (req, res) => userController.getHeroes(req, res));
router.get('/heroes/:id', (req, res) => userController.getHeroById(req, res));
router.put('/heroes/:id', (req, res) => userController.updateHero(req, res));
router.post('/heroes/:id/skills', (req, res) => userController.addHeroSkill(req, res));
router.delete('/heroes/:id/skills/:skillId', (req, res) => userController.removeHeroSkill(req, res));
router.get('/skills', (req, res) => userController.getSkills(req, res));

// --- Monsters Management ---
router.get('/monsters', (req, res) => monsterController.getMonsters(req, res));
router.get('/monsters/categories', (req, res) => monsterController.getMonsterCategories(req, res));
router.put('/monsters/:id', (req, res) => monsterController.updateMonsterTemplate(req, res));
router.post('/monsters', (req, res) => monsterController.createMonsterTemplate(req, res));

// --- Regions Management ---
router.get('/regions', (req, res) => regionController.getRegions(req, res));

// --- Items Management ---
router.get('/items', (req, res) => itemController.getItems(req, res));

// --- Quests Management ---
router.get('/quests', (req, res) => questController.getQuests(req, res));
router.get('/quests/categories', (req, res) => questController.getQuestCategories(req, res));
router.post('/quests/:id', (req, res) => questController.saveQuest(req, res));

// --- Skills Management ---
router.get('/skills', (req, res) => skillController.getSkills(req, res));

// --- Traits Management ---
router.get('/traits', (req, res) => traitController.getTraits(req, res));

// --- Factions Management ---
router.get('/factions', (req, res) => factionController.getFactions(req, res));

// --- Analytics Stats ---
router.get('/stats/summary', (req, res) => analyticsController.getStatsSummary(req, res));
router.get('/stats/economy', (req, res) => analyticsController.getEconomyStats(req, res));
router.get('/stats/activity', (req, res) => analyticsController.getActivityStats(req, res));
router.get('/stats/hero-classes', (req, res) => analyticsController.getHeroClassStats(req, res));
router.get('/stats/skills-usage', (req, res) => analyticsController.getSkillsUsageStats(req, res));
router.get('/stats/monsters-killed', (req, res) => analyticsController.getMonstersKilledStats(req, res));
router.get('/stats/regions', (req, res) => analyticsController.getRegionStats(req, res));
router.get('/stats/top-players', (req, res) => analyticsController.getTopPlayers(req, res));
router.get('/stats/quests', (req, res) => analyticsController.getQuestStats(req, res));
router.get('/stats/export', (req, res) => analyticsController.exportStats(req, res));

// --- Server Management ---
router.get('/server/health', (req, res) => systemController.getServerHealth(req, res));
router.get('/server/db-stats', (req, res) => systemController.getDatabaseStats(req, res));

// --- Bulk Operations ---
router.post('/bulk/items', (req, res) => systemController.bulkUpdateItems(req, res));
router.post('/bulk/monsters', (req, res) => systemController.bulkCreateMonsters(req, res));
router.post('/bulk/player-action', (req, res) => systemController.bulkPlayerAction(req, res));

// --- Activity Logs ---
router.get('/logs/admin-actions', (req, res) => systemController.getAdminActionLogs(req, res));
router.get('/logs/transactions', (req, res) => systemController.getTransactionLogs(req, res));

module.exports = router;

