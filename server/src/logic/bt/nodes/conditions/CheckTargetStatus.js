const LogicGate = require('./LogicGate');

/**
 * CheckTargetStatus: Mengecek status effect pada TARGET saat ini.
 * Properties:
 * - effectType: 'STUN', 'BURN', 'POISON', dll.
 */
class CheckTargetStatus extends LogicGate {
    constructor(params) { super({ name: 'CheckTargetStatus', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
        
        if (!target) return this.executePath(tick, false);
        
        const effectType = this.properties.effectType || 'BURN';
        const hasEffect = target.activeEffects.some(e => e.type === effectType);
        
        return this.executePath(tick, hasEffect);
    }
}

module.exports = CheckTargetStatus;
