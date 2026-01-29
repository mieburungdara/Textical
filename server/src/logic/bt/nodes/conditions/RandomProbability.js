const LogicGate = require('./LogicGate');

class RandomProbability extends LogicGate {
    constructor(params) { super({ name: 'RandomProbability', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const chance = this.properties.chance || 0.5;
        const roll = Math.random();
        const met = roll <= chance;

        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} roll: ${(roll*100).toFixed(0)} (Req: <= ${chance*100}). Result: ${met}`);
        return this.executePath(tick, met);
    }
}

module.exports = RandomProbability;