const BaseService = require('./BaseService');
const inventoryService = require('./inventoryService');
const logger = require('../utils/logger');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../constants/ErrorCodes');

/**
 * EnchantmentService
 * Handles item enchantment mechanics including:
 * - Applying enchantments to equipment
 * - Success rate calculation based on level and item quality
 * - Material consumption
 * - Stat bonus calculation
 */
class EnchantmentService extends BaseService {
    constructor() {
        super();
        // Base success rate at level 1
        this.BASE_SUCCESS_RATE = 0.9; // 90%
        // Success rate decrease per level
        this.SUCCESS_RATE_DECREASE = 0.07; // ~7% per level
        // Minimum success rate at max level
        this.MIN_SUCCESS_RATE = 0.3; // 30%
    }

    /**
     * Get enchantment cost in silver based on level
     * Cost = level * 100,000 silver
     */
    getSilverCost(level) {
        return level * 100000;
    }

    /**
     * Calculate success rate based on enchantment level
     * Starts at 90%, decreases by 7% per level, minimum 30%
     */
    calculateSuccessRate(level) {
        const rate = this.BASE_SUCCESS_RATE - ((level - 1) * this.SUCCESS_RATE_DECREASE);
        return Math.max(rate, this.MIN_SUCCESS_RATE);
    }

    /**
     * Calculate enchantment bonuses for an item
     * Returns flat bonus and percentage bonus based on level
     */
    calculateEnchantmentBonus(enchantment, level) {
        const flatBonus = enchantment.statValuePerLevel * level;
        const percentBonus = enchantment.percentBonusPerLevel * level;
        
        return {
            flatBonus,
            percentBonus,
            isPercent: enchantment.isPercent
        };
    }

    /**
     * Get all enchantments applied to an inventory item
     */
    async getItemEnchantments(inventoryItemId) {
        return await this.db.inventoryItemEnchantment.findMany({
            where: { inventoryItemId },
            include: { enchantment: true }
        });
    }

    /**
     * Get total enchantment bonuses for an item
     */
    async getTotalEnchantmentBonuses(inventoryItemId) {
        const enchantments = await this.getItemEnchantments(inventoryItemId);
        
        const bonuses = {
            flat: {},
            percent: {}
        };

        for (const enc of enchantments) {
            const { flatBonus, percentBonus } = this.calculateEnchantmentBonus(
                enc.enchantment, 
                enc.level
            );
            
            const statKey = enc.enchantment.statKey;
            
            // Accumulate flat bonuses
            if (flatBonus > 0) {
                bonuses.flat[statKey] = (bonuses.flat[statKey] || 0) + flatBonus;
            }
            
            // Accumulate percentage bonuses
            if (percentBonus > 0) {
                bonuses.percent[statKey] = (bonuses.percent[statKey] || 0) + percentBonus;
            }
        }

        return bonuses;
    }

    /**
     * Apply enchantment to an item
     * @param {number} userId - User ID
     * @param {number} inventoryItemId - Inventory item ID to enchant
     * @param {number} enchantmentId - Enchantment template ID
     * @returns {object} Result with success status
     */
    async applyEnchantment(userId, inventoryItemId, enchantmentId) {
        logger.info(`[EnchantmentService.applyEnchantment] Starting enchantment`, {
            userId,
            inventoryItemId,
            enchantmentId
        });

        // 1. Get user and validate
        const user = await this.db.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            throw new AppError(ErrorCodes.AUTH_USER_NOT_FOUND, 'User not found.');
        }

        // 2. Get inventory item
        const item = await this.db.inventoryItem.findUnique({
            where: { id: inventoryItemId },
            include: { 
                template: true,
                enchantments: true
            }
        });

        if (!item || item.userId !== userId) {
            throw new AppError(ErrorCodes.INVENTORY_ITEM_NOT_FOUND, 'Item not found in inventory.');
        }

        // 3. Get enchantment template
        const enchantment = await this.db.itemEnchantment.findUnique({
            where: { id: enchantmentId }
        });

        if (!enchantment) {
            throw new AppError(ErrorCodes.INVALID_INPUT, 'Enchantment not found.');
        }

        // 4. Check if item already has this enchantment
        const existingEnchantment = item.enchantments.find(
            e => e.enchantmentId === enchantmentId
        );

        let currentLevel = 1;
        if (existingEnchantment) {
            // Upgrading existing enchantment
            currentLevel = existingEnchantment.level + 1;
            
            if (currentLevel > enchantment.maxLevel) {
                throw new AppError(ErrorCodes.INVALID_INPUT, `Maximum enchantment level is ${enchantment.maxLevel}.`);
            }
        } else {
            // Check max enchantments per item (1 for all equipment)
            if (item.enchantments.length >= 1) {
                throw new AppError(ErrorCodes.INVALID_INPUT, 'This item already has an enchantment.');
            }
        }

        // 5. Calculate costs
        const silverCost = this.getSilverCost(currentLevel);
        const successRate = this.calculateSuccessRate(currentLevel);

        // 6. Check silver balance
        if (user.silver < silverCost) {
            throw new AppError(ErrorCodes.INSUFFICIENT_SILVER, `Need ${silverCost} silver. You have ${user.silver}.`);
        }

        // 7. Check materials if required
        if (enchantment.materialId && enchantment.materialCount > 0) {
            const materialCount = await this.db.inventoryItem.count({
                where: {
                    userId,
                    templateId: enchantment.materialId,
                    quantity: { gte: enchantment.materialCount }
                }
            });

            if (materialCount < 1) {
                const material = await this.db.itemTemplate.findUnique({
                    where: { id: enchantment.materialId }
                });
                throw new AppError(ErrorCodes.CRAFT_MISSING_MATERIAL, 
                    `Missing material: ${enchantment.materialCount}x ${material?.name || 'Unknown'}`);
            }
        }


        // 8. Roll for success
        const roll = Math.random();
        const isSuccess = roll < successRate;

        logger.info(`[EnchantmentService.applyEnchantment] Rolling`, {
            roll,
            successRate,
            isSuccess,
            level: currentLevel
        });

        // 9. Execute transaction
        return await this.runTransaction(async (tx) => {
            // Consume silver
            await tx.user.update({
                where: { id: userId },
                data: { silver: { decrement: silverCost } }
            });

            // Consume materials
            if (enchantment.materialId && enchantment.materialCount > 0) {
                const materialItem = await tx.inventoryItem.findFirst({
                    where: {
                        userId,
                        templateId: enchantment.materialId,
                        quantity: { gte: enchantment.materialCount }
                    }
                });

                if (materialItem.quantity <= enchantment.materialCount) {
                    await tx.inventoryItem.delete({ where: { id: materialItem.id } });
                } else {
                    await tx.inventoryItem.update({
                        where: { id: materialItem.id },
                        data: { quantity: { decrement: enchantment.materialCount } }
                    });
                }
            }

            if (isSuccess) {
                if (existingEnchantment) {
                    // Upgrade existing enchantment
                    await tx.inventoryItemEnchantment.update({
                        where: { id: existingEnchantment.id },
                        data: { level: currentLevel }
                    });
                } else {
                    // Apply new enchantment
                    await tx.inventoryItemEnchantment.create({
                        data: {
                            inventoryItemId,
                            enchantmentId,
                            level: currentLevel
                        }
                    });
                }

                logger.info(`[EnchantmentService.applyEnchantment] Success`, {
                    inventoryItemId,
                    enchantmentId,
                    level: currentLevel
                });

                return {
                    success: true,
                    level: currentLevel,
                    enchantmentName: enchantment.name,
                    silverCost,
                    message: `Successfully enchanted ${item.template.name} to +${currentLevel}!`
                };
            } else {
                // Failed - materials lost, item preserved
                logger.info(`[EnchantmentService.applyEnchantment] Failed`, {
                    inventoryItemId,
                    enchantmentId,
                    level: currentLevel
                });

                return {
                    success: false,
                    level: currentLevel,
                    enchantmentName: enchantment.name,
                    silverCost,
                    message: `Enchantment failed! ${item.template.name} is preserved but materials were lost.`
                };
            }
        });
    }

    /**
     * Get available enchantments
     */
    async getAvailableEnchantments() {
        return await this.db.itemEnchantment.findMany({
            orderBy: { category: 'asc' }
        });
    }

    /**
     * Get enchantment preview (cost and bonuses)
     */
    async getEnchantmentPreview(inventoryItemId, enchantmentId) {
        const item = await this.db.inventoryItem.findUnique({
            where: { id: inventoryItemId },
            include: { enchantments: true }
        });

        if (!item) {
            throw new AppError(ErrorCodes.INVENTORY_ITEM_NOT_FOUND, 'Item not found.');
        }

        const enchantment = await this.db.itemEnchantment.findUnique({
            where: { id: enchantmentId }
        });

        if (!enchantment) {
            throw new AppError(ErrorCodes.INVALID_INPUT, 'Enchantment not found.');
        }

        // Determine current level
        const existingEnchantment = item.enchantments.find(
            e => e.enchantmentId === enchantmentId
        );

        let currentLevel = 0;
        let nextLevel = 1;

        if (existingEnchantment) {
            currentLevel = existingEnchantment.level;
            nextLevel = currentLevel + 1;
        }

        // Check if can apply
        const canApply = item.enchantments.length < 1 || existingEnchantment !== undefined;
        const isMaxLevel = currentLevel >= enchantment.maxLevel;

        // Calculate bonuses
        const currentBonus = this.calculateEnchantmentBonus(enchantment, currentLevel);
        const nextBonus = this.calculateEnchantmentBonus(enchantment, nextLevel);

        return {
            canApply,
            isMaxLevel,
            currentLevel,
            nextLevel,
            silverCost: this.getSilverCost(nextLevel),
            successRate: this.calculateSuccessRate(nextLevel),
            currentBonus,
            nextBonus,
            enchantment,
            itemName: item.template.name
        };
    }
}

module.exports = new EnchantmentService();
