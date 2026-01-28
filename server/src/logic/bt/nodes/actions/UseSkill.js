const b3 = require('behavior3js');

class UseSkill extends b3.Action {
    constructor(params) { 
        super({ name: 'UseSkill', properties: params.properties || {} }); 
        this.properties = params.properties || {};
    }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const skillId = this.properties.skillId;
        
        // Ambil target dari memory (Blackboard) yang diset oleh FindTarget
        const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId);
        
        if (!target || !skillId) return b3.FAILURE;
        
        // Cari skill di data unit
        const skill = unit.data.skills.find(s => s.id === skillId);
        if (!skill) return b3.FAILURE;

        // Eksekusi Skill lewat BattleRules
        const success = sim.rules.performSkill(unit, target, skill);
        return success ? b3.SUCCESS : b3.FAILURE;
    }
}

module.exports = UseSkill;
