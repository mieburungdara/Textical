const CombatFormulaResolver = require('./rules/CombatFormulaResolver');
const ElementalEffectivenessResolver = require('./rules/ElementalEffectivenessResolver');

/**
 * AAA Combat Rules (v3.2 - SRP Refactored)
 * Orchestrates high-level combat flow and damage calculation.
 */
class CombatRules {
    static ELEMENTS = ElementalEffectivenessResolver.ELEMENTS;

    /**
     * Standard damage calculation flow:
     * 1. Resolve Elemental Effectiveness
     * 2. Perform Accuracy/Hit Check
     * 3. Apply Armor Penetration vs Defense
     * 4. Resolve Critical Hits
     * 5. Resolve Block/Parry Mitigation
     * 
     * @param {any} attacker - The unit attacking.
     * @param {any} defender - The unit defending.
     * @param {number} [dmgMult=1.0] - Skill damage multiplier.
     * @param {number} [element=0] - Elemental ID of the attack.
     * @param {any} [sim=null] - Global simulation context.
     * @returns {Object} Damage calculation result.
     */
    static calculateDamage(attacker, defender, dmgMult = 1.0, element = 0, sim = null) {
        // Initialize Debug Log
        const debugInfo = this._initializeDebug(attacker, defender, dmgMult, element);

        // 1. Resolve Elemental effectiveness using specialized resolver
        const defenderElement = defender.getStat("elemental_type") || this.ELEMENTS.NEUTRAL;
        const defenderType = defender.data.type || null; // e.g. UNDEAD
        const environment = sim ? sim.getEnvironment() : null; // DAY/NIGHT
        
        const elementalMult = ElementalEffectivenessResolver.getEffectiveness(
            element, 
            defenderElement, 
            defenderType, 
            environment
        );
        debugInfo.calculations.push(`Elemental effectiveness: ${element} vs ${defenderElement} = ${elementalMult}x`);

        // 2. Perform Hit Check using CombatFormulaResolver
        const hitChance = CombatFormulaResolver.calculateHitChance(attacker, defender);
        debugInfo.calculations.push(`Hit chance: ${hitChance}%`);

        if (Math.random() * 100 > hitChance) {
            return this._finalizeMiss(debugInfo, sim);
        }

        // 3. Resolve Effective Defense (Armor Pen)
        const effectiveDef = Math.max(0, defender.getStat("defense") - attacker.getStat("armor_penetration"));
        debugInfo.calculations.push(`Effective Defense: ${effectiveDef}`);

        // 4. Base Damage Calculation
        let damage = Math.floor(Math.max(1, (attacker.getStat("attack_damage") * dmgMult * elementalMult) - effectiveDef));
        debugInfo.calculations.push(`Base damage after defense: ${damage}`);

        // 5. Critical Hit Resolving
        const critResult = CombatFormulaResolver.calculateCriticalHit(attacker, defender);
        if (critResult.isCritical) {
            damage = Math.floor(damage * critResult.damageMult);
            debugInfo.calculations.push(`Critical hit: ${damage} (mult: ${critResult.damageMult})`);
        }

        // 6. Block/Parry Resolving
        const blockResult = CombatFormulaResolver.calculateBlockParry(defender, attacker, false, sim);
        if (blockResult.parried || blockResult.blocked) {
            damage = Math.floor(damage * blockResult.damageMult);
            debugInfo.calculations.push(`Mitigated (${blockResult.parried ? 'PARRY' : 'BLOCK'}): ${damage}`);
        }

        debugInfo.calculations.push(`Final damage: ${damage}`);
        debugInfo.result = "HIT";

        if (sim) {
            sim.logger.addEvent("DEBUG", `Damage Calculation: ${damage}`, { debug: debugInfo }, true);
        }

        return {
            damage,
            isCrit: critResult.isCritical,
            isMiss: false,
            isBlocked: blockResult.blocked,
            isParried: blockResult.parried,
            debug: debugInfo
        };
    }

    /**
     * @private
     * @param {any} attacker - Unit attacking.
     * @param {any} defender - Unit defending.
     * @param {number} dmgMult - Damage multiplier.
     * @param {number} element - Element ID.
     * @returns {Object} Initial debug object.
     */
    static _initializeDebug(attacker, defender, dmgMult, element) {
        return {
            attacker: {
                name: attacker.data.name,
                stats: {
                    attack: attacker.getStat("attack_damage"),
                    accuracy: attacker.getStat("accuracy")
                }
            },
            defender: {
                name: defender.data.name,
                stats: {
                    defense: defender.getStat("defense"),
                    dodge: defender.getStat("dodge_rate")
                }
            },
            params: { dmgMult, element },
            calculations: []
        };
    }

    /**
     * @private
     * @param {any} debugInfo - Debug info object.
     * @param {any} sim - Simulation context.
     * @returns {Object} Miss result.
     */
    static _finalizeMiss(debugInfo, sim) {
        debugInfo.result = "MISS";
        if (sim) {
            sim.logger.addEvent("DEBUG", `Damage Calculation: MISS`, { debug: debugInfo }, true);
        }
        return { damage: 0, isMiss: true, isCrit: false, isBlocked: false, debug: debugInfo };
    }
}

module.exports = CombatRules;
