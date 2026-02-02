/**
 * AAA SalvageResolver
 * Pure component for calculating materials returned from salvaging equipment.
 */
class SalvageResolver {
    constructor() {
        this.BASE_RETURN_RATE = 0.3; // 30% of materials returned
        this.ESSENCE_CHANCE_PER_TIER = 0.1; // 10% chance for rare essence
    }

    /**
     * Resolves the list of materials to return from salvaging.
     * @param {Object} recipe - Recipe used to create the item (with ingredients).
     * @param {string} quality - Item quality (COMMON, RARE, MASTERWORK).
     * @returns {Array} List of { templateId, quantity }.
     */
    resolveReturns(recipe, quality = "COMMON") {
        if (!recipe || !recipe.ingredients) return [];

        const returns = [];

        // 1. Calculate base material returns (30%)
        for (const ing of recipe.ingredients) {
            const qty = Math.max(1, Math.floor(ing.quantity * this.BASE_RETURN_RATE));
            returns.push({ templateId: ing.itemId, quantity: qty });
        }

        // 2. AAA: Rare Essence Recovery logic
        // If item is RARE+, low chance to get a "Magic Essence" (placeholder ID 999)
        const qualityWeight = this._getQualityWeight(quality);
        if (Math.random() < (this.ESSENCE_CHANCE_PER_TIER * qualityWeight)) {
            returns.push({ templateId: 999, quantity: 1 }); // 999 = Magic Essence Scraps
        }

        return returns;
    }

    _getQualityWeight(quality) {
        switch (quality) {
            case "RARE": return 1;
            case "MASTERWORK": return 2;
            case "LEGENDARY": return 5;
            default: return 0;
        }
    }
}

module.exports = new SalvageResolver();
