/**
 * ElementalResolver
 * Handles elemental damage calculations, resistances, and weakness interactions.
 * Supports the 6 elements: Fire, Water, Earth, Wind, Light, Dark
 */
class ElementalResolver {
    /**
     * Element types enumeration
     * @enum {string}
     */
    static Element = {
        FIRE: 'fire',
        WATER: 'water',
        EARTH: 'earth',
        WIND: 'wind',
        LIGHT: 'light',
        DARK: 'dark'
    };

    /**
     * Elemental interaction relationships (attacker -> target)
     * Each element has advantage/disadvantage against others
     */
    static INTERACTIONS = {
        fire: {
            weakAgainst: 'water',
            strongAgainst: 'wind',
            neutral: ['earth', 'light', 'dark']
        },
        water: {
            weakAgainst: 'earth',
            strongAgainst: 'fire',
            neutral: ['wind', 'light', 'dark']
        },
        earth: {
            weakAgainst: 'wind',
            strongAgainst: 'water',
            neutral: ['fire', 'light', 'dark']
        },
        wind: {
            weakAgainst: 'fire',
            strongAgainst: 'earth',
            neutral: ['water', 'light', 'dark']
        },
        light: {
            weakAgainst: 'dark',
            strongAgainst: 'dark',
            neutral: ['fire', 'water', 'earth', 'wind']
        },
        dark: {
            weakAgainst: 'light',
            strongAgainst: 'light',
            neutral: ['fire', 'water', 'earth', 'wind']
        }
    };

    /**
     * Base multipliers for elemental interactions
     */
    static MULTIPLIERS = {
        STRONG: 1.5,      // Advantage
        WEAK: 0.5,        // Disadvantage
        NEUTRAL: 1.0,     // No bonus/penalty
        IMMUNE: 0.0       // Complete resistance
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
            const element = affinity.elementTypeId;
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
            resistances[affinity.elementTypeId] = affinity.resistance || 0;
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
            bonusDamage[affinity.elementTypeId] = affinity.bonusDamage || 0;
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
        return heroData.elementalAffinities.some(a => a.elementTypeId === element);
    }

    /**
     * Calculate total elemental damage for all elements
     * @param {Object} stats - Stats object with base damage
     * @param {Object} affinities - Elemental affinities
     * @returns {Object} Object with total damage per element
     */
    static calculateTotalElementalDamage(stats, affinities) {
        const baseDamage = stats.attack_damage || 0;
        const totalDamage = {};

        Object.values(ElementalResolver.Element).forEach(element => {
            const affinity = affinities?.find(a => a.elementTypeId === element);
            const bonusMultiplier = affinity?.bonusDamage || 0;
            const baseElemental = stats[`${element}_damage`] || 0;
            
            totalDamage[element] = (baseDamage + baseElemental) * (1 + bonusMultiplier);
        });

        return totalDamage;
    }

    /**
     * Get interaction description between two elements
     * @param {string} attackerElement - Attacking element
     * @param {string} defenderElement - Defending element
     * @returns {Object} Interaction result with multiplier and description
     */
    static getInteraction(attackerElement, defenderElement) {
        const interaction = ElementalResolver.INTERACTIONS[attackerElement];
        
        if (!interaction) {
            return { multiplier: 1.0, description: 'Unknown element' };
        }

        if (interaction.strongAgainst.includes(defenderElement)) {
            return { 
                multiplier: ElementalResolver.MULTIPLIERS.STRONG, 
                description: `Strong against ${defenderElement}` 
            };
        }
        
        if (interaction.weakAgainst === defenderElement) {
            return { 
                multiplier: ElementalResolver.MULTIPLIERS.WEAK, 
                description: `Weak against ${defenderElement}` 
            };
        }

        return { 
            multiplier: ElementalResolver.MULTIPLIERS.NEUTRAL, 
            description: 'Neutral interaction' 
        };
    }
}

module.exports = ElementalResolver;
