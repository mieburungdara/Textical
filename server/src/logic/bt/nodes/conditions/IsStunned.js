const LogicGate = require('./LogicGate');

class IsStunned extends LogicGate {
    constructor(params) { super({ name: 'IsStunned', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const isStunned = unit.activeEffects.some(e => e.type === "STUN");

        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking Stun status. Result: ${isStunned}`);
        return this.executePath(tick, isStunned);
    }
}

module.exports = IsStunned;