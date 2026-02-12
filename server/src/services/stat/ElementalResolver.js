/**
 * ElementalResolver (v2.0 - Enhanced DARK Element System)
 * Handles elemental damage calculations, resistances, and weakness interactions.
 * Supports the 7 elements: Fire, Water, Earth, Wind, Lightning, Light, Dark + NEUTRAL
 * 
 * Element Relationships:
 * - FIRE > NATURE (1.5x), FIRE < WATER (0.5x)
 * - WATER > FIRE (1.5x), WATER < EARTH (0.5x)
 * - NATURE > EARTH (1.5x), NATURE < FIRE (0.5x)
 * - EARTH > LIGHTNING (1.5x), EARTH < WIND (none, 1.0x)
 * - LIGHTNING > WATER (1.5x), LIGHTNING < EARTH (0.5x)
 * - LIGHT: Strategic element - neutral vs DARK, excels at purification
 * - DARK: Strong vs LIGHT (1.5x), excels at DoT and debuffs
 */
class ElementalResolver {
    /**
     * Element types enumeration (aligned with combatRules.js)
     * @enum {string}
     */
    static Element = {
        NEUTRAL: 'neutral',
        FIRE: 'fire',
        WATER: 'water',
        EARTH: 'earth',
        WIND: 'wind',
        LIGHTNING: 'lightning',
        LIGHT: 'light',
        DARK: 'dark'
    };

    /**
     * Element ID mapping (for database storage, aligned with combatRules.ELEMENTS)
     */
    static ElementId = {
        neutral: 0,
        fire: 1,
        water: 2,
        nature: 3,
        earth: 4,
        lightning: 5,
        light: 6,
        dark: 7
    };

    /**
     * Element display names for UI
     */
    static ElementDisplay = {
        neutral: 'Neutral',
        fire: 'Fire',
        water: 'Water',
        earth: 'Earth',
        wind: 'Wind',
        lightning: 'Lightning',
        light: 'Light',
        dark: 'Dark'
    };

    /**
     * Element colors for UI/Visual feedback
     */
    static ElementColor = {
        neutral: '#808080',
        fire: '#ff4444',
        water: '#4444ff',
        earth: '#8B4513',
        wind: '#90EE90',
        lightning: '#FFFF00',
        light: '#FFD700',
        dark: '#4a154b'
    };

    /**
     * Elemental interaction relationships (attacker -> target)
     * Each element has advantage/disadvantage against others
     * Updated to align with combatRules.js ELEMENTAL_EFFECTIVENESS
     */
    static INTERACTIONS = {
        fire: {
            weakAgainst: 'water',
            strongAgainst: 'nature',
            neutral: ['earth', 'lightning', 'light', 'dark', 'neutral']
        },
        water: {
            weakAgainst: 'earth',
            strongAgainst: 'fire',
            neutral: ['wind', 'lightning', 'light', 'dark', 'neutral']
        },
        earth: {
            weakAgainst: 'wind',
            strongAgainst: 'lightning',
            neutral: ['fire', 'water', 'nature', 'light', 'dark', 'neutral']
        },
        wind: {
            weakAgainst: 'earth',
            strongAgainst: 'fire',
            neutral: ['water', 'nature', 'lightning', 'light', 'dark', 'neutral']
        },
        lightning: {
            weakAgainst: 'earth',
            strongAgainst: 'water',
            neutral: ['fire', 'wind', 'nature', 'light', 'dark', 'neutral']
        },
        nature: {
            weakAgainst: 'fire',
            strongAgainst: 'earth',
            neutral: ['water', 'wind', 'lightning', 'light', 'dark', 'neutral']
        },
        light: {
            weakAgainst: 'dark',  // Light is weak against dark attacks
            strongAgainst: [],     // Light wins through utility, not raw damage
            neutral: ['fire', 'water', 'earth', 'wind', 'lightning', 'nature', 'neutral'],
            // Light gets bonus vs Undead and Demon types
            typeBonus: { undead: 1.5, demon: 1.5 }
        },
        dark: {
            weakAgainst: 'light',
            strongAgainst: 'light',  // Dark has advantage vs light
            neutral: ['fire', 'water', 'earth', 'wind', 'lightning', 'nature', 'neutral'],
            // Dark excels at DoT and debuffs
            isDoTElement: true,
            debuffBonus: 0.25
        }
    };

    /**
     * Base multipliers for elemental interactions
     */
    static MULTIPLIERS = {
        STRONG: 1.5,      // Advantage
        WEAK: 0.5,        // Disadvantage
        NEUTRAL: 1.0,     // No bonus/penalty
        IMMUNE: 0.0,     // Complete resistance
        TYPE_BONUS: 1.5,  // Bonus vs specific monster types (e.g., Light vs Undead)
        NIGHT_BONUS: 1.25, // Environmental bonus at night
        DAY_BONUS: 1.25    // Environmental bonus during day
    };

    /**
     * Calculate elemental damage multiplier
     * @param {string} attackElement - The attacking element type
     * @param {string} targetElement - The target's element type (for resistance)
     * @param {Object} heroAffinity - Hero's elemental affinity data
     * @param {Object} targetAffinity - Target's elemental affinity data
     * @returns {number} Final damage multiplier
     */
    static calculateDamageMultiplier(attackElement, targetElement, heroAffinity = {}, targetAffinity = {}) {
        let multiplier = 1.0;

        // Apply elemental interaction (advantage/disadvantage)
        const interaction = ElementalResolver.INTERACTIONS[attackElement];
        if (interaction) {
            if (interaction.strongAgainst.includes(targetElement)) {
                multiplier *= ElementalResolver.MULTIPLIERS.STRONG;
            } else if (interaction.weakAgainst === targetElement) {
                multiplier *= ElementalResolver.MULTIPLIERS.WEAK;
            }
        }

        // Apply hero's elemental bonus damage
        if (heroAffinity && heroAffinity[attackElement]?.bonusDamage) {
            multiplier *= (1 + heroAffinity[attackElement].bonusDamage);
        }

        // Apply target's elemental resistance
        const targetResistance = (targetAffinity && targetAffinity[targetElement]?.resistance) || 0;
        if (targetResistance > 0) {
            // Resistance reduces damage
            multiplier *= Math.max(0, 1 - targetResistance);
        } else if (targetResistance < 0) {
            // Negative resistance (weakness) increases damage
            multiplier *= (1 + Math.abs(targetResistance));
        }

        return multiplier;
    }

    /**
     * Apply elemental modifiers to stats
     * @param {Object} stats - Stats object to modify
     * @param {Object} heroData - Hero data with elemental affinities
     * @param {boolean} applyMod - Function to apply modifiers
     */
    static applyElementalModifiers(stats, heroData, applyMod) {
        if (!heroData.elementalAffinities) return;

        // Apply base elemental damage bonuses from affinities
        heroData.elementalAffinities.forEach(affinity => {
            const element = (affinity.elementType || affinity.elementTypeId || '').toLowerCase();
            if (!element) return;

            const bonusDamage = affinity.bonusDamage || 0;
            
            if (bonusDamage > 0) {
                const statKey = `${element}_damage`;
                applyMod(statKey, bonusDamage, 0, `ElementalAffinity:${element}`);
            }

            // Apply resistance as defense modifier
            const resistance = affinity.resistance || 0;
            if (resistance > 0) {
                const resistKey = `${element}_resistance`;
                applyMod(resistKey, resistance, 1, `ElementalAffinity:${element}`);
            }
        });
    }

    /**
     * Get all elemental resistances for a hero
     * @param {Object} heroData - Hero data with elemental affinities
     * @returns {Object} Object with resistance values for each element
     */
    static getResistances(heroData) {
        const resistances = {};
        
        Object.values(ElementalResolver.Element).forEach(element => {
            resistances[element] = 0;
        });

        if (!heroData.elementalAffinities) return resistances;

        heroData.elementalAffinities.forEach(affinity => {
            const element = (affinity.elementType || affinity.elementTypeId || '').toLowerCase();
            if (element) {
                resistances[element] = affinity.resistance || 0;
            }
        });

        return resistances;
    }

    /**
     * Get all elemental bonus damage values for a hero
     * @param {Object} heroData - Hero data with elemental affinities
     * @returns {Object} Object with bonus damage values for each element
     */
    static getBonusDamage(heroData) {
        const bonusDamage = {};
        
        Object.values(ElementalResolver.Element).forEach(element => {
            bonusDamage[element] = 0;
        });

        if (!heroData.elementalAffinities) return bonusDamage;

        heroData.elementalAffinities.forEach(affinity => {
            const element = (affinity.elementType || affinity.elementTypeId || '').toLowerCase();
            if (element) {
                bonusDamage[element] = affinity.bonusDamage || 0;
            }
        });

        return bonusDamage;
    }

    /**
     * Check if hero has a specific elemental affinity
     * @param {Object} heroData - Hero data
     * @param {string} element - Element type to check
     * @returns {boolean} True if hero has the affinity
     */
    static hasAffinity(heroData, element) {
        if (!heroData.elementalAffinities) return false;
        return heroData.elementalAffinities.some(a => 
            (a.elementType || a.elementTypeId || '').toLowerCase() === element.toLowerCase()
        );
    }

    // === Instance Methods for compatibility with statService ===

    getAffinityBonus(element, level) {
        // Fallback for affinity system if level-based
        return level * 0.05; 
    }

    getResistanceBonus(element, level) {
        return level * 0.02;
    }

    getEquipmentElementalBonuses(equipment) {
        const bonuses = {};
        equipment.forEach(eq => {
            const traits = eq.itemInstance?.template?.traits || [];
            traits.forEach(t => {
                t.trait.stats?.forEach(s => {
                    if (s.statKey.includes('_damage') || s.statKey.includes('_resistance')) {
                        bonuses[s.statKey] = (bonuses[s.statKey] || 0) + s.statValue;
                    }
                });
            });
        });
        return bonuses;
    }

    getSetElementalBonuses(equipment) {
        // Set bonuses are handled by SetBonusResolver generally,
        // but this provides a summary for getElementalStats
        return {};
    }
}

module.exports = ElementalResolver;