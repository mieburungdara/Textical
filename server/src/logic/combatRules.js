class CombatRules {
    /**
     * @param {Object} attacker 
     * @param {Object} defender 
     * @param {number} skillMult 
     * @param {number} skillElement 
     * @param {number} attackerTerrain (ID medan penyerang)
     * @param {number} defenderTerrain (ID medan bertahan)
     */
    static calculateDamage(attacker, defender, skillMult = 1.0, skillElement = 0, attackerTerrain = 0, defenderTerrain = 0) {
        // 1. Dodge Check
        let dodgeRate = (defender.stats.dodge_rate || 0);
        
        // TERRAIN EFFECT: Forest (5) gives +20% Evasion
        if (defenderTerrain === 5) {
            dodgeRate += 20;
        }
        
        if (Math.random() < (dodgeRate / 100.0)) {
            return { damage: 0, isHit: false, isCrit: false, message: "MISS!" };
        }

        // 2. Base Damage
        let damage = (attacker.stats.attack_damage * skillMult) - defender.stats.defense;
        
        // TERRAIN EFFECT: Ruins (8) gives +15% Damage (High Ground)
        if (attackerTerrain === 8) {
            damage *= 1.15;
        }

        // 3. Critical Hit
        let isCrit = false;
        const critChance = attacker.stats.crit_chance || 0.05;
        if (Math.random() < critChance) {
            isCrit = true;
            damage *= (attacker.stats.crit_damage || 1.5);
        }

        // 4. Elemental Calculation
        const elementToCheck = skillElement !== 0 ? skillElement : (attacker.data.element || 0);
        let resMultiplier = 1.0;
        
        switch (elementToCheck) {
            case 1: resMultiplier = defender.stats.res_fire || 1.0; break;
            case 2: resMultiplier = defender.stats.res_water || 1.0; break;
            case 3: resMultiplier = defender.stats.res_wind || 1.0; break;
            case 4: resMultiplier = defender.stats.res_earth || 1.0; break;
            case 5: resMultiplier = defender.stats.res_lightning || 1.0; break;
        }
        damage *= resMultiplier;

        // TERRAIN EFFECT: Water (4) douses Fire (1) - Reduce fire damage by 30%
        if (elementToCheck === 1 && defenderTerrain === 4) {
            damage *= 0.7;
        }

        damage = Math.floor(Math.max(1, damage));
        return { 
            damage: damage, 
            isHit: true, 
            isCrit: isCrit, 
            message: isCrit ? "CRITICAL!" : "HIT" 
        };
    }
}

module.exports = CombatRules;