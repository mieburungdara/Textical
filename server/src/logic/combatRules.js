class CombatRules {
    static calculateDamage(attacker, defender, skillMult = 1.0) {
        // 1. Dodge Check
        const dodgeRate = (defender.stats.dodge_rate || 0) / 100.0;
        if (Math.random() < dodgeRate) return { damage: 0, isHit: false, isCrit: false, message: "MISS!" };

        // 2. Base Damage
        let damage = (attacker.stats.attack_damage * skillMult) - defender.stats.defense;
        
        // 3. Critical Hit Check (Restored Logic)
        let isCrit = false;
        const critChance = attacker.stats.crit_chance || 0.05;
        if (Math.random() < critChance) {
            isCrit = true;
            damage *= (attacker.stats.crit_damage || 1.5);
        }

        // 4. Elemental Matrix
        const aEle = attacker.data.element || 0;
        const dEle = defender.data.element || 0;
        if (aEle !== 0 && dEle !== 0) {
            if ((aEle === 1 && dEle === 2) || (aEle === 2 && dEle === 3) || (aEle === 3 && dEle === 1)) damage *= 1.5;
            else if ((aEle === 2 && dEle === 1) || (aEle === 3 && dEle === 2) || (aEle === 1 && dEle === 3)) damage *= 0.75;
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