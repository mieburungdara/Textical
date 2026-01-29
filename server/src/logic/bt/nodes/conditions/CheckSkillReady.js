const LogicGate = require('./LogicGate');

class CheckSkillReady extends LogicGate {
    constructor(params) { super({ name: 'CheckSkillReady', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const skillId = this.properties.skillId;
        
        if (!skillId) return this.executePath(tick, false);
        
        const cooldown = unit.skillCooldowns[skillId] || 0;
        const met = cooldown <= 0;

        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking skill ${skillId} CD: ${cooldown}. Ready: ${met}`);
        
        return this.executePath(tick, met);
    }
}

module.exports = CheckSkillReady;