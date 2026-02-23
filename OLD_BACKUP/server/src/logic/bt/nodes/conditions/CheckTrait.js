const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * CheckTrait: Checks if the unit has a specific trait (Intrinsic, Racial, or Weapon).
 */
const CheckTrait = b3.Class(LogicGate);

CheckTrait.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'CheckTrait';
}

CheckTrait.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const requiredTrait = this.properties.traitName;
    
    if (!requiredTrait) return this.executePath(tick, false);
    
    // AAA: Aggregate all traits for checking
    const allTraits = [...(unit.traits || []), unit.race, ...(unit.weaponTraits || [])];
    const hasTrait = allTraits.some(t => {
        const name = (typeof t === 'string') ? t : (t.name || t.type);
        return name && name.toLowerCase() === requiredTrait.toLowerCase();
    });

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} has trait '${requiredTrait}'? Result: ${hasTrait}`);
    
    return this.executePath(tick, hasTrait);
}

module.exports = CheckTrait;
