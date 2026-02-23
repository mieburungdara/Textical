const traitService = require('../../services/traitService');

/**
 * CombatFormulaResolver
 * Isolated class for calculating hit chances, critical hits, and block/parry probabilities.
 */
class CombatFormulaResolver {
    /**
     * Calculate hit chance considering accuracy vs dodge
     * @param {Object} attacker - The unit attacking
     * @param {Object} defender - The unit defending
     * @param {number} directionalBonus - Bonus based on positioning
     * @returns {number} Final hit chance (5-100)
     */
    static calculateHitChance(attacker, defender, directionalBonus = 0, sim = null) {
        const accuracy = attacker.getStat("accuracy") || 100;
        const dodgeChance = defender.getStat("dodge_rate") || 0;
        
        // Stealth penalty - if defender is stealthed, attacker has reduced hit chance
        let stealthPenalty = 0;
        if (defender.isStealthed) {
            const stealthLevel = defender.getStat("stealth_level") || 50;
            stealthPenalty = Math.min(30, stealthLevel / 2);
        }
        
        // Calculate final hit chance
        const baseHitChance = accuracy - dodgeChance + directionalBonus - stealthPenalty;
        
        // Apply trait hooks
        const atkMods = traitService.executeHook("onCalculateHitChance", attacker, sim, defender) || {};
        const defMods = traitService.executeHook("onCalculateDodgeChance", defender, sim, attacker) || {};
        
        const finalHitChance = (baseHitChance + (atkMods.hitChanceMod || 0) - (defMods.dodgeChanceMod || 0));
        
        return Math.max(5, Math.min(100, finalHitChance));
    }

    /**
     * Calculate critical hit chance and damage
     * @param {Object} attacker - The unit attacking
     * @param {Object} defender - The unit defending
     * @param {number} directionalBonus - Bonus based on positioning
     * @returns {Object} Result containing chance, damageMult, and isCritical boolean
     */
    static calculateCriticalHit(attacker, defender, directionalBonus = 0, sim = null) {
        const critChance = attacker.getStat("crit_chance") || 0.05;
        const critDamage = attacker.getStat("crit_damage") || 1.5;
        
        // Directional crit bonus
        const critChanceBonus = directionalBonus > 0 ? (directionalBonus / 400) : 0; // Back attack gives crit bonus
        
        // Apply trait hooks
        const mod = traitService.executeHook("onCalculateCrit", attacker, sim, defender) || {};
        
        const finalCritChance = Math.min(1.0, critChance + critChanceBonus + (mod.critChanceMod || 0));
        const finalCritDamage = critDamage + (mod.critDamageMod || 0);
        
        return {
            chance: finalCritChance,
            damageMult: finalCritDamage,
            isCritical: Math.random() < finalCritChance
        };
    }

    /**
     * Calculate block/parry result
     * @param {Object} defender - The unit defending
     * @param {Object} attacker - The unit attacking
     * @param {boolean} bypassBlock - Whether to ignore blocking mechanics
     * @param {Object} sim - Simulation context (for hooks)
     * @returns {Object} Result containing blocked, parried, and damageMult
     */
    static calculateBlockParry(defender, attacker, bypassBlock = false, sim = null) {
        if (bypassBlock) {
            return { blocked: false, parried: false, damageMult: 1.0 };
        }
        
        const blockChance = defender.getStat("block_chance") || 0;
        const parryChance = defender.getStat("parry_chance") || 0;
        const blockPower = defender.getStat("block_power") || 0.5;
        
        // Apply trait hooks
        const mod = traitService.executeHook("onCalculateBlock", defender, sim, attacker) || {};
        
        const finalBlockChance = Math.min(0.75, blockChance + (mod.blockChanceMod || 0));
        const finalParryChance = Math.min(0.50, parryChance + (mod.parryChanceMod || 0));
        
        const rolled = Math.random();
        let result = { blocked: false, parried: false, damageMult: 1.0 };
        
        // Priority: Parry > Block
        if (rolled < finalParryChance) {
            result.parried = true;
            result.damageMult = 0.25; // Parry reduces damage significantly
            if (sim) traitService.executeHook("onParry", defender, sim, attacker);
        } else if (rolled < finalBlockChance + finalParryChance) {
            result.blocked = true;
            result.damageMult = 1.0 - (blockPower + (mod.blockPowerMod || 0));
            if (sim) traitService.executeHook("onBlock", defender, sim, attacker);
        }
        
        return result;
    }
}

module.exports = CombatFormulaResolver;
