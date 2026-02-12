const prisma = require('../db');

// === Logger Prefix ===
const LOG_PREFIX = '[CONSUMABLE_SERVICE]';

// === Error Codes Registry ===
const ERROR_CODES = {
    NO_ACTIVE_BATTLE: 'NO_ACTIVE_BATTLE',
    HERO_NOT_IN_BATTLE: 'HERO_NOT_IN_BATTLE',
    HERO_IS_DEAD: 'HERO_IS_DEAD',
    POTION_COOLDOWN: 'POTION_COOLDOWN',
    NO_POTIONS: 'NO_POTIONS',
    NO_POTIONS_REMAINING: 'NO_POTIONS_REMAINING',
    INVENTORY_ERROR: 'INVENTORY_ERROR',
    ITEM_NOT_FOUND: 'ITEM_NOT_FOUND',
    ITEM_NOT_CONSUMABLE: 'ITEM_NOT_CONSUMABLE',
    NO_ITEM_EFFECT: 'NO_ITEM_EFFECT',
    NO_HERO_SELECTED: 'NO_HERO_SELECTED',
    INVALID_INPUT: 'INVALID_INPUT',
    HERO_NOT_FOUND: 'HERO_NOT_FOUND',
    INVALID_STAT_KEY: 'INVALID_STAT_KEY',
    BUFF_DURATION_EXCEEDED: 'BUFF_DURATION_EXCEEDED'
};

// === Magic Number Constants ===
const CONSUMABLE_CONSTANTS = {
    // Health Potion (AAA Combat)
    HEALTH_POTION_ID: 2001,
    BASE_HEAL_AMOUNT: 50,
    ALCHEMY_BONUS_PER_LEVEL: 0.03,
    
    // === Tick-based Constants ===
    // Default potion cooldown in ticks (e.g., 3 seconds = 180 ticks @ 60 ticks/sec)
    POTION_COOLDOWN_TICKS: 180,
    
    // Tick per second (used for tick-to-time conversions)
    TICKS_PER_SECOND: 60,
    
    // All buff durations are stored in TICKS (not seconds)
    // Formula: ticks = seconds * TICKS_PER_SECOND
    BUFF_DURATIONS_TICKS: {
        BASIC_POTION: 18000,    // 300 seconds * 60 = 18000 ticks (5 minutes)
        DISH_BUFF: 36000,       // 600 seconds * 60 = 36000 ticks (10 minutes)
        ELIXIR_NORMAL: 72000,   // 1200 seconds * 60 = 72000 ticks (20 minutes)
        ELIXIR_STRONG: 108000   // 1800 seconds * 60 = 108000 ticks (30 minutes)
    },
    
    // Maximum buff duration in ticks (24 hours = 86400 seconds * 60 = 5184000 ticks)
    MAX_BUFF_DURATION_TICKS: 5184000,
    
    // Valid stat keys for buff application
    VALID_STAT_KEYS: [
        'hp_regen', 'mana_regen', 'str', 'int', 'dex', 'vit', 
        'health_max', 'mana_max', 'attack', 'defense', 'speed'
    ]
};

// === Tick-based time converter utility ===
const TICK_UTILS = {
    /**
     * Convert seconds to ticks
     * @param {number} seconds - Duration in seconds
     * @returns {number} Duration in ticks
     */
    secondsToTicks(seconds) {
        return Math.round(seconds * CONSUMABLE_CONSTANTS.TICKS_PER_SECOND);
    },
    
    /**
     * Calculate expiresAt tick from current battle tick
     * @param {number} currentTick - Current battle tick
     * @param {number} durationTicks - Duration in ticks
     * @returns {number} Expires at tick
     */
    calculateExpiresTick(currentTick, durationTicks) {
        return currentTick + durationTicks;
    }
};

// === BattleRegistry at module level ===
const battleRegistry = require('../logic/battle/BattleRegistry');

class ConsumableService {
    // === Static Getters ===
    static get ERROR_CODES() { return ERROR_CODES; }
    static get CONSTANTS() { return CONSUMABLE_CONSTANTS; }
    
    // === Instance Properties ===
    HEALTH_POTION_ID = CONSUMABLE_CONSTANTS.HEALTH_POTION_ID;
    BASE_HEAL_AMOUNT = CONSUMABLE_CONSTANTS.BASE_HEAL_AMOUNT;
    
    /**
     * Use Health Potion during combat
     * @param {number} userId - User ID (must be positive integer)
     * @param {number} heroId - Hero ID (must be positive integer)
     * @param {string} battleId - Battle ID
     * @returns {Object} Result with heal amount and status
     */
    async useHealthPotionInCombat(userId, heroId, battleId) {
        // === Input Sanitization ===
        if (!this._isValidPositiveId(userId)) {
            return { 
                success: false, 
                error: ERROR_CODES.INVALID_INPUT,
                message: "Invalid userId"
            };
        }
        if (!this._isValidPositiveId(heroId)) {
            return { 
                success: false, 
                error: ERROR_CODES.INVALID_INPUT,
                message: "Invalid heroId"
            };
        }
        
        // Get battle from registry
        const battle = battleRegistry.get(battleId);
        if (!battle) {
            return { 
                success: false, 
                error: ERROR_CODES.NO_ACTIVE_BATTLE,
                message: "Battle not found or has ended"
            };
        }
        
        // === Hero Validation (FIRST before battle check) ===
        const hero = await prisma.hero.findUnique({
            where: { id: heroId }
        });
        if (!hero) {
            return {
                success: false,
                error: ERROR_CODES.HERO_NOT_FOUND,
                message: "Hero not found in database"
            };
        }
        
        // Check if hero is actively fighting
        const unit = battle.units.find(u => u.heroId === heroId);
        if (!unit) {
            return {
                success: false,
                error: ERROR_CODES.HERO_NOT_IN_BATTLE,
                message: "Hero is not participating in this battle"
            };
        }
        
        if (unit.isDead) {
            return {
                success: false,
                error: ERROR_CODES.HERO_IS_DEAD,
                message: "Cannot use potion on a dead hero"
            };
        }
        
        // Check cooldown (TICK-BASED)
        if (!unit.isPotionReady(battle)) {
            const remainingTicks = unit.getCooldownRemaining(battle);
            return {
                success: false,
                error: ERROR_CODES.POTION_COOLDOWN,
                message: `Potion cooldown active`,
                cooldownRemaining: remainingTicks,
                retryAtTick: unit.potionCooldownReadyAt
            };
        }
        
        // === Get Guild Alchemy Lab bonus BEFORE transaction ===
        const alchemyLevel = await this._getUserAlchemyLabLevel(userId);
        
        // === Inventory check INSIDE transaction to prevent race condition ===
        let actualHeal;
        
        try {
            const result = await prisma.$transaction(async (tx) => {
                // Check inventory inside transaction
                const inventoryItem = await tx.inventoryItem.findFirst({
                    where: { userId, templateId: this.HEALTH_POTION_ID }
                });
                
                if (!inventoryItem || inventoryItem.quantity <= 0) {
                    throw new Error('NO_POTIONS');
                }
                
                // Check remaining uses
                const remainingUses = unit.getPotionsRemaining(inventoryItem.quantity);
                if (remainingUses <= 0) {
                    throw new Error('NO_POTIONS_REMAINING');
                }
                
                // Decrement inventory
                if (inventoryItem.quantity === 1) {
                    await tx.inventoryItem.delete({ where: { id: inventoryItem.id } });
                } else {
                    await tx.inventoryItem.update({
                        where: { id: inventoryItem.id },
                        data: { quantity: { decrement: 1 } }
                    });
                }
                
                // Calculate heal amount
                const healAmount = unit.calculatePotionHeal(alchemyLevel);
                
                // Apply potion to battle unit state (outside DB tx, in-memory only)
                actualHeal = unit.applyHeal(healAmount, battle);
                unit.usePotion(battle);
                
                // Return updated quantity for response
                return {
                    inventoryItemId: inventoryItem.id,
                    remainingQuantity: inventoryItem.quantity - 1
                };
            });
            
            // Transaction succeeded, battle state already updated
            return {
                success: true,
                data: {
                    potionId: this.HEALTH_POTION_ID,
                    healAmount: actualHeal,
                    baseAmount: this.BASE_HEAL_AMOUNT,
                    guildBonusMultiplier: alchemyLevel * CONSUMABLE_CONSTANTS.ALCHEMY_BONUS_PER_LEVEL,
                    guildBonusAmount: actualHeal - this.BASE_HEAL_AMOUNT,
                    currentHealth: unit.currentHealth,
                    potionUsedInBattle: unit.potionUsedInBattle,
                    cooldownRemaining: unit.getCooldownRemaining(battle),
                    remainingPotions: unit.getPotionsRemaining(unit.inventoryQuantity || 0),
                    tickUsed: battle.currentTick
                }
            };
            
        } catch (txError) {
            console.error(`${LOG_PREFIX} Transaction failed for user ${userId}:`, txError);
            
            // Handle specific errors
            if (txError.message === 'NO_POTIONS') {
                return {
                    success: false,
                    error: ERROR_CODES.NO_POTIONS,
                    message: "No Health Potions in inventory"
                };
            }
            if (txError.message === 'NO_POTIONS_REMAINING') {
                return {
                    success: false,
                    error: ERROR_CODES.NO_POTIONS_REMAINING,
                    message: "All potions for this battle have been used"
                };
            }
            
            return {
                success: false,
                error: ERROR_CODES.INVENTORY_ERROR,
                message: "Failed to consume potion from inventory"
            };
        }
    }
    
    /**
     * Check if value is a valid positive integer ID
     * @private
     * @param {number} value - Value to validate
     * @returns {boolean}
     */
    _isValidPositiveId(value) {
        return typeof value === 'number' && Number.isInteger(value) && value > 0;
    }
    
    /**
     * Validate stat key against allowed list
     * @private
     * @param {string} statKey - Stat key to validate
     * @returns {boolean}
     */
    _isValidStatKey(statKey) {
        return CONSUMABLE_CONSTANTS.VALID_STAT_KEYS.includes(statKey);
    }
    
    /**
     * Get current world tick for tick-based buff expiration
     * @private
     * @returns {number} Current world tick
     */
    async _getCurrentWorldTick() {
        // In a real implementation, this would fetch from a WorldTickService
        // For now, we use a simple approximation or database tracking
        // Consider implementing a global tick counter service
        
        // Option 1: Use simulation environment tick
        const simEnv = require('../logic/simulation/SimEnvironmentSystem');
        if (simEnv && simEnv.currentTick) {
            return simEnv.currentTick;
        }
        
        // Option 2: Fallback to DB-based tick tracking
        // This should be replaced with proper tick service in production
        try {
            const worldState = await prisma.worldState.findFirst({
                orderBy: { updatedAt: 'desc' }
            });
            if (worldState && worldState.currentTick) {
                return worldState.currentTick;
            }
        } catch (e) {
            // Ignore DB errors
        }
        
        // Default fallback (should not reach here in production)
        return 0;
    }
    async _getUserAlchemyLabLevel(userId) {
        // Validate input
        if (!this._isValidPositiveId(userId)) {
            console.warn(`${LOG_PREFIX} Invalid userId passed to _getUserAlchemyLabLevel`);
            return 0;
        }
        
        try {
            // Use more efficient query - only get facilities
            const guildMember = await prisma.guildMember.findFirst({
                where: { userId },
                include: {
                    guild: {
                        include: {
                            facilities: {
                                where: {
                                    OR: [
                                        { type: 'ALCHEMY_LAB' },
                                        { name: { contains: 'Alchemy', mode: 'insensitive' } }
                                    ]
                                }
                            }
                        }
                    }
                }
            });
            
            if (!guildMember) {
                return 0;
            }
            
            const alchemyLab = guildMember.guild?.facilities?.[0];
            return alchemyLab ? alchemyLab.level || 0 : 0;
            
        } catch (error) {
            console.error(`${LOG_PREFIX} Failed to get alchemy level for user ${userId}:`, error);
            return 0;
        }
    }
    
    /**
     * Use a consumable item instance from inventory
     * @param {number} userId - User ID (must be positive integer)
     * @param {number} heroId - Hero ID (optional, auto-selects main hero if not provided)
     * @param {number} itemInstanceId - Inventory item instance ID
     * @returns {Object} Updated hero with buff or permanent stat applied
     * @throws {Error} When item not found, not consumable, or no effect
     */
    async useItemInstance(userId, heroId, itemInstanceId) {
        // === Input Sanitization ===
        if (!this._isValidPositiveId(userId)) {
            throw new Error(`${ERROR_CODES.INVALID_INPUT}: Invalid userId`);
        }
        if (!this._isValidPositiveId(itemInstanceId)) {
            throw new Error(`${ERROR_CODES.INVALID_INPUT}: Invalid itemInstanceId`);
        }
        
        const inv = await prisma.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true }
        });

        if (!inv || inv.userId !== userId) {
            throw new Error(ERROR_CODES.ITEM_NOT_FOUND);
        }
        if (inv.template.category !== "CONSUMABLE") {
            throw new Error(ERROR_CODES.ITEM_NOT_CONSUMABLE);
        }

        const templateId = inv.templateId;
        const item = inv.template;

        // Define Buff Logic
        const buffData = this._getBuffData(templateId);
        if (!buffData) {
            throw new Error(ERROR_CODES.NO_ITEM_EFFECT);
        }

        // Apply Buff or Permanent Stat in Transaction
        return await prisma.$transaction(async (tx) => {
            // Decrement inventory
            if (inv.quantity === 1) {
                await tx.inventoryItem.delete({ where: { id: inv.id } });
            } else {
                await tx.inventoryItem.update({
                    where: { id: inv.id },
                    data: { quantity: { decrement: 1 } }
                });
            }

            // If no hero provided, try to find user's main hero
            let targetHeroId = heroId;
            if (!targetHeroId || targetHeroId <= 0) {
                const mainHero = await tx.hero.findFirst({
                    where: { userId, isMain: true }
                });
                if (mainHero) targetHeroId = mainHero.id;
            }

            if (!targetHeroId) {
                throw new Error(ERROR_CODES.NO_HERO_SELECTED);
            }

            // PERMANENT STAT LOGIC
            if (buffData.isPermanent) {
                // Validate stat key
                if (!this._isValidStatKey(buffData.statKey)) {
                    throw new Error(ERROR_CODES.INVALID_STAT_KEY);
                }
                
                const updateData = {};
                updateData[buffData.statKey] = { increment: buffData.statValue };
                return await tx.hero.update({
                    where: { id: targetHeroId },
                    data: updateData
                });
            }

            // TEMPORARY BUFF LOGIC (Tick-Based)
            // Validate buff duration in ticks
            const maxDurationTicks = CONSUMABLE_CONSTANTS.MAX_BUFF_DURATION_TICKS;
            if (buffData.durationTicks > maxDurationTicks) {
                throw new Error(ERROR_CODES.BUFF_DURATION_EXCEEDED);
            }
            
            // Calculate expiration (tick-based for consistency)
            // Note: For out-of-combat buffs, we use a global/world tick counter
            // In a real implementation, this would come from a WorldTickService
            const worldTick = await this._getCurrentWorldTick();
            const expiresTick = worldTick + buffData.durationTicks;
            
            // For DB compatibility, also store expiresAt (derived from ticks)
            const now = new Date();
            const estimatedExpiresAt = new Date(now.getTime() + (buffData.durationTicks / CONSUMABLE_CONSTANTS.TICKS_PER_SECOND * 1000));

            // Validate stat key for temporary buffs too
            if (!this._isValidStatKey(buffData.statKey)) {
                throw new Error(ERROR_CODES.INVALID_STAT_KEY);
            }

            return await tx.heroBuff.create({
                data: {
                    heroId: targetHeroId,
                    itemId: templateId,
                    name: item.name,
                    statKey: buffData.statKey,
                    statValue: buffData.statValue,
                    isPercent: buffData.isPercent || false,
                    expiresAt: estimatedExpiresAt,
                    // Tick-based expiration (primary)
                    expiresTick: expiresTick
                }
            });
        });
    }

    /**
     * Consume an item by template ID (legacy support)
     * @param {number} userId - User ID
     * @param {number} heroId - Hero ID
     * @param {number} templateId - Item template ID
     * @returns {Object} Updated hero
     * @throws {Error} When item not found or invalid input
     */
    async consumeItem(userId, heroId, templateId) {
        // Input validation
        if (!this._isValidPositiveId(userId)) {
            throw new Error(`${ERROR_CODES.INVALID_INPUT}: Invalid userId`);
        }
        if (!this._isValidPositiveId(templateId)) {
            throw new Error(`${ERROR_CODES.INVALID_INPUT}: Invalid templateId`);
        }
        
        const inv = await prisma.inventoryItem.findFirst({
            where: { userId, templateId }
        });
        if (!inv) throw new Error(ERROR_CODES.ITEM_NOT_FOUND);
        return this.useItemInstance(userId, heroId, inv.id);
    }

    /**
     * Get buff data for a consumable item
     * Note: This maps to template IDs, NOT combat Health Potion IDs (2001+)
     * Combat Health Potions use separate tick-based mechanics via battleUnit
     * @param {number} id - Item template ID
     * @returns {Object|null} Buff configuration or null if not found
     */
    _getBuffData(id) {
        const data = {
            // BASIC POTIONS (durationTicks = seconds * TICKS_PER_SECOND)
            101: { 
                statKey: "health_regen", 
                statValue: 10, 
                durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.BASIC_POTION 
            },
            
            // DISHES
            4201: { statKey: "str", statValue: 2, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.DISH_BUFF },
            4202: { statKey: "int", statValue: 2, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.DISH_BUFF },
            4203: { statKey: "dex", statValue: 2, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.DISH_BUFF },
            4204: { statKey: "vit", statValue: 2, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.DISH_BUFF },
            4205: { statKey: "health_max", statValue: 50, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.DISH_BUFF },
            
            // ELIXIRS
            4401: { statKey: "health_regen", statValue: 5, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.ELIXIR_NORMAL },
            4402: { statKey: "mana_regen", statValue: 5, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.ELIXIR_NORMAL },
            4411: { statKey: "str", statValue: 20, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.ELIXIR_STRONG },
            
            // PERMANENT STAT ELIXIRS
            4421: { statKey: "str", statValue: 1, isPermanent: true },
            4422: { statKey: "dex", statValue: 1, isPermanent: true },
            4423: { statKey: "int", statValue: 1, isPermanent: true },
            4424: { statKey: "vit", statValue: 1, isPermanent: true },
            4425: { statKey: "str", statValue: 1, isPermanent: true } // Elixir of Gods
        };
        return data[id];
    }
}

// Export class and utilities
module.exports = new ConsumableService();
module.exports.ERROR_CODES = ERROR_CODES;
module.exports.CONSUMABLE_CONSTANTS = CONSUMABLE_CONSTANTS;
module.exports.TICK_UTILS = TICK_UTILS;
