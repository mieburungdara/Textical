const BaseTrait = require('../BaseTrait');

class SlimeTrait extends BaseTrait {
    constructor() { super('slime'); }

    onDeath(unit, sim) {
        if (unit.data.is_mini) return;

        const neighbors = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
        let count = 0;
        neighbors.forEach(n => {
            if (count >= 2) return;
            const pos = { x: unit.gridPos.x + n.x, y: unit.gridPos.y + n.y };
            if (pos.x >= 0 && pos.x < sim.width && pos.y >= 0 && pos.y < sim.height && !sim.grid.unitGrid[pos.y][pos.x]) {
                const miniStats = { ...unit.stats };
                miniStats.health_max = Math.floor(unit.stats.health_max * 0.4);
                sim.addUnit({ ...unit.data, name: `Mini ${unit.data.name}`, is_mini: true, instance_id: `${unit.instanceId}_m${count}`, traits: ["slime"] }, unit.teamId, pos, miniStats);
                count++;
            }
        });
    }
}

module.exports = SlimeTrait;
