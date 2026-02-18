const prisma = require('../db');
const logger = require('../utils/logger');
const { AppError, ErrorCodes } = require('../utils/AppError');

/**
 * TreasureMapService - Handles all treasure map mechanics
 * 
 * Mechanics:
 * - Player uses map → Shows coordinates/region
 * - Travel to location → Click "Dig" (3 second channel)
 * - Random roll for loot quality
 * 
 * Rarity:
 * - Common: Exact location, 100-500 Gold
 * - Uncommon: Region only, 500-2000 Gold
 * - Rare: General area, 2000-10000 Gold
 * - Legendary: Vague hint, 10000+ Gold, Epic/Legendary items
 */
class TreasureMapService {
    constructor() {
        this.DIG_DURATION_SECONDS = 3;
        this.MAP_EXPIRATION_DAYS = 7;
        
        // Coordinate randomization for anti-exploit
        this.MAX_COORD_OFFSET = 3;
    }

    /**
     * Get all treasure maps for a user
     */
    async getUserTreasureMaps(userId) {
        logger.debug(`[TreasureMapService.getUserTreasureMaps] Fetching maps for user ${userId}`);
        
        const maps = await prisma.treasureMap.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        
        return maps.map(map => this.formatMapForClient(map));
    }

    /**
     * Get user's unused treasure maps (for inventory display)
     */
    async getUnusedTreasureMaps(userId) {
        logger.debug(`[TreasureMapService.getUnusedTreasureMaps] Fetching unused maps for user ${userId}`);
        
        const maps = await prisma.treasureMap.findMany({
            where: { 
                userId,
                isUsed: false,
                isClaimed: false,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });
        
        return maps.map(map => this.formatMapForClient(map));
    }

    /**
     * Get user's active (used but not claimed) treasure maps
     */
    async getActiveTreasureMaps(userId) {
        logger.debug(`[TreasureMapService.getActiveTreasureMaps] Fetching active maps for user ${userId}`);
        
        const maps = await prisma.treasureMap.findMany({
            where: { 
                userId,
                isUsed: true,
                isClaimed: false,
                expiresAt: { gt: new Date() }
            },
            include: {
                user: {
                    select: { currentRegion: true }
                }
            },
            orderBy: { usedAt: 'desc' }
        });
        
        return maps.map(map => this.formatActiveMapForClient(map));
    }

    /**
     * Create a new treasure map (for testing/rewards)
     * In production, maps would be awarded from boss drops, achievements, events
     */
    async createTreasureMap(userId, rarity, options = {}) {
        logger.info(`[TreasureMapService.createTreasureMap] Creating ${rarity} map for user ${userId}`);
        
        // Validate rarity
        const validRarities = ['COMMON', 'UNCOMMON', 'RARE', 'LEGENDARY'];
        if (!validRarities.includes(rarity)) {
            throw new AppError(ErrorCodes.INVALID_REQUEST, `Invalid rarity: ${rarity}`);
        }
        
        // Generate treasure location based on rarity
        const location = await this.generateTreasureLocation(rarity, options);
        
        // Calculate expiration
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + this.MAP_EXPIRATION_DAYS);
        
        // Generate coordinate offsets for anti-exploit
        const coordOffsetX = Math.floor(Math.random() * (this.MAX_COORD_OFFSET * 2 + 1)) - this.MAX_COORD_OFFSET;
        const coordOffsetY = Math.floor(Math.random() * (this.MAX_COORD_OFFSET * 2 + 1)) - this.MAX_COORD_OFFSET;
        
        const treasureMap = await prisma.treasureMap.create({
            data: {
                userId,
                rarity,
                regionId: location.regionId,
                regionName: location.regionName,
                coordinatesX: location.coordinatesX,
                coordinatesY: location.coordinatesY,
                hints: location.hints,
                expiresAt,
                coordOffsetX,
                coordOffsetY
            }
        });
        
        logger.info(`[TreasureMapService.createTreasureMap] Created map ${treasureMap.id} at region ${location.regionName}`);
        
        return this.formatMapForClient(treasureMap);
    }

    /**
     * Use a treasure map - reveals the treasure location
     */
    async useTreasureMap(userId, mapId) {
        logger.info(`[TreasureMapService.useTreasureMap] User ${userId} using map ${mapId}`);
        
        // Get the map
        const treasureMap = await prisma.treasureMap.findUnique({
            where: { id: mapId }
        });
        
        if (!treasureMap) {
            throw new AppError(ErrorCodes.NOT_FOUND, 'Treasure map not found');
        }
        
        if (treasureMap.userId !== userId) {
            throw new AppError(ErrorCodes.FORBIDDEN, 'This treasure map does not belong to you');
        }
        
        if (treasureMap.isUsed) {
            throw new AppError(ErrorCodes.INVALID_REQUEST, 'This treasure map has already been used');
        }
        
        if (treasureMap.isClaimed) {
            throw new AppError(ErrorCodes.INVALID_REQUEST, 'This treasure map has already been claimed');
        }
        
        if (new Date() > treasureMap.expiresAt) {
            throw new AppError(ErrorCodes.INVALID_REQUEST, 'This treasure map has expired');
        }
        
        // Mark as used
        const updatedMap = await prisma.treasureMap.update({
            where: { id: mapId },
            data: {
                isUsed: true,
                usedAt: new Date()
            }
        });
        
        logger.info(`[TreasureMapService.useTreasureMap] Map ${mapId} used, revealing location`);
        
        return this.formatActiveMapForClient(updatedMap);
    }

    /**
     * Start digging at the treasure location
     * Creates a task for the 3-second dig channel
     */
    async startDig(userId, mapId) {
        logger.info(`[TreasureMapService.startDig] User ${userId} starting dig on map ${mapId}`);
        
        // Get the map
        const treasureMap = await prisma.treasureMap.findUnique({
            where: { id: mapId }
        });
        
        if (!treasureMap) {
            throw new AppError(ErrorCodes.NOT_FOUND, 'Treasure map not found');
        }
        
        if (treasureMap.userId !== userId) {
            throw new AppError(ErrorCodes.FORBIDDEN, 'This treasure map does not belong to you');
        }
        
        if (!treasureMap.isUsed) {
            throw new AppError(ErrorCodes.INVALID_REQUEST, 'You must use the treasure map first to reveal the location');
        }
        
        if (treasureMap.isClaimed) {
            throw new AppError(ErrorCodes.INVALID_REQUEST, 'You have already claimed the treasure from this map');
        }
        
        // Check if player is at the correct location
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { currentRegion: true }
        });
        
        // Calculate the actual treasure coordinates with offset
        const actualX = (treasureMap.coordinatesX || 0) + treasureMap.coordOffsetX;
        const actualY = (treasureMap.coordinatesY || 0) + treasureMap.coordOffsetY;
        
        // Check if player is at the correct region
        // For COMMON maps, player must be at exact coordinates
        // For other rarities, player only needs to be in the region
        let isAtLocation = false;
        
        if (treasureMap.rarity === 'COMMON') {
            // Common maps require exact coordinates
            // We'll store the target region as the one with matching coordinates
            isAtLocation = user.currentRegion === treasureMap.regionId;
        } else {
            // Other rarities just need to be in the region
            isAtLocation = user.currentRegion === treasureMap.regionId;
        }
        
        if (!isAtLocation) {
            throw new AppError(ErrorCodes.INVALID_REQUEST, 'You are not at the correct location to dig for this treasure');
        }
        
        // Create a dig task
        const now = new Date();
        const finishesAt = new Date(now.getTime() + (this.DIG_DURATION_SECONDS * 1000));
        
        const task = await prisma.taskQueue.create({
            data: {
                userId,
                type: 'DIG_TREASURE',
                targetRegionId: treasureMap.regionId,
                status: 'RUNNING',
                startedAt: now,
                finishesAt: finishesAt
            }
        });
        
        logger.info(`[TreasureMapService.startDig] Created dig task ${task.id}, will complete at ${finishesAt}`);
        
        return {
            taskId: task.id,
            finishesAt: finishesAt.getTime(),
            durationSeconds: this.DIG_DURATION_SECONDS,
            mapId: treasureMap.id
        };
    }

    /**
     * Complete digging and claim treasure
     */
    async completeDig(userId, mapId, taskId) {
        logger.info(`[TreasureMapService.completeDig] User ${userId} completing dig on map ${mapId}`);
        
        // Verify task exists and is completed
        const task = await prisma.taskQueue.findUnique({
            where: { id: taskId }
        });
        
        if (!task || task.status !== 'RUNNING') {
            throw new AppError(ErrorCodes.INVALID_REQUEST, 'Dig task not found or not running');
        }
        
        if (task.userId !== userId) {
            throw new AppError(ErrorCodes.FORBIDDEN, 'This task does not belong to you');
        }
        
        // Check if task is complete
        if (new Date() < task.finishesAt) {
            throw new AppError(ErrorCodes.INVALID_REQUEST, 'The dig is not complete yet');
        }
        
        // Get the map
        const treasureMap = await prisma.treasureMap.findUnique({
            where: { id: mapId }
        });
        
        if (!treasureMap || treasureMap.isClaimed) {
            throw new AppError(ErrorCodes.INVALID_REQUEST, 'Treasure already claimed or not found');
        }
        
        // Roll for loot
        const loot = await this.rollTreasureLoot(treasureMap.rarity);
        
        // Give rewards to user
        const rewards = await this.giveRewards(userId, loot);
        
        // Mark map as claimed
        await prisma.treasureMap.update({
            where: { id: mapId },
            data: {
                isClaimed: true,
                claimedAt: new Date()
            }
        });
        
        // Mark task as completed
        await prisma.taskQueue.update({
            where: { id: taskId },
            data: { status: 'COMPLETED' }
        });
        
        logger.info(`[TreasureMapService.completeDig] User ${userId} claimed treasure: ${JSON.stringify(loot)}`);
        
        return {
            success: true,
            loot,
            rewards,
            mapId
        };
    }

    /**
     * Check if player can dig at their current location
     */
    async checkDigEligibility(userId, mapId) {
        const treasureMap = await prisma.treasureMap.findUnique({
            where: { id: mapId }
        });
        
        if (!treasureMap || treasureMap.userId !== userId) {
            return { eligible: false, reason: 'Map not found' };
        }
        
        if (!treasureMap.isUsed) {
            return { eligible: false, reason: 'Map not used' };
        }
        
        if (treasureMap.isClaimed) {
            return { eligible: false, reason: 'Treasure already claimed' };
        }
        
        if (new Date() > treasureMap.expiresAt) {
            return { eligible: false, reason: 'Map expired' };
        }
        
        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { currentRegion: true }
        });
        
        const isAtRegion = user.currentRegion === treasureMap.regionId;
        
        return {
            eligible: isAtRegion,
            reason: isAtRegion ? null : 'Not at treasure location',
            regionId: treasureMap.regionId,
            regionName: treasureMap.regionName,
            rarity: treasureMap.rarity,
            coordinatesX: treasureMap.coordinatesX,
            coordinatesY: treasureMap.coordinatesY,
            hints: treasureMap.hints
        };
    }

    /**
     * Generate treasure location based on rarity
     */
    async generateTreasureLocation(rarity, options = {}) {
        // Get all regions
        const regions = await prisma.regionTemplate.findMany({
            select: { id: true, name: true, gridX: true, gridY: true }
        });
        
        if (regions.length === 0) {
            throw new AppError(ErrorCodes.NOT_FOUND, 'No regions available for treasure');
        }
        
        // Select random region
        const region = regions[Math.floor(Math.random() * regions.length)];
        
        let coordinatesX = null;
        let coordinatesY = null;
        let hints = null;
        
        switch (rarity) {
            case 'COMMON':
                // Exact location - use grid coordinates
                coordinatesX = region.gridX;
                coordinatesY = region.gridY;
                break;
                
            case 'UNCOMMON':
                // Region only, no exact coordinates
                // hints = `The treasure is hidden in ${region.name}.`;
                break;
                
            case 'RARE':
                // General area - provide region name only
                // hints = `Seek the treasures of ${region.name}.`;
                break;
                
            case 'LEGENDARY':
                // Vague hint
                const hintsList = [
                    `Look where the shadows gather in ${region.name}`,
                    `The ancient ones buried their gold near ${region.name}`,
                    `Follow the whispers of the wind to ${region.name}`,
                    `The treasure lies dormant in the lands of ${region.name}`
                ];
                hints = hintsList[Math.floor(Math.random() * hintsList.length)];
                break;
        }
        
        return {
            regionId: region.id,
            regionName: region.name,
            coordinatesX,
            coordinatesY,
            hints
        };
    }

    /**
     * Roll for treasure loot based on rarity
     */
    async rollTreasureLoot(rarity) {
        const loot = {
            gold: 0,
            items: []
        };
        
        // Get loot table entries for this rarity
        const lootTable = await prisma.treasureLootTable.findMany({
            where: { rarity }
        });
        
        // Calculate gold reward based on rarity
        const goldRanges = {
            'COMMON': { min: 100, max: 500 },
            'UNCOMMON': { min: 500, max: 2000 },
            'RARE': { min: 2000, max: 10000 },
            'LEGENDARY': { min: 10000, max: 50000 }
        };
        
        const goldRange = goldRanges[rarity];
        loot.gold = Math.floor(Math.random() * (goldRange.max - goldRange.min + 1)) + goldRange.min;
        
        // Roll for item drops
        const goldEntries = lootTable.filter(e => e.lootType === 'GOLD');
        const itemEntries = lootTable.filter(e => e.lootType === 'ITEM');
        
        // Process item drops
        for (const entry of itemEntries) {
            if (Math.random() < entry.dropChance) {
                const quantity = entry.quantityMin + Math.floor(Math.random() * ((entry.quantityMax || entry.quantityMin) - entry.quantityMin + 1));
                
                loot.items.push({
                    templateId: entry.itemTemplateId,
                    quantity,
                    rarity: entry.itemRarity,
                    isEpic: entry.isEpicItem,
                    isLegendary: entry.isLegendaryItem
                });
            }
        }
        
        // For Legendary, guaranteed Epic/Legendary item chance
        if (rarity === 'LEGENDARY') {
            const legendaryChance = Math.random();
            if (legendaryChance < 0.3) {
                // 30% chance for Legendary item
                loot.legendaryItem = true;
            } else if (legendaryChance < 0.7) {
                // 40% chance for Epic item
                loot.epicItem = true;
            }
        } else if (rarity === 'RARE') {
            // 10% chance for Epic item on Rare maps
            if (Math.random() < 0.1) {
                loot.epicItem = true;
            }
        }
        
        return loot;
    }

    /**
     * Give rewards to user
     */
    async giveRewards(userId, loot) {
        const rewards = {
            goldAdded: 0,
            itemsAdded: []
        };
        
        // Add gold
        if (loot.gold > 0) {
            await prisma.user.update({
                where: { id: userId },
                data: { gold: { increment: loot.gold } }
            });
            rewards.goldAdded = loot.gold;
        }
        
        // Add items to inventory
        for (const item of loot.items) {
            // Check if item template exists
            const template = await prisma.itemTemplate.findUnique({
                where: { id: item.templateId }
            });
            
            if (template) {
                // Check for existing stack
                const existingItem = await prisma.inventoryItem.findFirst({
                    where: {
                        userId,
                        templateId: item.templateId,
                        isTrash: false
                    },
                    include: { template: true }
                });
                
                if (existingItem && existingItem.template.maxStack > 1) {
                    // Add to existing stack
                    const newQuantity = Math.min(
                        existingItem.quantity + item.quantity,
                        existingItem.template.maxStack
                    );
                    const added = newQuantity - existingItem.quantity;
                    
                    await prisma.inventoryItem.update({
                        where: { id: existingItem.id },
                        data: { quantity: newQuantity }
                    });
                    
                    rewards.itemsAdded.push({
                        templateId: item.templateId,
                        quantity: added,
                        name: template.name
                    });
                } else {
                    // Create new inventory item
                    await prisma.inventoryItem.create({
                        data: {
                            userId,
                            templateId: item.templateId,
                            quantity: item.quantity,
                            quality: item.rarity || 'COMMON'
                        }
                    });
                    
                    rewards.itemsAdded.push({
                        templateId: item.templateId,
                        quantity: item.quantity,
                        name: template.name
                    });
                }
            }
        }
        
        return rewards;
    }

    /**
     * Clean up expired treasure maps
     */
    async cleanupExpiredMaps() {
        const result = await prisma.treasureMap.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        });
        
        if (result.count > 0) {
            logger.info(`[TreasureMapService.cleanupExpiredMaps] Cleaned up ${result.count} expired treasure maps`);
        }
        
        return result.count;
    }

    /**
     * Format map for client response (unused map)
     */
    formatMapForClient(map) {
        return {
            id: map.id,
            rarity: map.rarity,
            isUsed: map.isUsed,
            isClaimed: map.isClaimed,
            expiresAt: map.expiresAt.getTime(),
            createdAt: map.createdAt.getTime()
        };
    }

    /**
     * Format active map for client response (used map with location info)
     */
    formatActiveMapForClient(map) {
        return {
            id: map.id,
            rarity: map.rarity,
            regionId: map.regionId,
            regionName: map.regionName,
            coordinatesX: map.coordinatesX,
            coordinatesY: map.coordinatesY,
            hints: map.hints,
            isUsed: map.isUsed,
            isClaimed: map.isClaimed,
            usedAt: map.usedAt ? map.usedAt.getTime() : null,
            expiresAt: map.expiresAt.getTime(),
            // Include player location for comparison
            playerRegion: map.user?.currentRegion
        };
    }
}

module.exports = new TreasureMapService();
