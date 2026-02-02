/**
 * AAA StationBuffResolver
 * Pure component for resolving localized crafting buffs based on region specialization
 * and resource abundance.
 */
class StationBuffResolver {
    constructor() {
        this.BUFFS = {
            "BLACKSMITH_HUB": {
                categories: ["EQUIPMENT", "TOOL"],
                speedMult: 0.8, // 20% Faster
                qualityLuck: 0.1 // +10% Better Quality chance
            },
            "ALCHEMIST_GARDEN": {
                categories: ["CONSUMABLE"],
                speedMult: 0.75, // 25% Faster
                qualityLuck: 0.15
            },
            "CARPENTRY_MILL": {
                categories: ["EQUIPMENT", "MATERIAL"],
                speedMult: 0.85,
                qualityLuck: 0.05
            }
        };
    }

    /**
     * Resolves buffs based on regional specialization.
     */
    resolveStationBuffs(specialization, itemCategory) {
        const defaultBuffs = { speedMult: 1.0, qualityLuck: 0.0 };
        
        if (!specialization || !this.BUFFS[specialization]) {
            return defaultBuffs;
        }

        const spec = this.BUFFS[specialization];
        
        if (spec.categories.includes(itemCategory)) {
            return {
                speedMult: spec.speedMult,
                qualityLuck: spec.qualityLuck
            };
        }

        return defaultBuffs;
    }

    /**
     * Legacy/Placeholder: Resolves speed multiplier based on regional resource abundance.
     */
    resolveResourceBuff(volume24h = 0) {
        if (volume24h >= 500) return 0.7; // 30% Boost for huge surplus
        if (volume24h >= 100) return 0.9; // 10% Boost for abundance
        return 1.0;
    }
}

module.exports = new StationBuffResolver();
