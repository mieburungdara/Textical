const BaseService = require('./BaseService');

/**
 * SpiritService
 * Handles nocturnal encounters with spirits based on Region spiritDensity.
 */
class SpiritService extends BaseService {
    constructor() {
        super();
        this.NIGHT_START_HOUR = 20; // 8 PM
        this.NIGHT_END_HOUR = 5;    // 5 AM
    }

    /**
     * Check if a spirit encounter occurs for a user in a region.
     * @param {number} userId 
     * @param {number} regionId 
     * @returns {Promise<object|null>} The spirit encountered or null
     */
    async checkSpiritEncounter(userId, regionId) {
        // 1. Check if it's night time
        const worldState = await this.db.worldState.findUnique({ where: { id: 1 } });
        if (!worldState) return null;
        const isNight = worldState.currentHour >= this.NIGHT_START_HOUR || worldState.currentHour <= this.NIGHT_END_HOUR;

        if (!isNight) return null;

        // 2. Get Region spirit density and available spirits
        const region = await this.db.regionTemplate.findUnique({
            where: { id: regionId },
            include: {
                spirits: {
                    include: { spirit: true }
                }
            }
        });

        if (!region || region.spiritDensity <= 0) return null;

        // 3. Roll for encounter based on density
        const roll = Math.random();
        if (roll > region.spiritDensity) return null;

        // 4. Determine which spirit from the linked spirits
        if (!region.spirits || region.spirits.length === 0) return null;
        
        // Randomly pick one spirit linked to this region
        const randomIndex = Math.floor(Math.random() * region.spirits.length);
        const selectedSpirit = region.spirits[randomIndex].spirit;

        return selectedSpirit;
    }

    /**
     * Apply spirit effect to user stats or state.
     * @param {number} userId 
     * @param {object} spirit 
     */
    async applySpiritEffect(userId, spirit) {
        const durationMinutes = 30;
        const expiresAt = new Date(Date.now() + durationMinutes * 60 * 1000);

        // Update User's activeSpiritId and expiration - New spirit replaces the old one (No stacking)
        await this.db.user.update({
            where: { id: userId },
            data: { 
                activeSpiritId: spirit.id,
                activeSpiritExpiresAt: expiresAt
            }
        });

        console.log(`[SpiritService]: User ${userId} encountered ${spirit.name}. Effect: ${spirit.effectType} on ${spirit.statKey} (${spirit.statValue}). Expires at: ${expiresAt.toISOString()}`);
        
        return {
            success: true,
            message: spirit.lore,
            spiritName: spirit.name,
            expiresAt: expiresAt,
            effect: {
                id: spirit.id,
                key: spirit.statKey,
                value: spirit.statValue,
                type: spirit.effectType
            }
        };
    }

    /**
     * Gets the active spirit for a user, automatically clearing it if expired.
     * @param {number} userId 
     * @returns {Promise<object|null>}
     */
    async getValidActiveSpirit(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { activeSpirit: true }
        });

        if (!user || !user.activeSpiritId) return null;

        // Check for expiration
        if (user.activeSpiritExpiresAt && user.activeSpiritExpiresAt < new Date()) {
            console.log(`[SpiritService]: Spirit effect for user ${userId} has expired. Clearing.`);
            await this.db.user.update({
                where: { id: userId },
                data: {
                    activeSpiritId: null,
                    activeSpiritExpiresAt: null
                }
            });
            return null;
        }

        return user.activeSpirit;
    }
}

module.exports = new SpiritService();
