const LogicGate = require('./LogicGate');

class HasStatusEffect extends LogicGate {
    constructor(params) { super({ name: 'HasStatusEffect', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const effectType = this.properties.effectType || 'STUN';
        const hasEffect = unit.activeEffects.some(e => e.type === effectType);

        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking for ${effectType}. Result: ${hasEffect}`);
        return this.executePath(tick, hasEffect);
    }
}

module.exports = HasStatusEffect;