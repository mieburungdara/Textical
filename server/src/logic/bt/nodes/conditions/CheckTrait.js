const LogicGate = require('./LogicGate');

/**
 * CheckTrait: Mengecek apakah unit memiliki trait tertentu.
 * Properties:
 * - traitName: Nama trait yang ingin dicek (misal: 'Fireborn', 'Lifesteal')
 */
class CheckTrait extends LogicGate {
    constructor(params) { super({ name: 'CheckTrait', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit } = tick.blackboard.get('context');
        const requiredTrait = this.properties.traitName;
        
        if (!requiredTrait) return this.executePath(tick, false);
        
        // Handle both simple strings and objects from Hero profile
        const hasTrait = unit.traits.some(t => {
            const name = (typeof t === 'string') ? t : t.name;
            return name.toLowerCase() === requiredTrait.toLowerCase();
        });
        
        return this.executePath(tick, hasTrait);
    }
}

module.exports = CheckTrait;
