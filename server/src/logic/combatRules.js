const traitService = require('../services/traitService');

/**
 * AAA Combat Rules (v3.0 - Professional Standard)
 * Updated v3.1: DARK Element System
 * 
 * Element System:
 * - NEUTRAL: No elemental bonuses
 * - FIRE: Strong vs NATURE, Weak vs WATER
 * - WATER: Strong vs FIRE, Weak vs EARTH
 * - NATURE: Strong vs EARTH, Weak vs FIRE
 * - EARTH: Strong vs LIGHTNING, Weak vs WIND
 * - LIGHTNING: Strong vs WATER, Weak vs EARTH
 * - LIGHT: Strategic element - excels at healing/purification, neutral vs DARK
 * - DARK: Strong vs LIGHT (1.5x), excels at DoT and debuffs
 */
class CombatRules {
    static ELEMENTS = { NEUTRAL: 0, FIRE: 1, WATER: 2, NATURE: 3, EARTH: 4, LIGHTNING: 5, LIGHT: 6, DARK: 7 };

    static ELEMENTAL_EFFECTIVENESS = {
        // NEUTRAL: No bonuses or penalties against any element
        [this.ELEMENTS.NEUTRAL]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, 
            [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        // FIRE: Strong vs NATURE (1.5x), Weak vs WATER (0.5x)
        [this.ELEMENTS.FIRE]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 0.5, [this.ELEMENTS.WATER]: 0.5, 
            [this.ELEMENTS.NATURE]: 1.5, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        // WATER: Strong vs FIRE (1.5x), Weak vs EARTH (0.5x)
        [this.ELEMENTS.WATER]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.5, [this.ELEMENTS.WATER]: 0.5, 
            [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 0.5, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        // NATURE: Strong vs EARTH (1.5x), Weak vs FIRE (0.5x)
        [this.ELEMENTS.NATURE]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 0.5, [this.ELEMENTS.WATER]: 1.0, 
            [this.ELEMENTS.NATURE]: 0.5, [this.ELEMENTS.EARTH]: 1.5, [this.ELEMENTS.LIGHTNING]: 1.0, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        // EARTH: Strong vs LIGHTNING (1.5x), Weak vs WIND (none, default 1.0)
        [this.ELEMENTS.EARTH]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, 
            [this.ELEMENTS.NATURE]: 0.5, [this.ELEMENTS.EARTH]: 0.5, [this.ELEMENTS.LIGHTNING]: 1.5, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        // LIGHTNING: Strong vs WATER (1.5x), Weak vs EARTH (0.5x)
        [this.ELEMENTS.LIGHTNING]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.5, 
            [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 0.5, [this.ELEMENTS.LIGHTNING]: 0.5, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0 
        },
        // LIGHT: Strategic element - neutral vs DARK, but excels at purification
        // Note: LIGHT gets bonus vs UNDEAD/DEMON types regardless of element
        [this.ELEMENTS.LIGHT]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, 
            [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, 
            [this.ELEMENTS.LIGHT]: 1.0, [this.ELEMENTS.DARK]: 1.0  // Neutral - LIGHT wins through utility
        },
        // DARK: Strong vs LIGHT (1.5x), excels at DoT and debuffs
        [this.ELEMENTS.DARK]: { 
            [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, 
            [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, 
            [this.ELEMENTS.LIGHT]: 1.5, [this.ELEMENTS.DARK]: 1.0  // Strong advantage vs LIGHT
        }
    };

    /**
     * Environmental modifiers (Day/Night cycle)
     */
    static ENVIRONMENTAL_MODIFIERS = {
        DAY: { LIGHT: 1.25, DARK: 0.75 },   // LIGHT stronger during day
        NIGHT: { LIGHT: 0.75, DARK: 1.25 },  // DARK stronger during night
        DUSK: { LIGHT: 0.9, DARK: 1.1 },     // Slight DARK bonus at dusk
        DAWN: { LIGHT: 1.1, DARK: 0.9 }      // Slight LIGHT bonus at dawn
    };

    /**
     * Bonus vs Undead/Demon types (for LIGHT element)
     */
    static TYPE_BONUSES = {
        LIGHT: { UNDEAD: 1.5, DEMON: 1.5 },  // LIGHT purifies undead and demons
        DARK: { UNDEAD: 1.0, DEMON: 1.0 }    // DARK has no special type bonus
    };

    static calculateDamage(attacker, defender, dmgMult = 1.0, element = 0, sim = null) {
        // Debug logging
        const debugInfo = {
            attacker: {
                name: attacker.data.name,
                stats: {
                    attack: attacker.getStat("attack_damage"),
                    accuracy: attacker.getStat("accuracy"),
                    critChance: attacker.getStat("crit_chance"),
                    critDamage: attacker.getStat("crit_damage"),
                    armorPen: attacker.getStat("armor_penetration")
                }
            },
            defender: {
                name: defender.data.name,
                stats: {
                    defense: defender.getStat("defense"),
                    dodge: defender.getStat("dodge_rate"),
                    blockChance: defender.getStat("block_chance"),
                    blockPower: defender.getStat("block_power")
                }
            },
            params: {
                dmgMult,
                element
            },
            calculations: []
        };

        // 1. Elemental Effectiveness
        let elementalMult = 1.0;
        if (element !== this.ELEMENTS.NEUTRAL) {
            const defenderElement = defender.getStat("elemental_type") || this.ELEMENTS.NEUTRAL;
            elementalMult = this.ELEMENTAL_EFFECTIVENESS[element][defenderElement];
            debugInfo.calculations.push(`Elemental effectiveness: ${element} vs ${defenderElement} = ${elementalMult}x`);
        }

        // 2. Accuracy Check (DEX based)
        const acc = attacker.getStat("accuracy");
        const dodge = defender.getStat("dodge_rate");
        const hitChance = Math.min(100, Math.max(5, acc - dodge));
        
        debugInfo.calculations.push(`Hit chance: ${acc} - ${dodge} = ${hitChance}%`);
        
        if (Math.random() * 100 > hitChance) {
            debugInfo.result = "MISS";
            if (sim) {
                sim.logger.addEvent("DEBUG", `Damage Calculation: MISS`, { debug: debugInfo }, true);
            }
            return { damage: 0, isMiss: true, isCrit: false, isBlocked: false, debug: debugInfo };
        }

        // 3. Armor Penetration Logic
        const rawDef = defender.getStat("defense");
        const arPen = attacker.getStat("armor_penetration");
        const effectiveDef = Math.max(0, rawDef - arPen);
        debugInfo.calculations.push(`Defense: ${rawDef} - ${arPen} = ${effectiveDef}`);

        // 4. Base Damage & Multipliers
        const baseAtk = attacker.getStat("attack_damage");
        let damage = Math.floor(Math.max(1, (baseAtk * dmgMult * elementalMult) - effectiveDef));
        debugInfo.calculations.push(`Base damage: ${baseAtk} * ${dmgMult} * ${elementalMult} = ${baseAtk * dmgMult * elementalMult}`);
        debugInfo.calculations.push(`After defense: ${damage}`);

        // 5. Critical Hit
        const isCrit = Math.random() < attacker.getStat("crit_chance");
        if (isCrit) {
            const critMult = attacker.getStat("crit_damage");
            damage = Math.floor(damage * critMult);
            debugInfo.calculations.push(`Critical hit: ${damage} * ${critMult} = ${damage}`);
        }

        // 6. Block Logic (STR based Block Power)
        const isBlocked = Math.random() < defender.getStat("block_chance");
        if (isBlocked) {
            const blockMitigation = defender.getStat("block_power") || 0.5;
            damage = Math.floor(damage * (1 - blockMitigation));
            debugInfo.calculations.push(`Blocked: ${damage} * ${(1 - blockMitigation)} = ${damage}`);
        }

        debugInfo.calculations.push(`Final damage: ${damage}`);
        debugInfo.result = "HIT";

        if (sim) {
            sim.logger.addEvent("DEBUG", `Damage Calculation: ${damage}`, { debug: debugInfo }, true);
        }

        return {
            damage,
            isCrit,
            isMiss: false,
            isBlocked,
            debug: debugInfo
        };
    }
}

module.exports = CombatRules;
