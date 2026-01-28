const b3 = require('behavior3js');

class FindTarget extends b3.Action {
    constructor(params) { 
        super({ name: 'FindTarget', properties: params.properties || {} }); 
        this.properties = params.properties || {};
    }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const strategy = this.properties.strategy || 'ENEMIES'; // ENEMIES, ALLIES, LOWEST_HP
        
        let targets = [];
        if (strategy === 'ENEMIES') {
            targets = sim.units.filter(u => u.teamId !== unit.teamId && u.currentHealth > 0);
        } else if (strategy === 'ALLIES') {
            targets = sim.units.filter(u => u.teamId === unit.teamId && u.currentHealth > 0);
        }
        
        if (targets.length === 0) return b3.FAILURE;
        
        // Simpan target yang ditemukan ke dalam "Memory" (Blackboard) unit ini
        // Agar node selanjutnya (seperti Attack atau Heal) tahu siapa yang harus diproses
        const closest = targets.sort((a, b) => {
            const distA = sim.grid.getDistance(unit.gridPos, a.gridPos);
            const distB = sim.grid.getDistance(unit.gridPos, b.gridPos);
            return distA - distB;
        })[0];
        
        tick.blackboard.set('target', closest, tick.tree.id, unit.instanceId);
        return b3.SUCCESS;
    }
}

module.exports = FindTarget;
