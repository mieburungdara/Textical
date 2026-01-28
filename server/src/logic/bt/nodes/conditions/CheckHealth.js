const LogicGate = require('./LogicGate');

class CheckHealth extends LogicGate {
    constructor(params) { super({ name: 'CheckHealth', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit } = tick.blackboard.get('context');
        // Membaca threshold dari properti JSON (default 0.5 atau 50%)
        const threshold = this.properties.threshold || 0.5;
        const currentRatio = unit.currentHealth / unit.stats.health_max;
        
        return this.executePath(tick, currentRatio <= threshold);
    }
}

module.exports = CheckHealth;
