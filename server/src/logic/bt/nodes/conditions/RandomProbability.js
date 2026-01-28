const LogicGate = require('./LogicGate');

/**
 * RandomProbability: Executes the path based on a chance.
 * Properties:
 * - chance: 0.0 to 1.0 (e.g. 0.3 for 30%)
 */
class RandomProbability extends LogicGate {
    constructor(params) { super({ name: 'RandomProbability', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const chance = this.properties.chance || 0.5;
        const roll = Math.random();
        
        return this.executePath(tick, roll <= chance);
    }
}

module.exports = RandomProbability;
