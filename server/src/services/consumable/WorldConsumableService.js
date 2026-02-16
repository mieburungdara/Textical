const prisma = require('../../db');
const { ERROR_CODES, CONSUMABLE_CONSTANTS } = require('./ConsumableConstants');

const LOG_PREFIX = '[WORLD_CONSUMABLE_SERVICE]';

/**
 * Service for handling consumable items used in the world (buffs, permanent stats).
 */
class WorldConsumableService {
    /**
     * Use a consumable item instance from inventory
     * @param {number} userId - User ID
     * @param {number} heroId - Hero ID (optional)
     * @param {number} itemInstanceId - Inventory item instance ID
     * @returns {Object} Updated hero or buff
     */
    async useItemInstance(userId, heroId, itemInstanceId) {
        if (!this._isValidPositiveId(userId) || !this._isValidPositiveId(itemInstanceId)) {
            throw new Error(`${ERROR_CODES.INVALID_INPUT}: Invalid input IDs`);
        }
        
        const inv = await prisma.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { 
                template: true,
                user: { include: { region: true } }
            }
        });

        if (!inv || inv.userId !== userId) {
            throw new Error(ERROR_CODES.ITEM_NOT_FOUND);
        }

        if (inv.user?.region?.zoneType === 'BLACK') {
            throw new Error(ERROR_CODES.BLACK_ZONE_RESTRICTION);
        }
        
        if (inv.template.category !== "CONSUMABLE") {
            throw new Error(ERROR_CODES.ITEM_NOT_CONSUMABLE);
        }

        const buffData = this._getBuffData(inv.templateId);
        if (!buffData) {
            throw new Error(ERROR_CODES.NO_ITEM_EFFECT);
        }

        return await prisma.$transaction(async (tx) => {
            if (inv.quantity === 1) {
                await tx.inventoryItem.delete({ where: { id: inv.id } });
            } else {
                await tx.inventoryItem.update({
                    where: { id: inv.id },
                    data: { quantity: { decrement: 1 } }
                });
            }

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

            if (buffData.isPermanent) {
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

            if (buffData.durationTicks > CONSUMABLE_CONSTANTS.MAX_BUFF_DURATION_TICKS) {
                throw new Error(ERROR_CODES.BUFF_DURATION_EXCEEDED);
            }
            
            const worldTick = await this._getCurrentWorldTick();
            const expiresTick = worldTick + buffData.durationTicks;

            if (!this._isValidStatKey(buffData.statKey)) {
                throw new Error(ERROR_CODES.INVALID_STAT_KEY);
            }

            return await tx.heroBuff.create({
                data: {
                    heroId: targetHeroId,
                    itemId: inv.templateId,
                    name: inv.template.name,
                    statKey: buffData.statKey,
                    statValue: buffData.statValue,
                    isPercent: buffData.isPercent || false,
                    expiresTick: expiresTick
                }
            });
        });
    }

    async consumeItem(userId, heroId, templateId) {
        if (!this._isValidPositiveId(userId) || !this._isValidPositiveId(templateId)) {
            throw new Error(`${ERROR_CODES.INVALID_INPUT}: Invalid inputs`);
        }
        const inv = await prisma.inventoryItem.findFirst({
            where: { userId, templateId }
        });
        if (!inv) throw new Error(ERROR_CODES.ITEM_NOT_FOUND);
        return this.useItemInstance(userId, heroId, inv.id);
    }

    async _getCurrentWorldTick() {
        try {
            const worldState = await prisma.worldState.findFirst({ orderBy: { updatedAt: 'desc' } });
            return worldState?.currentTick || 0;
        } catch (e) {
            return 0;
        }
    }

    _getBuffData(id) {
        const data = {
            101: { statKey: "health_regen", statValue: 10, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.BASIC_POTION },
            4201: { statKey: "str", statValue: 2, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.DISH_BUFF },
            4202: { statKey: "int", statValue: 2, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.DISH_BUFF },
            4203: { statKey: "dex", statValue: 2, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.DISH_BUFF },
            4204: { statKey: "vit", statValue: 2, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.DISH_BUFF },
            4205: { statKey: "health_max", statValue: 50, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.DISH_BUFF },
            4401: { statKey: "health_regen", statValue: 5, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.ELIXIR_NORMAL },
            4402: { statKey: "mana_regen", statValue: 5, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.ELIXIR_NORMAL },
            4411: { statKey: "str", statValue: 20, durationTicks: CONSUMABLE_CONSTANTS.BUFF_DURATIONS_TICKS.ELIXIR_STRONG },
            4421: { statKey: "str", statValue: 1, isPermanent: true },
            4422: { statKey: "dex", statValue: 1, isPermanent: true },
            4423: { statKey: "int", statValue: 1, isPermanent: true },
            4424: { statKey: "vit", statValue: 1, isPermanent: true },
            4425: { statKey: "str", statValue: 1, isPermanent: true }
        };
        return data[id];
    }

    _isValidPositiveId(value) {
        return typeof value === 'number' && Number.isInteger(value) && value > 0;
    }

    _isValidStatKey(statKey) {
        return CONSUMABLE_CONSTANTS.VALID_STAT_KEYS.includes(statKey);
    }
}

module.exports = new WorldConsumableService();
