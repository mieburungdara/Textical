const LogicGate = require('./LogicGate');

class HasStatusEffect extends LogicGate {
    constructor(params) { super({ name: 'HasStatusEffect', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit } = tick.blackboard.get('context');
        const effectType = this.properties.effectType || 'STUN';
        
        const hasEffect = unit.activeEffects.some(e => e.type === effectType);
        return this.executePath(tick, hasEffect);
    }
}

module.exports = HasStatusEffect;
