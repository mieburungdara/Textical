const BaseTrait = require('../BaseTrait');

/**
 * Splitting Form Trait (Renamed from Slime)
 * Splits into multiple smaller versions upon death.
 * Tiered Scaling:
 * Lv1: Splits into 1 mini (30% stats)
 * Lv2: Splits into 2 minis (40% stats)
 * Lv3: Splits into 3 minis (50% stats)
 */
class SplittingFormTrait extends BaseTrait {
    constructor() {
        super('splittingform');
    }

    onDeath(unit, sim) {
        if (unit.data.is_mini) return;

        // Get trait level
        const traitObj = unit.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'splittingform') || 
            (t && t.name && t.name.toLowerCase() === 'splittingform')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering
        const splitCountMapping = { 1: 1, 2: 2, 3: 3 };
        const statMultMapping = { 1: 0.3, 2: 0.4, 3: 0.5 };

        const splitCountGoal = splitCountMapping[level] || 1;
        const statMult = statMultMapping[level] || 0.3;

        const neighbors = [{x:1,y:0}, {x:-1,y:0}, {x:0,y:1}, {x:0,y:-1}];
        let spawned = 0;
        
        neighbors.forEach(n => {
            if (spawned >= splitCountGoal) return;
            const pos = { x: unit.gridPos.x + n.x, y: unit.gridPos.y + n.y };
            
            if (pos.x >= 0 && pos.x < sim.width && pos.y >= 0 && pos.y < sim.height) {
                const isOccupied = sim.grid.unitGrid[pos.y] && sim.grid.unitGrid[pos.y][pos.x];
                if (!isOccupied) {
                    const miniStats = { ...unit.stats };
                    miniStats.health_max = Math.floor(unit.stats.health_max * statMult);
                    miniStats.attack_damage = Math.floor(unit.stats.attack_damage * statMult);
                    
                    sim.addUnit({ 
                        ...unit.data, 
                        name: `Mini ${unit.data.name}`, 
                        is_mini: true, 
                        instance_id: `${unit.instanceId}_m${spawned}`, 
                        traits: [{ name: "splittingform", level: 1 }] 
                    }, unit.teamId, pos, miniStats);
                    
                    spawned++;
                }
            }
        });

        if (spawned > 0) {
            sim.logger.addEvent("REACTION", `${unit.data.name} split into ${spawned} forms!`, {
                actor_id: unit.instanceId,
                count: spawned,
                level: level
            });
        }
    }
}

module.exports = SplittingFormTrait;
