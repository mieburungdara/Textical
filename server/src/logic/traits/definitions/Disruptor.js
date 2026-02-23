const BaseTrait = require('../BaseTrait');

/**
 * Disruptor Trait
 * Increases movement range and allows slipping past enemies.
 * Tiered Scaling:
 * Lv1: +1 Move Range
 * Lv2: +2 Move Range
 * Lv3: +3 Move Range
 */
class DisruptorTrait extends BaseTrait {
    constructor() {
        super('disruptor');
    }

    onBattleStart(unit, sim) {
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'disruptor') || 
            (t && t.name && t.name.toLowerCase() === 'disruptor')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        const moveBonusMapping = { 1: 1, 2: 2, 3: 3 };
        const bonus = moveBonusMapping[level] || 1;

        unit.stats.move_range = (unit.stats.move_range || 3) + bonus;

        sim.logger.addEvent("VFX", `${unit.data.name} is a Disruptor (Lv${level}). Move Range increased by ${bonus}.`, {
            actor_id: unit.instanceId,
            vfx: "slipstream"
        });
    }

    onMoveStep(unit, nextPos, sim) {
        const victim = sim.grid.unitGrid[nextPos.y][nextPos.x];
        if (victim && victim.teamId !== unit.teamId) {
            sim.logger.addEvent("EMOTE", `${unit.data.name} slips past ${victim.data.name}!`, { 
                actor_id: unit.instanceId 
            });
        }
    }
}

module.exports = DisruptorTrait;
