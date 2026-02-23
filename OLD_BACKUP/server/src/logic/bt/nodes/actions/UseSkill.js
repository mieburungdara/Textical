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
    
    const skill = unit.activeSkills.find(s => s.id === skillId);
    if (!skill) return b3.FAILURE;

    // AAA: Strategic MP Reservation Logic
    // If this is a 'low-tier' skill (low cost), but we have high-tier skills available,
    // and our MP is high (e.g. > 80%), we might skip this to 'save up' for the big hit.
    const maxCost = Math.max(...unit.activeSkills.map(s => s.manaCost || 0));
    if (skill.manaCost < maxCost && unit.currentMana >= (maxCost * 0.8)) {
        // High mana, don't waste it on cheap skills if a big one is possible soon
        if (Math.random() < 0.7) { // 70% chance to conserve
            return b3.FAILURE;
        }
    }

    if (unit.currentMana < skill.manaCost) return b3.FAILURE;
    if (!unit.isSkillReady(skill.id, sim)) return b3.FAILURE;

    sim.rules.performSkill(unit, skill, target.gridPos);
    return b3.SUCCESS;
}

module.exports = UseSkill;
