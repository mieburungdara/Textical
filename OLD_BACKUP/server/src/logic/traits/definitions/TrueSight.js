const BaseTrait = require('../BaseTrait');

/**
 * True Sight Trait
 * Increases accuracy and allows seeing through stealth/fog of war flags.
 * Tiered Scaling:
 * Lv1: +10 Accuracy
 * Lv2: +25 Accuracy
 * Lv3: +50 Accuracy
 */
class TrueSightTrait extends BaseTrait {
    constructor() {
        super('truesight');
    }

    onBattleStart(unit, sim) {
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'truesight') || 
            (t && t.name && t.name.toLowerCase() === 'truesight')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        const accMapping = { 1: 10, 2: 25, 3: 50 };
        const accBonus = accMapping[level] || 10;

        unit.stats.accuracy = (unit.stats.accuracy || 100) + accBonus;

        sim.logger.addEvent("VFX", `${unit.data.name} possesses the Gaze of Truth (Lv${level}). Accuracy +${accBonus}.`, { 
            actor_id: unit.instanceId,
            vfx: "true_sight_eye" 
        });
    }
}

module.exports = TrueSightTrait;
