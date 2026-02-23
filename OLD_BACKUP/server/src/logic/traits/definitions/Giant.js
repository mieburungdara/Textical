const BaseTrait = require('../BaseTrait');

/**
 * Giant Trait
 * Significantly increases health but reduces speed.
 * Tiered Scaling:
 * Lv1: MaxHP * 1.25, Spd -2
 * Lv2: MaxHP * 1.50, Spd -5
 * Lv3: MaxHP * 2.00, Spd -10
 */
class GiantTrait extends BaseTrait {
    constructor() {
        super('giant');
    }

    onBattleStart(unit, sim) {
        // Get trait level
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'giant') || 
            (t && t.name && t.name.toLowerCase() === 'giant')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering
        const hpHMultMapping = { 1: 1.25, 2: 1.50, 3: 2.00 };
        const spdPenaltyMapping = { 1: 2, 2: 5, 3: 10 };

        const hpMult = hpHMultMapping[level] || 1.25;
        const spdPenalty = spdPenaltyMapping[level] || 2;

        unit.stats.health_max = Math.floor(unit.stats.health_max * hpMult);
        unit.currentHealth = unit.stats.health_max;
        unit.stats.speed = Math.max(1, unit.stats.speed - spdPenalty);

        sim.logger.addEvent("VFX", `${unit.data.name} towers over the field!`, { 
            actor_id: unit.instanceId, 
            vfx: "growth" 
        });
    }
}

module.exports = GiantTrait;
