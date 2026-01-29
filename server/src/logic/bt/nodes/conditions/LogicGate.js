const b3 = require('behavior3js');

/**
 * AAA Logic Gate (v3.3)
 * Redefined using b3.Class to match library internals 100%.
 */
const LogicGate = b3.Class(b3.Composite);

LogicGate.prototype.initialize = function(params = {}) {
    b3.Composite.prototype.initialize.call(this, params);
    this.name = params.name || 'LogicGate';
    this.title = params.title || 'LogicGate';
    this.properties = params.properties || {};
}

LogicGate.prototype.executePath = function(tick, conditionMet) {
    if (conditionMet) {
        return this.children[0] ? this.children[0]._execute(tick) : b3.SUCCESS;
    } else {
        return this.children[1] ? this.children[1]._execute(tick) : b3.FAILURE;
    }
}

module.exports = LogicGate;
