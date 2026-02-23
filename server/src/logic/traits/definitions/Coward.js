const BaseTrait = require('../BaseTrait');

/**
 * Coward Trait
 * Increases speed when health is low, but has a chance to panic and skip action if no allies are nearby.
 * Tiered Scaling:
 * Lv1: +5 Speed at < 30% HP. 15% Panic chance when lone.
 * Lv2: +10 Speed at < 40% HP. 25% Panic chance when lone.
 * Lv3: +20 Speed at < 50% HP. 45% Panic chance when lone.
 */
class CowardTrait extends BaseTrait {
    constructor() {
        super('coward');
    }

    onTickStart(unit, sim) {
        if (unit.isDead) return;

        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'coward') || 
            (t && t.name && t.name.toLowerCase() === 'coward')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        const thresholdMapping = { 1: 0.3, 2: 0.4, 3: 0.5 };
        const speedMapping = { 1: 5, 2: 10, 3: 20 };

        const threshold = thresholdMapping[level] || 0.3;
        const speedBonus = speedMapping[level] || 5;

        const maxHP = unit.getStat("health_max");
        if (unit.currentHealth / maxHP < threshold) {
            unit.temporaryStats.speed = (unit.temporaryStats.speed || 0) + speedBonus;
        }
    }

    onBeforeAction(unit, sim) {
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'coward') || 
            (t && t.name && t.name.toLowerCase() === 'coward')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        const panicChanceMapping = { 1: 0.15, 2: 0.25, 3: 0.45 };
        const panicChance = panicChanceMapping[level] || 0.15;

        // Cowards skip action if alone and panic roll fails
        const allies = sim.units.filter(u => u.teamId === unit.teamId && !u.isDead && u.instanceId !== unit.instanceId);
        if (allies.length === 0 && Math.random() < panicChance) {
            sim.logger.addEvent("EMOTE", `${unit.data.name} is too scared to act!`, { 
                actor_id: unit.instanceId,
                level: level 
            });
            return false;
        }
        return true;
    }
}

module.exports = CowardTrait;
