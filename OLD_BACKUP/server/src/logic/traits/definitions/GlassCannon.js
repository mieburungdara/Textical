const BaseTrait = require('../BaseTrait');

/**
 * Glass Cannon Trait
 * Dramatically increases attack power but severely reduces maximum health.
 * Tiered Scaling:
 * Lv1: Atk * 1.4, MaxHP * 0.7
 * Lv2: Atk * 1.8, MaxHP * 0.4
 * Lv3: Atk * 2.5, MaxHP * 0.2
 */
class GlassCannonTrait extends BaseTrait {
    constructor() {
        super('glass_cannon');
    }

    onBattleStart(unit, sim) {
        // Get trait level
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'glass_cannon') || 
            (t && t.name && t.name.toLowerCase() === 'glass_cannon')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering
        const atkMultMapping = { 1: 1.4, 2: 1.8, 3: 2.5 };
        const hpMultMapping = { 1: 0.7, 2: 0.4, 3: 0.2 };

        const atkMult = atkMultMapping[level] || 1.4;
        const hpMult = hpMultMapping[level] || 0.7;

        // Apply permanent-for-battle changes to stats
        unit.stats.attack_damage = Math.floor(unit.stats.attack_damage * atkMult);
        unit.stats.health_max = Math.floor(unit.stats.health_max * hpMult);
        
        // Sync current HP
        unit.currentHealth = unit.stats.health_max;

        sim.logger.addEvent("EMOTE", `${unit.data.name} focuses purely on offense (Lv${level})!`, { 
            actor_id: unit.instanceId 
        });
    }
}

module.exports = GlassCannonTrait;
