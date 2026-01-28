const LogicGate = require('./LogicGate');

/**
 * CheckSkillReady: Mengecek apakah skill tertentu siap digunakan.
 * Properties:
 * - skillId: ID dari skill yang ingin dicek.
 */
class CheckSkillReady extends LogicGate {
    constructor(params) { super({ name: 'CheckSkillReady', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit } = tick.blackboard.get('context');
        const skillId = this.properties.skillId;
        
        if (!skillId) return this.executePath(tick, false);
        
        // Cek di cooldowns unit (biasanya disimpan di unit.skillCooldowns)
        const cooldown = unit.skillCooldowns[skillId] || 0;
        
        return this.executePath(tick, cooldown <= 0);
    }
}

module.exports = CheckSkillReady;
