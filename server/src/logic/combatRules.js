const traitService = require('../services/traitService');

/**
 * AAA Combat Rules (v3.0 - Professional Standard)
 */
class CombatRules {
    static ELEMENTS = { NEUTRAL: 0, FIRE: 1, WATER: 2, NATURE: 3, EARTH: 4, LIGHTNING: 5, HOLY: 6, VOID: 7 };

    static ELEMENTAL_EFFECTIVENESS = {
        [this.ELEMENTS.NEUTRAL]: { [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, [this.ELEMENTS.HOLY]: 1.0, [this.ELEMENTS.VOID]: 1.0 },
        [this.ELEMENTS.FIRE]: { [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 0.5, [this.ELEMENTS.WATER]: 0.5, [this.ELEMENTS.NATURE]: 1.5, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, [this.ELEMENTS.HOLY]: 1.0, [this.ELEMENTS.VOID]: 1.0 },
        [this.ELEMENTS.WATER]: { [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.5, [this.ELEMENTS.WATER]: 0.5, [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 0.5, [this.ELEMENTS.HOLY]: 1.0, [this.ELEMENTS.VOID]: 1.0 },
        [this.ELEMENTS.NATURE]: { [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 0.5, [this.ELEMENTS.WATER]: 1.0, [this.ELEMENTS.NATURE]: 0.5, [this.ELEMENTS.EARTH]: 1.5, [this.ELEMENTS.LIGHTNING]: 1.0, [this.ELEMENTS.HOLY]: 1.0, [this.ELEMENTS.VOID]: 1.0 },
        [this.ELEMENTS.EARTH]: { [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, [this.ELEMENTS.NATURE]: 0.5, [this.ELEMENTS.EARTH]: 0.5, [this.ELEMENTS.LIGHTNING]: 1.5, [this.ELEMENTS.HOLY]: 1.0, [this.ELEMENTS.VOID]: 1.0 },
        [this.ELEMENTS.LIGHTNING]: { [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.5, [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 0.5, [this.ELEMENTS.LIGHTNING]: 0.5, [this.ELEMENTS.HOLY]: 1.0, [this.ELEMENTS.VOID]: 1.0 },
        [this.ELEMENTS.HOLY]: { [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, [this.ELEMENTS.HOLY]: 0.5, [this.ELEMENTS.VOID]: 1.5 },
        [this.ELEMENTS.VOID]: { [this.ELEMENTS.NEUTRAL]: 1.0, [this.ELEMENTS.FIRE]: 1.0, [this.ELEMENTS.WATER]: 1.0, [this.ELEMENTS.NATURE]: 1.0, [this.ELEMENTS.EARTH]: 1.0, [this.ELEMENTS.LIGHTNING]: 1.0, [this.ELEMENTS.HOLY]: 0.5, [this.ELEMENTS.VOID]: 0.5 }
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
