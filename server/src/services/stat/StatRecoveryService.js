/**
 * StatRecoveryService
 * Handles recovery stats (HP/MP/Vitality regeneration) and Time-To-Full calculations.
 * Single Responsibility: Recovery logic and detailed regen breakdown.
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
        const currentVitality = hero.vitality ?? hero.user?.vitality ?? 100;
        const maxVitality = hero.user?.maxVitality ?? stats.vitality_max ?? 100;

        // Vitality regen default to 5 if not in stats? 
        // Original code: stats.vitality_regen || 5
        
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
            vitality: {
                current: currentVitality,
                max: maxVitality,
                regen: stats.vitality_regen || 5, // Default base regen for vitality
                ttf: calculateTTF(currentVitality, maxVitality, stats.vitality_regen || 5)
            }
        };
    }
}

module.exports = StatRecoveryService;
