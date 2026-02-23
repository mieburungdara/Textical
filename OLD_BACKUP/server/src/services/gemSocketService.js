const BaseService = require('./BaseService');
const inventoryService = require('./inventoryService');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../constants/ErrorCodes');

/**
 * SocketService
 * Handles item socketing mechanics including:
 * - Inserting gems into equipment
 * - Removing gems from equipment (costs 50% of gem value)
 * - Getting socket information
 * - Gem upgrade (3x same tier = 1x next tier)
 */
class SocketService extends BaseService {
    /**
     * Get socket information for an inventory item
     * @param {number} inventoryItemId - The equipment's inventory item ID
     * @returns {Promise<Object>} Socket info including gem details
     */
    async getSocketInfo(inventoryItemId) {
        logger.debug(`[SocketService.getSocketInfo] Getting socket info`, { inventoryItemId });

        const socket = await this.db.inventoryItemSocket.findUnique({
            where: { inventoryItemId },
            include: { gem: true }
        });

        if (!socket) {
            // No socket exists - equipment hasn't been initialized with a socket yet
            // Return empty socket structure
            return {
                hasSocket: false,
                inventoryItemId,
                gem: null,
                insertedAt: null
            };
        }

        return {
            hasSocket: true,
            inventoryItemId: socket.inventoryItemId,
            gem: socket.gem ? {
                id: socket.gem.id,
                name: socket.gem.name,
                element: socket.gem.element,
                tier: socket.gem.tier,
                statKey: socket.gem.statKey,
                statValue: socket.gem.statValue,
                percentValue: socket.gem.percentValue,
                description: socket.gem.description,
                baseValue: socket.gem.baseValue
            } : null,
            insertedAt: socket.insertedAt
        };
    }

    /**
     * Initialize a socket for an equipment item (if not exists)
     * @param {number} inventoryItemId - The equipment's inventory item ID
     */
    async initializeSocket(inventoryItemId) {
        const existingSocket = await this.db.inventoryItemSocket.findUnique({
            where: { inventoryItemId }
        });

        if (!existingSocket) {
            await this.db.inventoryItemSocket.create({
                data: { inventoryItemId }
            });
        }
    }

    /**
     * Insert a gem into equipment
     * @param {number} userId - User ID
     * @param {number} inventoryItemId - Equipment item ID
     * @param {number} gemItemId - Gem inventory item ID (the gem to insert)
     * @returns {Object} Result with success status
     */
    async insertGem(userId, inventoryItemId, gemItemId) {
        logger.info(`[SocketService.insertGem] Inserting gem`, {
            userId,
            inventoryItemId,
            gemItemId
        });

        // 1. Validate equipment item
        const equipment = await this.db.inventoryItem.findUnique({
            where: { id: inventoryItemId },
            include: { template: true }
        });

        if (!equipment || equipment.userId !== userId) {
            throw new AppError(ErrorCodes.INVENTORY_ITEM_NOT_FOUND, 'Equipment not found in inventory.');
        }

        // Check if item is actually equipment
        const isEquipment = equipment.template.category === 'EQUIPMENT';
        if (!isEquipment) {
            throw new AppError(ErrorCodes.INVALID_INPUT, 'Only equipment can have sockets.');
        }

        // 2. Validate gem item
        const gemItem = await this.db.inventoryItem.findUnique({
            where: { id: gemItemId }
        });

        if (!gemItem || gemItem.userId !== userId) {
            throw new AppError(ErrorCodes.INVENTORY_ITEM_NOT_FOUND, 'Gem not found in inventory.');
        }

        // Check if gem is actually a gem (by checking if there's a gem template for its templateId)
        const gemTemplate = await this.db.gemTemplate.findFirst({
            where: {
                // We'll need to add a way to identify gem items in ItemTemplate
                // For now, let's assume gems are identified by their name containing "Gem"
            }
        });

        // For now, we'll check if the item name contains "Gem"
        if (!gemItem.template.name.includes('Gem')) {
            throw new AppError(ErrorCodes.INVALID_INPUT, 'This item is not a gem.');
        }

        // 3. Initialize socket if needed
        await this.initializeSocket(inventoryItemId);

        // 4. Check if socket already has a gem
        const socket = await this.db.inventoryItemSocket.findUnique({
            where: { inventoryItemId }
        });

        if (socket.gemId) {
            throw new AppError(ErrorCodes.INVALID_INPUT, 'Socket already has a gem. Remove it first.');
        }

        // 5. Execute transaction
        return await this.runTransaction(async (tx) => {
            // Remove gem from inventory
            if (gemItem.quantity > 1) {
                await tx.inventoryItem.update({
                    where: { id: gemItemId },
                    data: { quantity: { decrement: 1 } }
                });
            } else {
                await tx.inventoryItem.delete({
                    where: { id: gemItemId }
                });
            }

            // Insert gem into socket
            await tx.inventoryItemSocket.update({
                where: { inventoryItemId },
                data: {
                    gemId: gemItem.templateId, // Using templateId as gemId reference
                    insertedAt: new Date()
                }
            });

            logger.info(`[SocketService.insertGem] Gem inserted successfully`, {
                inventoryItemId,
                gemItemId,
                gemName: gemItem.template.name
            });

            return {
                success: true,
                message: `Successfully inserted ${gemItem.template.name} into ${equipment.template.name}!`,
                equipmentName: equipment.template.name,
                gemName: gemItem.template.name
            };
        });
    }

    /**
     * Remove a gem from equipment
     * Costs 50% of the gem's base value
     * @param {number} userId - User ID
     * @param {number} inventoryItemId - Equipment item ID
     * @returns {Object} Result with success status and refund amount
     */
    async removeGem(userId, inventoryItemId) {
        logger.info(`[SocketService.removeGem] Removing gem`, {
            userId,
            inventoryItemId
        });

        // 1. Validate equipment item
        const equipment = await this.db.inventoryItem.findUnique({
            where: { id: inventoryItemId },
            include: { 
                template: true,
                socket: {
                    include: { gem: true }
                }
            }
        });

        if (!equipment || equipment.userId !== userId) {
            throw new AppError(ErrorCodes.INVENTORY_ITEM_NOT_FOUND, 'Equipment not found in inventory.');
        }

        // 2. Check if socket has a gem
        if (!equipment.socket || !equipment.socket.gemId) {
            throw new AppError(ErrorCodes.INVALID_INPUT, 'This equipment has no gem to remove.');
        }

        const gemTemplateId = equipment.socket.gemId;
        const gemTemplate = await this.db.gemTemplate.findUnique({
            where: { id: gemTemplateId }
        });

        if (!gemTemplate) {
            throw new AppError(ErrorCodes.INVALID_INPUT, 'Gem template not found.');
        }

        // 3. Calculate removal cost (50% of base value)
        const removalCost = Math.floor(gemTemplate.baseValue * 0.5);
        const user = await this.db.user.findUnique({
            where: { id: userId }
        });

        // Check if user has enough gold
        if (user.gold < removalCost) {
            throw new AppError(ErrorCodes.INSUFFICIENT_GOLD, 
                `Need ${removalCost} gold to remove gem. You have ${user.gold}.`);
        }

        // 4. Check inventory space
        const hasSpace = await inventoryService.hasSpace(userId, gemTemplateId, 1);
        if (!hasSpace) {
            throw new AppError(ErrorCodes.INVENTORY_FULL, 'Not enough inventory space.');
        }

        // 5. Execute transaction
        return await this.runTransaction(async (tx) => {
            // Deduct removal cost
            await tx.user.update({
                where: { id: userId },
                data: { gold: { decrement: removalCost } }
            });

            // Add gem back to inventory
            await tx.inventoryItem.create({
                data: {
                    userId,
                    templateId: gemTemplateId,
                    quantity: 1
                }
            });

            // Remove gem from socket
            await tx.inventoryItemSocket.update({
                where: { inventoryItemId },
                data: {
                    gemId: null,
                    insertedAt: null
                }
            });

            logger.info(`[SocketService.removeGem] Gem removed successfully`, {
                inventoryItemId,
                gemName: gemTemplate.name,
                refund: removalCost
            });

            return {
                success: true,
                message: `Removed ${gemTemplate.name}! Refund: ${removalCost} gold`,
                gemName: gemTemplate.name,
                equipmentName: equipment.template.name,
                refund: removalCost,
                cost: removalCost
            };
        });
    }

    /**
     * Get total gem bonuses for an inventory item
     * @param {number} inventoryItemId - Equipment item ID
     * @returns {Object} Combined stat bonuses from gem
     */
    async getGemBonuses(inventoryItemId) {
        const socket = await this.db.inventoryItemSocket.findUnique({
            where: { inventoryItemId },
            include: { gem: true }
        });

        if (!socket || !socket.gem) {
            return { flat: {}, percent: {} };
        }

        const gem = socket.gem;
        const bonuses = {
            flat: {},
            percent: {}
        };

        // Add flat bonus
        if (gem.statValue > 0) {
            bonuses.flat[gem.statKey] = gem.statValue;
        }

        // Add percentage bonus
        if (gem.percentValue > 0) {
            bonuses.percent[gem.statKey] = gem.percentValue;
        }

        return bonuses;
    }

    /**
     * Get all gems available in user's inventory
     * @param {number} userId - User ID
     * @returns {Array} List of gems in inventory
     */
    async getUserGems(userId) {
        // Get all gem template IDs
        const gemTemplates = await this.db.gemTemplate.findMany({
            select: { id: true }
        });
        const gemTemplateIds = gemTemplates.map(g => g.id);

        // Find user's inventory items that match gem templates
        const gemItems = await this.db.inventoryItem.findMany({
            where: {
                userId,
                templateId: { in: gemTemplateIds }
            },
            include: { template: true }
        });

        return gemItems.map(item => ({
            id: item.id,
            templateId: item.templateId,
            name: item.template.name,
            quantity: item.quantity,
            quality: item.quality
        }));
    }

    /**
     * Get all equipment with sockets for a user
     * @param {number} userId - User ID
     * @returns {Array} List of equipped items with socket info
     */
    async getUserEquipmentSockets(userId) {
        const equipment = await this.db.inventoryItem.findMany({
            where: {
                userId,
                template: {
                    category: 'EQUIPMENT'
                }
            },
            include: {
                template: true,
                socket: {
                    include: { gem: true }
                }
            },
            orderBy: {
                templateId: 'asc'
            }
        });

        return equipment.map(item => ({
            id: item.id,
            name: item.template.name,
            category: item.template.category,
            rarity: item.quality,
            socket: item.socket ? {
                hasGem: !!item.socket.gem,
                gem: item.socket.gem ? {
                    id: item.socket.gem.id,
                    name: item.socket.gem.name,
                    element: item.socket.gem.element,
                    tier: item.socket.gem.tier,
                    statKey: item.socket.gem.statKey,
                    statValue: item.socket.gem.statValue
                } : null
            } : null
        }));
    }
}

module.exports = new SocketService();
