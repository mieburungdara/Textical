/**
 * AAA RepairCostResolver
 * Pure component for calculating the Silver cost to repair equipment.
 */
class RepairCostResolver {
    constructor() {
        this.BASE_REPAIR_FACTOR = 0.5; // Repairing 100% durability costs 50% of base value
    }

    /**
     * Calculates the repair cost for an item instance.
     * @param {Object} item - { template: { baseValue }, powerScale, currentDurability, maxDurability }
     * @returns {number} Cost in Silver.
     */
    resolveCost(item) {
        const missingDurability = item.maxDurability - item.currentDurability;
        if (missingDurability <= 0) return 0;

        const durabilityRatio = missingDurability / item.maxDurability;
        const baseValue = item.template.baseValue || 100;
        const scale = item.powerScale || 1.0;

        // Formula: BaseValue * Scale * Ratio * RepairFactor
        const cost = Math.ceil(baseValue * scale * durabilityRatio * this.BASE_REPAIR_FACTOR);

        return Math.max(1, cost);
    }
}

module.exports = new RepairCostResolver();
