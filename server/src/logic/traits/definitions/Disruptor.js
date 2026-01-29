const BaseTrait = require('../BaseTrait');

/**
 * Disruptor Trait (Rogue/Assassin Specialization)
 * Allows moving through occupied tiles (Slipstream).
 */
class DisruptorTrait extends BaseTrait {
    constructor() { super('disruptor'); }

    // This trait works as a flag for the movement engine.
    // In a more complex setup, we could add onTileEnter checks to apply debuffs to enemies passed.
    onMoveStep(unit, nextPos, sim) {
        // Optional: Apply "Disoriented" to any enemy unit on this tile
        const victim = sim.grid.unitGrid[nextPos.y][nextPos.x];
        if (victim && victim.teamId !== unit.teamId) {
            sim.logger.addEvent("EMOTE", `${unit.data.name} slips past ${victim.data.name}!`, { actor_id: unit.instanceId });
        }
    }
}

module.exports = DisruptorTrait;
