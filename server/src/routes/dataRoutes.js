const express = require('express');
const router = express.Router();
const monsterSyncService = require('../services/monster_sync_service');

// Get current data versions
router.get('/version', async (req, res) => {
    try {
        const versions = await monsterSyncService.getVersion();
        res.json(versions);
    } catch (error) {
        console.error("Error getting versions:", error);
        res.status(500).json({ error: "Failed to fetch data versions" });
    }
});

// Trigger a sync manually (Admin only in real app, but open for dev)
router.post('/sync/monsters', async (req, res) => {
    try {
        const result = await monsterSyncService.syncMonstersToJson();
        res.json(result);
    } catch (error) {
        res.status(500).json({ error: "Sync failed", details: error.message });
    }
});

module.exports = router;
