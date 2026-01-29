const LogicGate = require('./LogicGate');

class CheckTrait extends LogicGate {
    constructor(params) { super({ name: 'CheckTrait', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const requiredTrait = this.properties.traitName;
        
        if (!requiredTrait) return this.executePath(tick, false);
        
        const traits = unit.traits || [];
        const hasTrait = traits.some(t => {
            const name = (typeof t === 'string') ? t : t.name;
            return name.toLowerCase() === requiredTrait.toLowerCase();
        });

        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} checking trait ${requiredTrait}. Result: ${hasTrait}`);
        
        return this.executePath(tick, hasTrait);
    }
}

module.exports = CheckTrait;