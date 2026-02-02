/**
 * AAA QualityResolver
 * Pure component for determining crafted item quality and power scaling.
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
     * @returns {Object} { quality, powerScale }
     */
    resolve(heroLevel = 1, regionalVolume = 0) {
        let quality = "COMMON";
        let powerScale = 1.0;

        const isHighSurplus = regionalVolume >= this.SURPLUS_THRESHOLD;

        // 1. Logic for MASTERWORK (Level 50+ AND High Surplus)
        if (heroLevel >= this.SKILL_THRESHOLD_MASTER && isHighSurplus) {
            quality = "MASTERWORK";
            powerScale = 1.3; // 30% stronger stats
        }
        // 2. Logic for RARE (Level 25+ OR High Surplus)
        else if (heroLevel >= this.SKILL_THRESHOLD_RARE || isHighSurplus) {
            quality = "RARE";
            powerScale = 1.15; // 15% stronger stats
        }

        return { quality, powerScale: parseFloat(powerScale.toFixed(2)) };
    }
}

module.exports = new QualityResolver();
