/**
 * AAA AffixResolver
 * Pure logic for mapping material templates to magical traits.
 */
class AffixResolver {
    constructor() {
        this.AFFIX_MAP = {
            3001: 1, // Fire Essence -> FLAME_STRIKE
            3002: 2, // Vampiric Fang -> LIFE_LEECH
            3003: 3  // Wind Feather -> SWIFTNESS
        };
    }

    /**
     * Resolves a trait ID from a material template ID.
     */
    resolveTraitId(materialTemplateId) {
        return this.AFFIX_MAP[materialTemplateId] || null;
    }

    /**
     * Gets a descriptive suffix for the item based on the affix.
     */
    getSuffix(traitId) {
        const suffixes = {
            1: "of Embers",
            2: "of the Bat",
            3: "of Haste"
        };
        return suffixes[traitId] || "";
    }
}

module.exports = new AffixResolver();
