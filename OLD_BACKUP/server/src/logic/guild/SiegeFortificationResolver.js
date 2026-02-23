/**
 * AAA SiegeFortificationResolver
 * Pure component for calculating fortification damage and maintenance.
 */
class SiegeFortificationResolver {
    constructor() {
        this.DAMAGE_PER_VICTORY_PERCENT = 0.10; // 10% of Max
        this.REPAIR_COST_PER_POINT = 100; // 100 Silver per point
    }

    /**
     * Calculates the damage to apply to a territory's fortification.
     * @param {number} maxFortification
     * @returns {number} Damage points.
     */
    resolveDamage(maxFortification) {
        return Math.floor(maxFortification * this.DAMAGE_PER_VICTORY_PERCENT);
    }

    /**
     * Calculates the cost to repair fortification points.
     * @param {number} pointsToRepair
     * @returns {number} Cost in Silver.
     */
    resolveRepairCost(pointsToRepair) {
        return pointsToRepair * this.REPAIR_COST_PER_POINT;
    }
}

module.exports = new SiegeFortificationResolver();
