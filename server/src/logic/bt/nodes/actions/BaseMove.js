const b3 = require('behavior3js');

/**
 * BaseMove Action (AAA Standard)
 * Parent class for all movement-based behaviors.
 */
const BaseMove = b3.Class(b3.Action);

BaseMove.prototype.initialize = function(params = {}) {
    b3.Action.prototype.initialize.call(this, params);
    this.name = params.name || 'BaseMove';
    this.title = params.title || 'Movement';
    this.properties = params.properties || {};
}

/**
 * Helper: Validates if movement is allowed by Traits
 */
BaseMove.prototype.canMove = function(unit, sim) {
    const traitService = require('../../../../services/traitService');
    return traitService.executeHook("onBeforeMove", unit, sim) !== false;
}

/**
 * Helper: Executes one step of the path
 */
BaseMove.prototype.stepTowards = function(unit, targetPos, sim) {
    if (!this.canMove(unit, sim)) return b3.FAILURE;
    sim.ai.moveTowards(unit, { gridPos: targetPos, data: { name: "Destination" } });
    return b3.SUCCESS;
}

module.exports = BaseMove;
