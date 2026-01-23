class CombatRules {
    static calculateDamage(attacker, defender, skillMult = 1.0, skillElement = 0) {
        // 1. Dodge Check
        const dodgeRate = (defender.stats.dodge_rate || 0) / 100.0;
        if (Math.random() < dodgeRate) return { damage: 0, isHit: false, isCrit: false, message: "MISS!" };

        // 2. Base Damage
        let damage = (attacker.stats.attack_damage * skillMult) - defender.stats.defense;
        
        // 3. Critical Hit Check
        let isCrit = false;
        const critChance = attacker.stats.crit_chance || 0.05;
        if (Math.random() < critChance) {
            isCrit = true;
            damage *= (attacker.stats.crit_damage || 1.5);
        }

        // 4. Elemental Calculation using Resistances (Restored Logic)
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

        // 5. Weapon Traits (Status Effects)
        let appliedEffect = null;
        if (attacker.weaponTraits && attacker.weaponTraits.length > 0) {
            attacker.weaponTraits.forEach(trait => {
                if ((trait === "burn" || trait === "poison") && Math.random() < 0.2) {
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
