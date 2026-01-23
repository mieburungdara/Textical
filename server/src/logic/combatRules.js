const math = require('mathjs');

class CombatRules {
    /**
     * @param {Object} attacker 
     * @param {Object} defender 
     * @param {number} skillMult 
     * @param {number} skillElement 
     * @param {number} attackerTerrain 
     * @param {number} defenderTerrain 
     */
    static calculateDamage(attacker, defender, skillMult = 1.0, skillElement = 0, attackerTerrain = 0, defenderTerrain = 0) {
        // Sanitize Terrain inputs to ensure they are numbers
        const aTerr = attackerTerrain || 0;
        const dTerr = defenderTerrain || 0;

        // 1. Dodge Check
        let dodgeRate = defender.stats.dodge_rate || 0;
        if (dTerr === 5) dodgeRate += 20; // Forest cover
        
        if (math.random() < (dodgeRate / 100.0)) {
            return { damage: 0, isHit: false, isCrit: false, message: "MISS!" };
        }

        // 2. Base Damage
        let rawDamage = (attacker.stats.attack_damage || 0) * skillMult;
        let mitigation = defender.stats.defense || 0;
        let damage = rawDamage - mitigation;
        
        // Terrain High Ground (Ruins = 8)
        if (aTerr === 8) damage = math.multiply(damage, 1.15);

        // 3. Critical Hit
        let isCrit = false;
        const critChance = attacker.stats.crit_chance || 0.05;
        if (math.random() < critChance) {
            isCrit = true;
            damage = math.multiply(damage, (attacker.stats.crit_damage || 1.5));
        }

        // 4. Elemental and Resistances
        const elementToCheck = skillElement !== 0 ? skillElement : (attacker.data.element || 0);
        let resMultiplier = 1.0;
        
        const resMap = { 1: "res_fire", 2: "res_water", 3: "res_wind", 4: "res_earth", 5: "res_lightning" };
        const resKey = resMap[elementToCheck];
        if (resKey) resMultiplier = defender.stats[resKey] || 1.0;
        
        damage = math.multiply(damage, resMultiplier);

        // Water douses Fire
        if (elementToCheck === 1 && dTerr === 4) damage = math.multiply(damage, 0.7);

        // 5. Weapon Traits
        let appliedEffect = null;
        if (attacker.weaponTraits && attacker.weaponTraits.length > 0) {
            attacker.weaponTraits.forEach(trait => {
                if ((trait === "burn" || trait === "poison") && math.random() < 0.2) {
                    appliedEffect = trait;
                }
            });
        }

        damage = Math.floor(Math.max(1, damage));
        
        return { 
            damage: damage, 
            isHit: true, 
            isCrit: isCrit, 
            effect: appliedEffect,
            message: isCrit ? "CRITICAL!" : "HIT" 
        };
    }
}

module.exports = CombatRules;