const b3 = require('behavior3js');
const LogicGate = require('./LogicGate');

/**
 * CheckElement: Checks if the current target has a specific elemental affinity.
 * Properties:
 * - elementId: Number (0-7)
 */
const CheckElement = b3.Class(LogicGate);

CheckElement.prototype.initialize = function(params = {}) {
    LogicGate.prototype.initialize.call(this, params);
    this.name = 'CheckElement';
}

CheckElement.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const target = tick.blackboard.get('target') || sim.ai.findTarget(unit);
    
    if (!target) return this.executePath(tick, false);
    
    const requiredElement = this.properties.elementId || 0;
    const targetElement = target.data.element || 0;
    const met = targetElement === requiredElement;

    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking target element. Target: ${targetElement}, Req: ${requiredElement}. Result: ${met}`);
    
    return this.executePath(tick, met);
}

module.exports = CheckElement;
