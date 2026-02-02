/**
 * AAA QualityResolver
 * Pure component for determining crafted item quality and power scaling.
 * Enhanced with Specialized Station luck bonuses.
 */
class QualityResolver {
    constructor() {
        this.SURPLUS_THRESHOLD = 500; // Regional surplus requirement for Masterwork
        this.SKILL_THRESHOLD_RARE = 25; // Hero unit level for Rare
        this.SKILL_THRESHOLD_MASTER = 50; // Hero unit level for Masterwork
    }

    /**
     * Resolves the quality tier and power scale for a crafted item.
     * @param {number} heroLevel - Hero unit level (proxy for skill).
     * @param {number} regionalVolume - 24h extraction volume of primary material.
     * @param {number} luckBonus - Luck bonus from station/region (0.0 to 1.0).
     * @returns {Object} { quality, powerScale }
     */
    resolve(heroLevel = 1, regionalVolume = 0, luckBonus = 0.0) {
        let quality = "COMMON";
        let powerScale = 1.0;

        const isHighSurplus = regionalVolume >= this.SURPLUS_THRESHOLD;
        const roll = Math.random();

        // 1. Logic for MASTERWORK (Threshold + Roll + Luck)
        // High level + Surplus + Roll (10% base + luck)
        if (heroLevel >= this.SKILL_THRESHOLD_MASTER && isHighSurplus) {
            if (roll < (0.15 + luckBonus)) {
                quality = "MASTERWORK";
                powerScale = 1.3;
            } else {
                quality = "RARE";
                powerScale = 1.15;
            }
        }
        // 2. Logic for RARE (Level 25+ OR High Surplus)
        else if (heroLevel >= this.SKILL_THRESHOLD_RARE || isHighSurplus) {
            // Chance based on level/surplus + luck
            const rareChance = 0.20 + (heroLevel / 200) + luckBonus;
            if (roll < rareChance) {
                quality = "RARE";
                powerScale = 1.15;
            }
        }

        return { quality, powerScale: parseFloat(powerScale.toFixed(2)) };
    }
}

module.exports = new QualityResolver();