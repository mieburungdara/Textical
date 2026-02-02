/**
 * AAA EnvironmentalResolver
 * Pure component for resolving gameplay modifiers based on Time and Weather.
 */
class EnvironmentalResolver {
    /**
     * Resolves comprehensive modifiers for a given world state.
     * @param {number} hour - 0-23
     * @param {string} weather - CLEAR, RAIN, STORM, HEATWAVE
     * @returns {Object} { combat, gathering, travel }
     */
    resolveModifiers(hour, weather) {
        const mods = {
            combat: { atkMult: 1.0, defMult: 1.0, fireMult: 1.0, waterMult: 1.0 },
            gathering: { yieldMult: 1.0, speedMult: 1.0, fishingYieldMult: 1.0 },
            travel: { speedMult: 1.0 }
        };

        const isNight = hour < 6 || hour >= 20;

        // 1. Time-Based Modifiers
        if (isNight) {
            mods.combat.atkMult = 1.1; // Night boost for monsters/stealth
            mods.gathering.speedMult = 0.8; // Slower gathering in dark
        }

        // 2. Weather-Based Modifiers
        switch (weather) {
            case "RAIN":
                mods.combat.fireMult = 0.8;
                mods.combat.waterMult = 1.2;
                mods.gathering.fishingYieldMult = 1.5;
                break;
            case "STORM":
                mods.combat.atkMult *= 0.9; // Lower accuracy/visibility
                mods.combat.fireMult = 0.5;
                mods.combat.waterMult = 1.5;
                mods.travel.speedMult = 0.7; // Harder to travel
                break;
            case "HEATWAVE":
                mods.combat.fireMult = 1.3;
                mods.combat.waterMult = 0.7;
                mods.gathering.speedMult *= 0.7; // Stamina drain
                break;
        }

        return mods;
    }
}

module.exports = new EnvironmentalResolver();
