const express = require('express');
const router = express.Router();
const gemSocketService = require('../services/gemSocketService');

const { authMiddleware } = require('../middleware/auth');
const logger = require('../utils/logger');

/**
 * Socket Routes
 * REST endpoints for gem socketing operations
 */

// All routes require authentication
router.use(authMiddleware);

/**
 * GET /api/socket/equipment
 * Get all equipment with socket information
 */
router.get('/equipment', async (req, res) => {
    try {
        const userId = req.user.id;
        const equipment = await gemSocketService.getUserEquipmentSockets(userId);
        
        res.json({
            success: true,
            data: equipment
        });
    } catch (error) {
        logger.error(`[socketRoutes] GET /equipment error:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/socket/gems
 * Get all gems in user's inventory
 */
router.get('/gems', async (req, res) => {
    try {
        const userId = req.user.id;
        const gems = await gemSocketService.getUserGems(userId);
        
        res.json({
            success: true,
            data: gems
        });
    } catch (error) {
        logger.error(`[socketRoutes] GET /gems error:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/socket/:itemId
 * Get socket information for a specific equipment item
 */
router.get('/:itemId', async (req, res) => {
    try {
        const userId = req.user.id;
        const { itemId } = req.params;
        
        // Verify ownership
        const item = await require('../services/inventoryService').getItem(userId, parseInt(itemId));
        if (!item) {
            return res.status(404).json({
                success: false,
                error: 'Item not found'
            });
        }

        const socketInfo = await gemSocketService.getSocketInfo(parseInt(itemId));
        
        res.json({
            success: true,
            data: socketInfo
        });
    } catch (error) {
        logger.error(`[socketRoutes] GET /:itemId error:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/socket/insert
 * Insert a gem into equipment
 * Body: { equipmentItemId, gemItemId }
 */
router.post('/insert', async (req, res) => {
    try {
        const userId = req.user.id;
        const { equipmentItemId, gemItemId } = req.body;

        if (!equipmentItemId || !gemItemId) {
            return res.status(400).json({
                success: false,
                error: 'equipmentItemId and gemItemId are required'
            });
        }

        const result = await gemSocketService.insertGem(
            userId,
            parseInt(equipmentItemId),
            parseInt(gemItemId)
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error(`[socketRoutes] POST /insert error:`, error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/socket/remove
 * Remove a gem from equipment
 * Body: { equipmentItemId }
 */
router.post('/remove', async (req, res) => {
    try {
        const userId = req.user.id;
        const { equipmentItemId } = req.body;

        if (!equipmentItemId) {
            return res.status(400).json({
                success: false,
                error: 'equipmentItemId is required'
            });
        }

        const result = await gemSocketService.removeGem(
            userId,
            parseInt(equipmentItemId)
        );

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        logger.error(`[socketRoutes] POST /remove error:`, error);
        res.status(400).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/socket/bonuses/:itemId
 * Get total gem bonuses for an equipment item
 */
router.get('/bonuses/:itemId', async (req, res) => {
    try {
        const { itemId } = req.params;
        
        const bonuses = await gemSocketService.getGemBonuses(parseInt(itemId));
        
        res.json({
            success: true,
            data: bonuses
        });
    } catch (error) {
        logger.error(`[socketRoutes] GET /bonuses/:itemId error:`, error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
