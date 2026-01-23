class CombatRules {
    static calculateDamage(attacker, defender, skillMult = 1.0, skillElement = 0) {
        // 1. Dodge Check
        const dodgeRate = (defender.stats.dodge_rate || 0); 
        if (Math.random() < dodgeRate) return { damage: 0, isHit: false, isCrit: false, message: "MISS!" };

        // 2. Base Damage
        let rawDamage = (attacker.stats.attack_damage * skillMult);
        let mitigation = defender.stats.defense || 0;
        let damage = rawDamage - mitigation;

        // 3. Critical Hit
        const critChance = (attacker.stats.critical_chance || 0);
        let isCrit = false;
        if (Math.random() < critChance) {
            isCrit = true;
            damage *= (attacker.stats.critical_damage || 1.5);
        }

        // 4. ELEMENTAL RESISTANCE (RESTORED LOGIC)
        // Use specific resistance from unit data if available
        const element = skillElement || attacker.data.element || 0;
        let resMult = 1.0;
        
        switch(element) {
            case 1: resMult = defender.data.res_fire ?? 1.0; break;    // Fire
            case 2: resMult = defender.data.res_water ?? 1.0; break;   // Water
            case 3: resMult = defender.data.res_nature ?? 1.0; break;  // Nature
            case 4: resMult = defender.data.res_earth ?? 1.0; break;   // Earth
            case 5: resMult = defender.data.res_lightning ?? 1.0; break; // Lightning
        }
        damage *= resMult;

        damage = Math.floor(Math.max(1, damage));

        // 5. TRAIT EFFECTS
        let effectApplied = null;
        if (attacker.traits && attacker.traits.includes("burn") && Math.random() < 0.3) effectApplied = "burn";
        if (attacker.traits && attacker.traits.includes("poison") && Math.random() < 0.3) effectApplied = "poison";

        return { 
            damage: damage, 
            isHit: true, 
            isCrit: isCrit, 
            effect: effectApplied,
            message: isCrit ? "CRITICAL!" : "HIT" 
        };
    }
}

module.exports = CombatRules;