const b3 = require('behavior3js');

/**
 * FindTarget: Scans the grid for a suitable target based on team and health.
 */
const FindTarget = b3.Class(b3.Action);

FindTarget.prototype.initialize = function(params = {}) {
    b3.Action.prototype.initialize.call(this, params);
    this.name = 'FindTarget';
    this.properties = params.properties || { strategy: 'ENEMIES' };
}

FindTarget.prototype.tick = function(tick) {
    const { unit, sim } = tick.blackboard.get('context');
    const strategy = this.properties.strategy || 'ENEMIES';
    
    let targets = [];
    if (strategy === 'ENEMIES') {
        targets = (sim.units || []).filter(u => u && u.teamId !== unit.teamId && u.currentHealth > 0);
    } else if (strategy === 'ALLIES') {
        targets = (sim.units || []).filter(u => u && u.teamId === unit.teamId && u.currentHealth > 0);
    }
    
    if (targets.length === 0) {
        sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} failed to find ${strategy}`, {}, true);
        return b3.FAILURE;
    }
    
    const scoredTargets = targets.map(t => {
        const dist = sim.grid.getDistance(unit.gridPos, t.gridPos);
        const engagedCount = sim.ai.getEngagedCount(t, unit.teamId);
        
        // AAA: Scoring Logic with Stuck Awareness
        // If unit is stuck, we add a massive penalty to the current target to force a switch
        const isCurrentTarget = tick.blackboard.get('target') === t;
        const stuckPenalty = (isCurrentTarget && (unit.stuckTicks > 0)) ? (unit.stuckTicks * 20) : 0;
        
        const score = dist + (engagedCount * 5) + stuckPenalty; 
        
        return { target: t, score: score };
    });
    
    scoredTargets.sort((a, b) => a.score - b.score);
    const closest = scoredTargets[0].target;
    
    sim.logger.addEvent("ENGINE", `[AI_TRACE] ${unit.data.name} targeted ${closest.data.name} (Score: ${scoredTargets[0].score.toFixed(1)})`, {}, true);
    
    // AAA: Use a consistent key without tree-scoping for easier access by other nodes
    tick.blackboard.set('target', closest); 
    
    return b3.SUCCESS;
}

module.exports = FindTarget;