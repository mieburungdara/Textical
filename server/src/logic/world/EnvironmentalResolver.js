/**
 * AAA EnvironmentalResolver
 * Pure component for resolving gameplay modifiers based on Time and Weather.
 * Enhanced with stat system integration.
 */
class EnvironmentalResolver {
    /**
     * Resolves comprehensive modifiers for a given world state.
     * @param {number} hour - 0-23
     * @param {string} weather - CLEAR, RAIN, STORM, HEATWAVE
     * @param {string} moonPhase - NEW, WAXING, FULL, WANING
     * @returns {Object} { combat, gathering, travel, statModifiers }
     */
    resolveModifiers(hour, weather, moonPhase = "NEW") {
        const mods = {
            combat: { atkMult: 1.0, defMult: 1.0, fireMult: 1.0, waterMult: 1.0 },
            gathering: { yieldMult: 1.0, speedMult: 1.0, fishingYieldMult: 1.0 },
            travel: { speedMult: 1.0 },
            statModifiers: []
        };

        const isNight = hour < 6 || hour >= 20;

        // 1. Time-Based Modifiers
        if (isNight) {
            mods.combat.atkMult = 1.1; // Night boost for monsters/stealth
            mods.gathering.speedMult = 0.8; // Slower gathering in dark
            
            // --- AAA Moon Phase Effects ---
            if (weather === "CLEAR" || weather === "HEATWAVE") {
                switch (moonPhase) {
                    case "FULL":
                        mods.combat.atkMult *= 1.15; // Extra power under full moon
                        mods.gathering.yieldMult *= 1.2; // Rare materials glow/abound
                        mods.statModifiers.push({
                            statKey: 'luck', value: 20, source: 'Full Moon', isPercent: false
                        });
                        break;
                    case "NEW":
                        mods.statModifiers.push({
                            statKey: 'stealth_level', value: 25, source: 'New Moon (Darkness)', isPercent: false
                        });
                        break;
                    case "WAXING":
                    case "WANING":
                        mods.statModifiers.push({
                            statKey: 'mana_regen', value: 5, source: 'Moonlight', isPercent: false
                        });
                        break;
                }
            }

            // Stat modifiers for night
            mods.statModifiers.push({
                statKey: 'stealth_level',
                value: 10,
                source: 'Environment:Night',
                isPercent: false
            });
        } else {
            // Daytime bonus to accuracy
            mods.statModifiers.push({
                statKey: 'accuracy',
                value: 5,
                source: 'Environment:Day',
                isPercent: false
            });
        }

        // 2. Weather-Based Modifiers
        switch (weather) {
            case "RAIN":
                mods.combat.fireMult = 0.8;
                mods.combat.waterMult = 1.2;
                mods.gathering.fishingYieldMult = 1.5;
                
                mods.statModifiers.push({
                    statKey: 'water_resistance',
                    value: 0.1,
                    source: 'Weather:Rain',
                    isPercent: true
                });
                break;
            case "STORM":
                mods.combat.atkMult *= 0.9; // Lower accuracy/visibility
                mods.combat.fireMult = 0.5;
                mods.combat.waterMult = 1.5;
                mods.travel.speedMult = 0.7; // Harder to travel
                
                mods.statModifiers.push({
                    statKey: 'accuracy',
                    value: -10,
                    source: 'Weather:Storm',
                    isPercent: false
                });
                break;
            case "HEATWAVE":
                mods.combat.fireMult = 1.3;
                mods.combat.waterMult = 0.7;
                mods.gathering.speedMult *= 0.7; // Stamina drain
                
                mods.statModifiers.push({
                    statKey: 'fire_damage',
                    value: 15,
                    source: 'Weather:Heatwave',
                    isPercent: false
                });
                break;
            case "CLEAR":
            default:
                break;
        }

        return mods;
    }

    /**
     * Get combat-specific environmental modifiers.
     */
    getCombatModifiers(hour, weather, moonPhase) {
        const mods = this.resolveModifiers(hour, weather, moonPhase);
        return mods.combat;
    }

    /**
     * Get stat modifiers for the current environment.
     */
    getStatModifiers(hour, weather, moonPhase) {
        const mods = this.resolveModifiers(hour, weather, moonPhase);
        return mods.statModifiers;
    }

    /**
     * Check if current environmental conditions favor stealth.
     */
    isStealthFavorable(hour, weather) {
        const isNight = hour < 6 || hour >= 20;
        const isStormy = weather === "STORM";
        const isRainy = weather === "RAIN";
        
        return isNight || isStormy || isRainy;
    }

    /**
     * Get elemental vulnerability based on weather.
     */
    getElementalVulnerability(weather, element) {
        const vulnerabilities = {
            "RAIN": { fire: 0.8, water: 1.2, earth: 0.9, wind: 1.1 },
            "STORM": { fire: 0.5, water: 1.5, earth: 1.0, wind: 1.3 },
            "HEATWAVE": { fire: 1.3, water: 0.7, earth: 1.2, wind: 0.8 },
            "CLEAR": { fire: 1.0, water: 1.0, earth: 1.0, wind: 1.0 }
        };
        
        const weatherMods = vulnerabilities[weather] || vulnerabilities["CLEAR"];
        return weatherMods[element.toLowerCase()] || 1.0;
    }
}

module.exports = new EnvironmentalResolver();
