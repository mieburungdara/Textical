const LogicGate = require('./LogicGate');

class IsLowHP extends LogicGate {
    constructor(params) { super({ name: 'IsLowHP', children: params.children }); }
    
    tick(tick) {
        const { unit } = tick.blackboard.get('context');
        const isLow = (unit.currentHealth / unit.stats.health_max) < 0.4;
        return this.executePath(tick, isLow);
    }
}

module.exports = IsLowHP;
