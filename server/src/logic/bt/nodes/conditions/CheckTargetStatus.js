const LogicGate = require('./LogicGate');

class CheckTargetStatus extends LogicGate {
    constructor(params) { super({ name: 'CheckTargetStatus', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
        
        if (!target) return this.executePath(tick, false);
        
        const effectType = this.properties.effectType || 'BURN';
        const hasEffect = target.activeEffects.some(e => e.type === effectType);

        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking target ${target.data.name} for ${effectType}. Result: ${hasEffect}`);
        
        return this.executePath(tick, hasEffect);
    }
}

module.exports = CheckTargetStatus;