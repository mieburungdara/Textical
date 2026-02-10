const express = require('express');
const router = express.Router();
const adminController = require('../controllers/AdminController');

// --- Dashboard ---
router.get('/dashboard', (req, res) => adminController.getDashboardStats(req, res));

// --- Users Management ---
router.get('/users', (req, res) => adminController.getUsers(req, res));
router.get('/users/:id', (req, res) => adminController.getUserById(req, res));
router.put('/users/:id', (req, res) => adminController.updateUser(req, res));
router.delete('/users/:id', (req, res) => adminController.deleteUser(req, res));
router.post('/users/:id/adjust-silver', (req, res) => adminController.adjustUserSilver(req, res));

// --- Heroes Management ---
router.get('/heroes', (req, res) => adminController.getHeroes(req, res));
router.get('/heroes/:id', (req, res) => adminController.getHeroById(req, res));

// --- Monsters Management ---
router.get('/monsters', (req, res) => adminController.getMonsters(req, res));
router.get('/monsters/categories', (req, res) => adminController.getMonsterCategories(req, res));
router.put('/monsters/:id', (req, res) => adminController.updateMonsterTemplate(req, res));
router.post('/monsters', (req, res) => adminController.createMonsterTemplate(req, res));

// --- Regions Management ---
router.get('/regions', (req, res) => adminController.getRegions(req, res));

// --- Items Management ---
router.get('/items', (req, res) => adminController.getItems(req, res));

// --- Quests Management ---
router.get('/quests', (req, res) => adminController.getQuests(req, res));

// --- Skills Management ---
router.get('/skills', (req, res) => adminController.getSkills(req, res));

// --- Traits Management ---
router.get('/traits', (req, res) => adminController.getTraits(req, res));

// --- Factions Management ---
router.get('/factions', (req, res) => adminController.getFactions(req, res));

// --- Analytics Stats ---
router.get('/stats/summary', (req, res) => adminController.getStatsSummary(req, res));
router.get('/stats/economy', (req, res) => adminController.getEconomyStats(req, res));
router.get('/stats/activity', (req, res) => adminController.getActivityStats(req, res));
router.get('/stats/hero-classes', (req, res) => adminController.getHeroClassStats(req, res));
router.get('/stats/skills-usage', (req, res) => adminController.getSkillsUsageStats(req, res));
router.get('/stats/monsters-killed', (req, res) => adminController.getMonstersKilledStats(req, res));
router.get('/stats/regions', (req, res) => adminController.getRegionStats(req, res));
router.get('/stats/top-players', (req, res) => adminController.getTopPlayers(req, res));
router.get('/stats/quests', (req, res) => adminController.getQuestStats(req, res));
router.get('/stats/export', (req, res) => adminController.exportStats(req, res));

// --- Server Management ---
router.get('/server/health', (req, res) => adminController.getServerHealth(req, res));
router.get('/server/db-stats', (req, res) => adminController.getDatabaseStats(req, res));

// --- Bulk Operations ---
router.post('/bulk/items', (req, res) => adminController.bulkUpdateItems(req, res));
router.post('/bulk/monsters', (req, res) => adminController.bulkCreateMonsters(req, res));
router.post('/bulk/player-action', (req, res) => adminController.bulkPlayerAction(req, res));

// --- Activity Logs ---
router.get('/logs/admin-actions', (req, res) => adminController.getAdminActionLogs(req, res));
router.get('/logs/transactions', (req, res) => adminController.getTransactionLogs(req, res));

module.exports = router;
