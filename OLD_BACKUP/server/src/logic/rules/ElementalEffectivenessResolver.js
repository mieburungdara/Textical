/**
 * ElementalEffectivenessResolver
 * Manages elemental relationships, environmental modifiers, and type-based bonuses.
 */
class ElementalEffectivenessResolver {
    static ELEMENTS = { NEUTRAL: 0, FIRE: 1, WATER: 2, NATURE: 3, EARTH: 4, LIGHTNING: 5, LIGHT: 6, DARK: 7 };

    static ELEMENTAL_EFFECTIVENESS = {
        [this.ELEMENTS.NEUTRAL]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, 
            [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        [this.ELEMENTS.FIRE]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 0.5, [this.ELEMENTS.WATER]: 0.5, 
            [this.ELEMENTS.NATURE]: 1.5, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        [this.ELEMENTS.WATER]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.5, [this.ELEMENTS.WATER]: 0.5, 
            [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 0.5, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        [this.ELEMENTS.NATURE]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 0.5, [this.ELEMENTS.WATER]: 1.0, 
            [this.ELEMENTS.NATURE]: 0.5, [this.ELEMENTS.EARTH]: 1.5, [this.ELEMENTS.LIGHTNING]: 1.0, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        [this.ELEMENTS.EARTH]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, 
            [this.ELEMENTS.NATURE]: 0.5, [this.ELEMENTS.EARTH]: 0.5, [this.ELEMENTS.LIGHTNING]: 1.5, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        [this.ELEMENTS.LIGHTNING]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.5, 
            [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 0.5, [this.ELEMENTS.LIGHTNING]: 0.5, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        [this.ELEMENTS.LIGHT]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, 
            [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        [this.ELEMENTS.DARK]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, 
            [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, 
            [this.ELEMENTS.LIGHT]: 1.5, [this.ELEMENTS.DARK]: 1.0 
        }
    };

    static ENVIRONMENTAL_MODIFIERS = {
        DAY: { LIGHT: 1.25, DARK: 0.75 },
        NIGHT: { LIGHT: 0.75, DARK: 1.25 },
        DUSK: { LIGHT: 0.9, DARK: 1.1 },
        DAWN: { LIGHT: 1.1, DARK: 0.9 }
    };

    static TYPE_BONUSES = {
        LIGHT: { UNDEAD: 1.5, DEMON: 1.5 },
        DARK: { UNDEAD: 1.0, DEMON: 1.0 }
    };

    /**
     * Resolve final elemental multiplier
     * @param {number} attackerElement - Element ID of the skill/attack
     * @param {number} defenderElement - Element ID of the defender unit
     * @param {string|null} [defenderType] - Type of the defender unit (e.g., UNDEAD)
     * @param {string|null} [environment] - Global state (DAY, NIGHT, etc.)
     * @returns {number} Final multiplier
     */
    static getEffectiveness(attackerElement, defenderElement, defenderType = null, environment = null) {
        let mult = 1.0;

        // 1. Core Elemental Chart
        const chart = /** @type {Object.<number, Object.<number, number>>} */ (this.ELEMENTAL_EFFECTIVENESS);
        if (chart[attackerElement] && chart[attackerElement][defenderElement]) {
            mult *= chart[attackerElement][defenderElement];
        }

        // 2. Type Bonuses (Special for LIGHT vs UNDEAD/DEMON)
        const typeBonuses = /** @type {Object.<string, Object.<string, number>>} */ (this.TYPE_BONUSES);
        if (attackerElement === this.ELEMENTS.LIGHT && defenderType && typeBonuses.LIGHT) {
            const typeValue = typeBonuses.LIGHT[defenderType];
            if (typeValue) mult *= typeValue;
        }

        // 3. Environmental Modifiers
        const envMods = /** @type {Object.<string, Object.<string, number>>} */ (this.ENVIRONMENTAL_MODIFIERS);
        if (environment && envMods[environment]) {
            const envData = envMods[environment];
            if (attackerElement === this.ELEMENTS.LIGHT && envData.LIGHT) mult *= envData.LIGHT;
            if (attackerElement === this.ELEMENTS.DARK && envData.DARK) mult *= envData.DARK;
        }

        return mult;
    }
}

module.exports = ElementalEffectivenessResolver;
