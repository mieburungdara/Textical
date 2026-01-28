const BaseTrait = require('../BaseTrait');

class CowardTrait extends BaseTrait {
    constructor() { super('coward'); }

    onTickStart(unit, sim) {
        if (unit.currentHealth / unit.stats.health_max < 0.3) {
            unit.temporaryStats.speed = (unit.temporaryStats.speed || 0) + 10;
        }
    }

    onBeforeAction(unit, sim) {
        // Cowards have a small chance to panic and skip their action if alone
        const allies = sim.units.filter(u => u.teamId === unit.teamId && !u.isDead && u.instanceId !== unit.instanceId);
        if (allies.length === 0 && Math.random() < 0.15) {
            sim.logger.addEvent("EMOTE", `${unit.data.name} is too scared to act!`, { actor_id: unit.instanceId });
            return false;
        }
        return true;
    }
}

module.exports = CowardTrait;
