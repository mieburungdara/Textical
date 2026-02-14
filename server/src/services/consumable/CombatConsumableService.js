const prisma = require('../../db');
const { ERROR_CODES, CONSUMABLE_CONSTANTS } = require('./ConsumableConstants');
const battleRegistry = require('../../logic/battle/BattleRegistry');

const LOG_PREFIX = '[COMBAT_CONSUMABLE_SERVICE]';

/**
 * Service for handling consumable items used during combat.
 */
class CombatConsumableService {
    /**
     * Use Health Potion during combat
     * @param {number} userId - User ID
     * @param {number} heroId - Hero ID
     * @param {string} battleId - Battle ID
     * @returns {Object} Result with heal amount and status
     */
    async useHealthPotionInCombat(userId, heroId, battleId) {
        if (!this._isValidPositiveId(userId) || !this._isValidPositiveId(heroId)) {
            return { 
                success: false, 
                error: ERROR_CODES.INVALID_INPUT,
                message: "Invalid input IDs"
            };
        }

        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { region: true }
        });
        
        if (user && user.region && user.region.zoneType === 'BLACK') {
            return {
                success: false,
                error: ERROR_CODES.BLACK_ZONE_RESTRICTION,
                message: "Consumption of potions is strictly prohibited in the Black Zone."
            };
        }
        
        const battle = battleRegistry.get(battleId);
        if (!battle) {
            return { 
                success: false, 
                error: ERROR_CODES.NO_ACTIVE_BATTLE,
                message: "Battle not found or has ended"
            };
        }
        
        const hero = await prisma.hero.findUnique({ where: { id: heroId } });
        if (!hero) {
            return {
                success: false,
                error: ERROR_CODES.HERO_NOT_FOUND,
                message: "Hero not found"
            };
        }
        
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
        
        if (!unit.isPotionReady(battle)) {
            return {
                success: false,
                error: ERROR_CODES.POTION_COOLDOWN,
                message: `Potion cooldown active`,
                cooldownRemaining: unit.getCooldownRemaining(battle),
                retryAtTick: unit.potionCooldownReadyAt
            };
        }
        
        const alchemyLevel = await this._getUserAlchemyLabLevel(userId);
        let actualHeal;
        
        try {
            await prisma.$transaction(async (tx) => {
                const inventoryItem = await tx.inventoryItem.findFirst({
                    where: { userId, templateId: CONSUMABLE_CONSTANTS.HEALTH_POTION_ID }
                });
                
                if (!inventoryItem || inventoryItem.quantity <= 0) {
                    throw new Error('NO_POTIONS');
                }
                
                const remainingUses = unit.getPotionsRemaining(inventoryItem.quantity);
                if (remainingUses <= 0) {
                    throw new Error('NO_POTIONS_REMAINING');
                }
                
                if (inventoryItem.quantity === 1) {
                    await tx.inventoryItem.delete({ where: { id: inventoryItem.id } });
                } else {
                    await tx.inventoryItem.update({
                        where: { id: inventoryItem.id },
                        data: { quantity: { decrement: 1 } }
                    });
                }
                
                const healAmount = unit.calculatePotionHeal(alchemyLevel);
                actualHeal = unit.applyHeal(healAmount, battle);
                unit.usePotion(battle);
            });
            
            return {
                success: true,
                data: {
                    potionId: CONSUMABLE_CONSTANTS.HEALTH_POTION_ID,
                    healAmount: actualHeal,
                    currentHealth: unit.currentHealth,
                    cooldownRemaining: unit.getCooldownRemaining(battle),
                    tickUsed: battle.currentTick
                }
            };
        } catch (error) {
            console.error(`${LOG_PREFIX} Potion use failed:`, error);
            return {
                success: false,
                error: error.message === 'NO_POTIONS' ? ERROR_CODES.NO_POTIONS : 
                       error.message === 'NO_POTIONS_REMAINING' ? ERROR_CODES.NO_POTIONS_REMAINING : 
                       ERROR_CODES.INVENTORY_ERROR,
                message: error.message
            };
        }
    }

    async _getUserAlchemyLabLevel(userId) {
        try {
            const guildMember = await prisma.guildMember.findFirst({
                where: { userId },
                include: {
                    guild: {
                        include: {
                            facilities: {
                                where: { type: 'ALCHEMY_LAB' }
                            }
                        }
                    }
                }
            });
            return guildMember?.guild?.facilities?.[0]?.level || 0;
        } catch (error) {
            console.error(`${LOG_PREFIX} Alchemy level fetch failed:`, error);
            return 0;
        }
    }

    _isValidPositiveId(value) {
        return typeof value === 'number' && Number.isInteger(value) && value > 0;
    }
}

module.exports = new CombatConsumableService();
