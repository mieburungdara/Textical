const LogicGate = require('./LogicGate');

class CheckMana extends LogicGate {
    constructor(params) { super({ name: 'CheckMana', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit } = tick.blackboard.get('context');
        const threshold = this.properties.threshold || 0.2; // Default 20%
        const currentRatio = unit.currentMana / unit.stats.mana_max;
        
        return this.executePath(tick, currentRatio >= threshold);
    }
}

module.exports = CheckMana;
