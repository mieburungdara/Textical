const LogicGate = require('./LogicGate');

/**
 * CheckLineOfSight: Mengecek apakah jalur ke target bersih (tidak terhalang).
 */
class CheckLineOfSight extends LogicGate {
    constructor(params) { super({ name: 'CheckLineOfSight', children: params.children, properties: params.properties }); }
    
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = tick.blackboard.get('target', tick.tree.id, unit.instanceId) || sim.ai.findTarget(unit);
        
        if (!target) return this.executePath(tick, false);
        
        // Menggunakan fungsi line-of-sight dari grid (jika ada)
        // Jika belum ada, kita asumsikan True atau buat logika Bresenham sederhana
        const isClear = sim.grid.hasLineOfSight ? sim.grid.hasLineOfSight(unit.gridPos, target.gridPos) : true;
        
        return this.executePath(tick, isClear);
    }
}

module.exports = CheckLineOfSight;
