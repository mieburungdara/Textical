const BaseTrait = require('../BaseTrait');

/**
 * Sharpshooter Trait
 * Increases attack range.
 * Tiered Scaling:
 * Lv1: +1 Range
 * Lv2: +2 Range
 * Lv3: +4 Range
 */
class SharpshooterTrait extends BaseTrait {
    constructor() {
        super('sharpshooter');
    }

    onBattleStart(unit, sim) {
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'sharpshooter') || 
            (t && t.name && t.name.toLowerCase() === 'sharpshooter')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        const rangeBonusMapping = { 1: 1, 2: 2, 3: 4 };
        const bonusRange = rangeBonusMapping[level] || 1;

        unit.stats.attack_range = (unit.getStat("attack_range") || 1) + bonusRange;
        
        sim.logger.addEvent("VFX", `${unit.data.name} focuses their vision (+${bonusRange} Range, Lv${level})`, { 
            actor_id: unit.instanceId,
            vfx: "eagle_eye" 
        });
    }
}

module.exports = SharpshooterTrait;
