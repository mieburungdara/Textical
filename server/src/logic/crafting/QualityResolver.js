/**
 * AAA QualityResolver
 * Pure component for determining crafted item quality and power scaling.
 * Enhanced with Specialized Station luck bonuses and stat caps.
 */
class QualityResolver {
    constructor() {
        this.SURPLUS_THRESHOLD = 500; // Regional surplus requirement for Masterwork
        this.SKILL_THRESHOLD_RARE = 25; // Hero unit level for Rare
        this.SKILL_THRESHOLD_MASTER = 50; // Hero unit level for Masterwork
        
        // Quality multipliers for stat scaling
        this.QUALITY_MULTIPLIERS = {
            'COMMON': 1.0,
            'UNCOMMON': 1.1,
            'RARE': 1.15,
            'EPIC': 1.25,
            'MASTERWORK': 1.3,
            'LEGENDARY': 1.5
        };
        
        // Quality-based stat caps
        this.QUALITY_STAT_CAPS = {
            'COMMON': { maxStat: 50, maxItemLevel: 20 },
            'UNCOMMON': { maxStat: 75, maxItemLevel: 30 },
            'RARE': { maxStat: 100, maxItemLevel: 40 },
            'EPIC': { maxStat: 150, maxItemLevel: 50 },
            'MASTERWORK': { maxStat: 200, maxItemLevel: 60 },
            'LEGENDARY': { maxStat: 300, maxItemLevel: 70 }
        };
    }

    /**
     * Resolves the quality tier and power scale for a crafted item.
     * @param {number} heroLevel - Hero unit level (proxy for skill).
     * @param {number} regionalVolume - 24h extraction volume of primary material.
     * @param {number} luckBonus - Luck bonus from station/region (0.0 to 1.0).
     * @returns {Object} { quality, powerScale, qualityMultiplier, statCap }
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

        return {
            quality,
            powerScale: parseFloat(powerScale.toFixed(2)),
            qualityMultiplier: this.QUALITY_MULTIPLIERS[quality] || 1.0,
            statCap: this.QUALITY_STAT_CAPS[quality] || this.QUALITY_STAT_CAPS['COMMON']
        };
    }

    /**
     * Get quality multiplier for a given quality tier.
     * @param {string} quality - Quality tier (COMMON, RARE, etc.)
     * @returns {number} Multiplier value
     */
    getQualityMultiplier(quality) {
        return this.QUALITY_MULTIPLIERS[quality] || 1.0;
    }

    /**
     * Get stat cap for a given quality tier.
     * @param {string} quality - Quality tier
     * @returns {Object} { maxStat, maxItemLevel }
     */
    getStatCap(quality) {
        return this.QUALITY_STAT_CAPS[quality] || this.QUALITY_STAT_CAPS['COMMON'];
    }

    /**
     * Apply quality scaling to a stat value.
     * @param {number} baseValue - Base stat value
     * @param {string} quality - Quality tier
     * @param {string} statKey - Stat key (for special handling)
     * @returns {number} Scaled stat value
     */
    applyQualityScaling(baseValue, quality, statKey = null) {
        const multiplier = this.getQualityMultiplier(quality);
        
        // Some stats have diminishing returns at higher qualities
        if (statKey && ['crit_chance', 'dodge_rate', 'block_chance'].includes(statKey)) {
            // Percent-based stats have reduced scaling
            const reducedMultiplier = 1 + (multiplier - 1) * 0.5;
            return baseValue * reducedMultiplier;
        }
        
        return baseValue * multiplier;
    }

    /**
     * Check if a stat value exceeds the quality-based cap.
     * @param {number} statValue - Current stat value
     * @param {string} quality - Quality tier
     * @returns {boolean} Whether the stat is capped
     */
    isStatCapped(statValue, quality) {
        const cap = this.getStatCap(quality);
        return statValue > cap.maxStat;
    }

    /**
     * Get the maximum possible power scale for a given hero level.
     * @param {number} heroLevel - Hero unit level
     * @returns {number} Maximum power scale
     */
    getMaxPowerScale(heroLevel) {
        if (heroLevel >= this.SKILL_THRESHOLD_MASTER) {
            return 1.3; // Masterwork
        } else if (heroLevel >= this.SKILL_THRESHOLD_RARE) {
            return 1.15; // Rare
        }
        return 1.0; // Common
    }
}

module.exports = new QualityResolver();