const LogicGate = require('./LogicGate');

class IsStunned extends LogicGate {
    constructor(params) { super({ name: 'IsStunned', children: params.children }); }
    
    tick(tick) {
        const { unit } = tick.blackboard.get('context');
        const isStunned = unit.activeEffects.some(e => e.type === "STUN");
        return this.executePath(tick, isStunned);
    }
}

module.exports = IsStunned;
