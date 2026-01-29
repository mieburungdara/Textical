const traitService = require('../services/traitService');

/**
 * AAA Combat Rules (v3.0 - Professional Standard)
 */
class CombatRules {
    static ELEMENTS = { NEUTRAL: 0, FIRE: 1, WATER: 2, NATURE: 3, EARTH: 4, LIGHTNING: 5, HOLY: 6, VOID: 7 };

    static calculateDamage(attacker, defender, dmgMult = 1.0, element = 0) {
        // 1. Accuracy Check (DEX based)
        const acc = attacker.getStat("accuracy");
        const dodge = defender.getStat("dodge_rate");
        const hitChance = Math.min(100, Math.max(5, acc - dodge));
        
        if (Math.random() * 100 > hitChance) {
            return { damage: 0, isMiss: true, isCrit: false };
        }

        // 2. Armor Penetration Logic
        const rawDef = defender.getStat("defense");
        const arPen = attacker.getStat("armor_penetration");
        const effectiveDef = Math.max(0, rawDef - arPen);

        // 3. Base Damage & Multipliers
        const baseAtk = attacker.getStat("attack_damage");
        let damage = Math.max(1, (baseAtk * dmgMult) - effectiveDef);

        // 4. Critical Hit
        const isCrit = Math.random() < attacker.getStat("crit_chance");
        if (isCrit) {
            damage = Math.floor(damage * attacker.getStat("crit_damage"));
        }

        // 5. Block Logic (STR based Block Power)
        const isBlocked = Math.random() < defender.getStat("block_chance");
        if (isBlocked) {
            const blockMitigation = defender.getStat("block_power") || 0.5;
            damage = Math.floor(damage * (1 - blockMitigation));
        }

        return {
            damage,
            isCrit,
            isMiss: false,
            isBlocked
        };
    }
}

module.exports = CombatRules;
