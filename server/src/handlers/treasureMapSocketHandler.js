/**
 * Treasure Map Socket Handler
 * Handles all treasure map related socket events
 */

const treasureMapService = require('../services/TreasureMapService');
const logger = require('../utils/logger');

/**
 * Register treasure map handlers to socket
 */
function register(io, socket, userId) {
    // Get all treasure maps for user
    socket.on('treasure:get_maps', async (request, callback) => {
        try {
            logger.debug(`[treasureMapSocket] get_maps request from user ${userId}`);
            const maps = await treasureMapService.getUserTreasureMaps(userId);
            callback({ success: true, data: maps });
        } catch (error) {
            logger.error(`[treasureMapSocket] Error getting maps: ${error.message}`);
            callback({ success: false, error: error.message });
        }
    });

    // Get unused treasure maps (for inventory)
    socket.on('treasure:get_unused_maps', async (request, callback) => {
        try {
            logger.debug(`[treasureMapSocket] get_unused_maps request from user ${userId}`);
            const maps = await treasureMapService.getUnusedTreasureMaps(userId);
            callback({ success: true, data: maps });
        } catch (error) {
            logger.error(`[treasureMapSocket] Error getting unused maps: ${error.message}`);
            callback({ success: false, error: error.message });
        }
    });

    // Get active (used but not claimed) treasure maps
    socket.on('treasure:get_active_maps', async (request, callback) => {
        try {
            logger.debug(`[treasureMapSocket] get_active_maps request from user ${userId}`);
            const maps = await treasureMapService.getActiveTreasureMaps(userId);
            callback({ success: true, data: maps });
        } catch (error) {
            logger.error(`[treasureMapSocket] Error getting active maps: ${error.message}`);
            callback({ success: false, error: error.message });
        }
    });

    // Use a treasure map (reveal location)
    socket.on('treasure:use_map', async (request, callback) => {
        try {
            const { mapId } = request;
            logger.info(`[treasureMapSocket] use_map request: mapId=${mapId} from user ${userId}`);
            
            if (!mapId) {
                return callback({ success: false, error: 'mapId is required' });
            }
            
            const result = await treasureMapService.useTreasureMap(userId, mapId);
            callback({ success: true, data: result });
            
            // Emit update to user
            socket.emit('treasure:map_updated', result);
        } catch (error) {
            logger.error(`[treasureMapSocket] Error using map: ${error.message}`);
            callback({ success: false, error: error.message });
        }
    });

    // Check if player can dig at current location
    socket.on('treasure:check_dig', async (request, callback) => {
        try {
            const { mapId } = request;
            logger.debug(`[treasureMapSocket] check_dig request: mapId=${mapId} from user ${userId}`);
            
            if (!mapId) {
                return callback({ success: false, error: 'mapId is required' });
            }
            
            const result = await treasureMapService.checkDigEligibility(userId, mapId);
            callback({ success: true, data: result });
        } catch (error) {
            logger.error(`[treasureMapSocket] Error checking dig: ${error.message}`);
            callback({ success: false, error: error.message });
        }
    });

    // Start digging
    socket.on('treasure:start_dig', async (request, callback) => {
        try {
            const { mapId } = request;
            logger.info(`[treasureMapSocket] start_dig request: mapId=${mapId} from user ${userId}`);
            
            if (!mapId) {
                return callback({ success: false, error: 'mapId is required' });
            }
            
            const result = await treasureMapService.startDig(userId, mapId);
            callback({ success: true, data: result });
            
            // Emit dig started event
            socket.emit('treasure:dig_started', {
                mapId,
                finishesAt: result.finishesAt
            });
        } catch (error) {
            logger.error(`[treasureMapSocket] Error starting dig: ${error.message}`);
            callback({ success: false, error: error.message });
        }
    });

    // Complete digging and claim treasure
    socket.on('treasure:complete_dig', async (request, callback) => {
        try {
            const { mapId, taskId } = request;
            logger.info(`[treasureMapSocket] complete_dig request: mapId=${mapId}, taskId=${taskId} from user ${userId}`);
            
            if (!mapId || !taskId) {
                return callback({ success: false, error: 'mapId and taskId are required' });
            }
            
            const result = await treasureMapService.completeDig(userId, mapId, taskId);
            callback({ success: true, data: result });
            
            // Emit treasure claimed event
            socket.emit('treasure:claimed', {
                mapId,
                loot: result.loot,
                rewards: result.rewards
            });
        } catch (error) {
            logger.error(`[treasureMapSocket] Error completing dig: ${error.message}`);
            callback({ success: false, error: error.message });
        }
    });

    // Debug: Create a treasure map (for testing)
    socket.on('treasure:debug_create', async (request, callback) => {
        try {
            const { rarity } = request;
            logger.info(`[treasureMapSocket] debug_create request: rarity=${rarity} from user ${userId}`);
            
            if (!rarity) {
                return callback({ success: false, error: 'rarity is required' });
            }
            
            const result = await treasureMapService.createTreasureMap(userId, rarity);
            callback({ success: true, data: result });
        } catch (error) {
            logger.error(`[treasureMapSocket] Error creating map: ${error.message}`);
            callback({ success: false, error: error.message });
        }
    });

    console.log(`[SOCKET_ROUTER] Treasure map handlers registered for user ${userId}`);
}

/**
 * Unregister treasure map handlers
 */
function unregister(socket) {
    const eventTypes = [
        'treasure:get_maps',
        'treasure:get_unused_maps',
        'treasure:get_active_maps',
        'treasure:use_map',
        'treasure:check_dig',
        'treasure:start_dig',
        'treasure:complete_dig',
        'treasure:debug_create'
    ];

    eventTypes.forEach(eventType => {
        socket.removeAllListeners(eventType);
    });

    console.log(`[SOCKET_ROUTER] Treasure map handlers unregistered for socket ${socket.id}`);
}

module.exports = {
    register,
    unregister
};
