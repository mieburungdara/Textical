const b3 = require('behavior3js');

/**
 * Enhanced Logic Gate
 * Supports reading 'properties' from JSON (e.g. threshold, targetType)
 */
class LogicGate extends b3.Decorator {
    constructor(params) {
        super({ 
            name: params.name, 
            children: params.children,
            properties: params.properties || {} 
        });
        this.properties = params.properties || {};
    }

    executePath(tick, conditionMet) {
        if (conditionMet) {
            return this.children[0] ? this.children[0]._execute(tick) : b3.SUCCESS;
        } else {
            return this.children[1] ? this.children[1]._execute(tick) : b3.FAILURE;
        }
    }
}

module.exports = LogicGate;