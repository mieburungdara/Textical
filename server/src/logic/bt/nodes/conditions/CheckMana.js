const LogicGate = require('./LogicGate');

class CheckMana extends LogicGate {
    constructor(params) { super({ name: 'CheckMana', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const threshold = this.properties.threshold || 0.2;
        const currentRatio = unit.currentMana / unit.stats.mana_max;
        const met = currentRatio >= threshold;

        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking MP: ${(currentRatio*100).toFixed(0)}% (Req: >= ${threshold*100}%). Result: ${met}`);
        
        return this.executePath(tick, met);
    }
}

module.exports = CheckMana;