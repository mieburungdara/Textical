/**
 * StatRecoveryService
 * Handles recovery stats (HP/MP/Energy regeneration) and Time-To-Full calculations.
 * Single Responsibility: Recovery logic and detailed regen breakdown.
 * 
 * Note: "energy" refers to User.energy (player action points for travel/gathering/crafting).
 *       Hero.vitality is a separate core stat that affects max HP and is NOT handled here.
 */
const BaseService = require('../BaseService');

class StatRecoveryService extends BaseService {
    /**
     * @param {StatCalculationEngine} calculationEngine
     */
    constructor(calculationEngine) {
        super();
        this.calculationEngine = calculationEngine;
    }

    /**
     * Get recovery stats and TTF (Time-To-Full)
     * @param {number} heroId - Hero ID
     * @returns {Promise<Object>} Recovery details
     */
    async getRecoveryStats(heroId) {
        // Fetch basic hero data for current values
        const hero = await this.db.hero.findUnique({
            where: { id: heroId },
            include: { user: true }
        });
        
        if (!hero) throw new Error('Hero not found');
        
        // Calculate max stats and regen rates
        const stats = await this.calculationEngine.calculateHeroStats(heroId);
        
        const calculateTTF = (current, max, regen) => {
            if (current == null || max == null) return null;
            if (current >= max) return 0;
            if (regen <= 0) return Infinity;
            // 5-second tick interval usually? Or is regen per second?
            // "tick" logic isn't here, only rate. 
            // Assuming regen is "per tick" or "per second"?
            // Existing logic: Math.ceil((max - current) / regen)
            // If regen is 5, and missing 10, returns 2. 
            // If regen is per tick (e.g. 5 sec), then TTF is in ticks.
            // If user wants seconds, we need to know tick rate.
            // But let's keep original logic for now (returns unitless "ticks" or assuming 1 sec).
            return Math.ceil((max - current) / regen);
        };

        // If current values aren't in DB, assume full for display (transient state)
        // Note: Prisma might return null for optional fields if not set?
        // Actually hero.health should be set.
        const currentHp = hero.health ?? stats.health_max;
        const currentMana = hero.mana ?? stats.mana_max;
        // User.energy (formerly vitality) - player action points for travel/gathering/crafting
        const currentEnergy = hero.user?.energy ?? 100;
        const maxEnergy = hero.user?.maxEnergy ?? 100;

        // Energy regen default to 5 if not in stats? 
        // Original code: stats.energy_regen || 5
        
        return {
            hp: {
                current: currentHp,
                max: stats.health_max,
                regen: stats.hp_regen,
                ttf: calculateTTF(currentHp, stats.health_max, stats.hp_regen)
            },
            mana: {
                current: currentMana,
                max: stats.mana_max,
                regen: stats.mana_regen,
                ttf: calculateTTF(currentMana, stats.mana_max, stats.mana_regen)
            },
            energy: {
                current: currentEnergy,
                max: maxEnergy,
                regen: stats.energy_regen || 5, // Default base regen for energy
                ttf: calculateTTF(currentEnergy, maxEnergy, stats.energy_regen || 5)
            }
        };
    }
}

module.exports = StatRecoveryService;
