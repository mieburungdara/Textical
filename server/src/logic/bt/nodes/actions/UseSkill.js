const b3 = require('behavior3js');

const UseSkill = b3.Class(b3.Action);

UseSkill.prototype.initialize = function(params = {}) {
    b3.Action.prototype.initialize.call(this, params);
    this.name = 'UseSkill';
    this.properties = params.properties || {};
}

UseSkill.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const skillId = this.properties.skillId;
    const target = tick.blackboard.get('target') || sim.ai.findTarget(unit);
    
    if (!target || !skillId) return b3.FAILURE;
    
    const skill = unit.data.skills.find(s => s.id === skillId);
    if (!skill) return b3.FAILURE;

    sim.rules.performSkill(unit, skill, target.gridPos);
    return b3.SUCCESS;
}

module.exports = UseSkill;
