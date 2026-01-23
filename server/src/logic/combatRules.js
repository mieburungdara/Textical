const math = require('mathjs');

class CombatRules {
    /**
     * Professional Grade Damage Calculator.
     * Uses mathjs for floating point safety and consistent results.
     */
    static calculateDamage(attacker, defender, skillMult = 1.0, skillElement = 0, attackerTerrain = 0, defenderTerrain = 0) {
        const aTerr = attackerTerrain || 0;
        const dTerr = defenderTerrain || 0;

        // 1. Dodge Check
        let dodgeRate = defender.stats.dodge_rate || 0;
        if (dTerr === 5) dodgeRate += 20; // Forest
        
        if (math.random() < (dodgeRate / 100.0)) {
            return { damage: 0, isHit: false, isCrit: false, message: "MISS!" };
        }

        // 2. Base Damage Calculation
        let rawDamage = math.multiply(attacker.stats.attack_damage || 0, skillMult);
        let mitigation = defender.stats.defense || 0;
        let damage = math.subtract(rawDamage, mitigation);
        
        // Terrain Bonus (Ruins = 8)
        if (aTerr === 8) damage = math.multiply(damage, 1.15);

        // 3. Critical Hit Check
        let isCrit = false;
        const critChance = attacker.stats.crit_chance || 0.05;
        if (math.random() < critChance) {
            isCrit = true;
            damage = math.multiply(damage, (attacker.stats.crit_damage || 1.5));
        }

        // 4. Elemental Mapping
        const elementToCheck = skillElement !== 0 ? skillElement : (attacker.data.element || 0);
        const resMap = { 1: "res_fire", 2: "res_water", 3: "res_wind", 4: "res_earth", 5: "res_lightning" };
        const resKey = resMap[elementToCheck];
        
        if (resKey) {
            const resMultiplier = defender.stats[resKey] || 1.0;
            damage = math.multiply(damage, resMultiplier);
        }

        // Water vs Fire Interaction
        if (elementToCheck === 1 && dTerr === 4) damage = math.multiply(damage, 0.7);

        // 5. Final Floor and Safety
        damage = math.floor(math.max(1, damage));
        
        return { 
            damage: damage, 
            isHit: true, 
            isCrit: isCrit, 
            message: isCrit ? "CRITICAL!" : "HIT" 
        };
    }
}

module.exports = CombatRules;
