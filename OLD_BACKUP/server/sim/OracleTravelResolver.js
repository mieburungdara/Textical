/**
 * AAA OracleTravelResolver
 * Pure component for scoring regions based on bot archetypes.
 * Used to drive migration decisions.
 */
class OracleTravelResolver {
    constructor() {
        this.ARCHETYPE_PREFERENCES = {
            "CRAFTER": {
                specializations: ["BLACKSMITH_HUB", "CARPENTRY_MILL", "ALCHEMIST_GARDEN"],
                weight: 50 // High priority for specialized workshops
            },
            "GATHERER": {
                specializations: ["BLACKSMITH_HUB", "CARPENTRY_MILL"], // Towns where materials are needed
                weight: 20
            },
            "WARRIOR": {
                specializations: [], // Warriors prefer high-level monster regions (not handled here yet)
                weight: 0
            },
            "OUTLAW": {
                specializations: [],
                weight: 0
            }
        };
    }

    /**
     * Calculates a "Desirability Score" for a region based on an archetype.
     * @param {Object} region - { id, specialization, regionalTaxRate }
     * @param {string} archetype - Bot archetype.
     * @returns {number} Score (Higher is better).
     */
    scoreRegion(region, archetype) {
        let score = 100; // Base score

        const pref = this.ARCHETYPE_PREFERENCES[archetype];
        if (!pref) return score;

        // 1. Specialization Bonus
        if (region.specialization && pref.specializations.includes(region.specialization)) {
            score += pref.weight;
        }

        // 2. Tax Penalty (Lower tax is better)
        const taxImpact = Math.floor((0.20 - region.regionalTaxRate) * 100);
        score += taxImpact;

        return score;
    }

    /**
     * Decides if a bot should move to a target region.
     * @returns {boolean} True if target score is significantly higher.
     */
    shouldMigrate(currentScore, targetScore) {
        // Require at least 20 points improvement to justify travel
        return targetScore > (currentScore + 20);
    }
}

module.exports = new OracleTravelResolver();
