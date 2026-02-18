const dungeonService = require('../services/dungeonService');
const logger = require('../utils/logger');

/**
 * DungeonController
 * Handles HTTP requests for Dynamic Dungeon System
 */

class DungeonController {
    /**
     * Get all available dungeons
     * GET /dungeons
     */
    async getAllDungeons(req, res) {
        try {
            logger.debug('[DungeonController.getAllDungeons]');
            const dungeons = await dungeonService.getAllDungeons();
            res.json({ success: true, dungeons });
        } catch (error) {
            logger.error(`[DungeonController.getAllDungeons] Error: ${error.message}`);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get dungeon by key
     * GET /dungeon/:dungeonKey
     */
    async getDungeonByKey(req, res) {
        try {
            const { dungeonKey } = req.params;
            logger.debug(`[DungeonController.getDungeonByKey] dungeonKey: ${dungeonKey}`);
            
            const dungeon = await dungeonService.getDungeonByKey(dungeonKey);
            if (!dungeon) {
                return res.status(404).json({ success: false, error: 'Dungeon not found' });
            }
            
            res.json({ success: true, dungeon });
        } catch (error) {
            logger.error(`[DungeonController.getDungeonByKey] Error: ${error.message}`);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get all modifiers
     * GET /dungeons/modifiers
     */
    async getAllModifiers(req, res) {
        try {
            logger.debug('[DungeonController.getAllModifiers]');
            const modifiers = await dungeonService.getAllModifiers();
            res.json({ success: true, modifiers });
        } catch (error) {
            logger.error(`[DungeonController.getAllModifiers] Error: ${error.message}`);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get user's dungeon entries
     * GET /dungeons/user/:userId
     */
    async getUserDungeons(req, res) {
        try {
            const { userId } = req.params;
            logger.debug(`[DungeonController.getUserDungeons] userId: ${userId}`);
            
            const entries = await dungeonService.getUserDungeonEntries(parseInt(userId));
            res.json({ success: true, entries });
        } catch (error) {
            logger.error(`[DungeonController.getUserDungeons] Error: ${error.message}`);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get specific dungeon entry for user
     * GET /dungeons/user/:userId/dungeon/:dungeonId
     */
    async getUserDungeonEntry(req, res) {
        try {
            const { userId, dungeonId } = req.params;
            logger.debug(`[DungeonController.getUserDungeonEntry] userId: ${userId}, dungeonId: ${dungeonId}`);
            
            const entry = await dungeonService.getUserDungeonEntry(
                parseInt(userId),
                parseInt(dungeonId)
            );
            
            if (!entry) {
                return res.status(404).json({ 
                    success: false, 
                    error: 'No entry found for this dungeon' 
                });
            }
            
            res.json({ success: true, entry });
        } catch (error) {
            logger.error(`[DungeonController.getUserDungeonEntry] Error: ${error.message}`);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Enter a dungeon
     * POST /dungeons/enter
     * Body: { userId, dungeonId }
     */
    async enterDungeon(req, res) {
        try {
            const { userId, dungeonId } = req.body;
            logger.info(`[DungeonController.enterDungeon] userId: ${userId}, dungeonId: ${dungeonId}`);
            
            if (!userId || !dungeonId) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'userId and dungeonId are required' 
                });
            }
            
            const entry = await dungeonService.enterDungeon(
                parseInt(userId),
                parseInt(dungeonId)
            );
            
            res.json({ success: true, entry });
        } catch (error) {
            logger.error(`[DungeonController.enterDungeon] Error: ${error.message}`);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get floor details
     * GET /dungeons/user/:userId/dungeon/:dungeonId/floor/:floorNumber
     */
    async getFloorDetails(req, res) {
        try {
            const { userId, dungeonId, floorNumber } = req.params;
            logger.debug(`[DungeonController.getFloorDetails] userId: ${userId}, dungeonId: ${dungeonId}, floor: ${floorNumber}`);
            
            const floorDetails = await dungeonService.getFloorDetails(
                parseInt(userId),
                parseInt(dungeonId),
                parseInt(floorNumber)
            );
            
            res.json({ success: true, floor: floorDetails });
        } catch (error) {
            logger.error(`[DungeonController.getFloorDetails] Error: ${error.message}`);
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Complete a floor
     * POST /dungeons/complete-floor
     * Body: { userId, dungeonId, floorNumber, kills, bossesKilled }
     */
    async completeFloor(req, res) {
        try {
            const { userId, dungeonId, floorNumber, kills, bossesKilled } = req.body;
            logger.info(`[DungeonController.completeFloor] userId: ${userId}, dungeonId: ${dungeonId}, floor: ${floorNumber}`);
            
            if (!userId || !dungeonId || !floorNumber) {
                return res.status(400).json({ 
                    success: false, 
                    error: 'userId, dungeonId, and floorNumber are required' 
                });
            }
            
            const result = await dungeonService.completeFloor(
                parseInt(userId),
                parseInt(dungeonId),
                parseInt(floorNumber),
                { kills, bossesKilled }
            );
            
            res.json({ success: true, result });
        } catch (error) {
            logger.error(`[DungeonController.completeFloor] Error: ${error.message}`);
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new DungeonController();
