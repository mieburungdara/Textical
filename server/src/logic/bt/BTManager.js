const b3 = require('behavior3js');

/**
 * Custom Action: Check Target In Range
 */
class IsTargetInRange extends b3.Condition {
    constructor() { super({ name: 'IsTargetInRange' }); }
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = sim.ai.findTarget(unit);
        if (!target) return b3.FAILURE;
        
        const dist = sim.grid.getDistance(unit.gridPos, target.gridPos);
        const range = unit.stats.attack_range || 1;
        
        return dist <= range ? b3.SUCCESS : b3.FAILURE;
    }
}

/**
 * Custom Action: Attack Target
 */
class AttackTarget extends b3.Action {
    constructor() { super({ name: 'AttackTarget' }); }
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = sim.ai.findTarget(unit);
        if (!target) return b3.FAILURE;
        
        sim.rules.performAttack(unit, target);
        return b3.SUCCESS;
    }
}

/**
 * Custom Action: Move To Target
 */
class MoveToTarget extends b3.Action {
    constructor() { super({ name: 'MoveToTarget' }); }
    tick(tick) {
        const { unit, sim } = tick.blackboard.get('context');
        const target = sim.ai.findTarget(unit);
        if (!target) return b3.FAILURE;
        
        sim.ai.moveTowards(unit, target);
        return b3.SUCCESS;
    }
}

class BTManager {
    constructor() {
        this.trees = {};
        this.blackboards = {}; // Persistent state per unit
    }

    /**
     * Loads a JSON exported from the Behavior3 Editor
     */
    loadTree(name, jsonData) {
        const tree = new b3.BehaviorTree();
        // Register custom nodes so the parser recognizes them
        const customNodes = {
            'IsTargetInRange': IsTargetInRange,
            'AttackTarget': AttackTarget,
            'MoveToTarget': MoveToTarget
        };
        tree.load(jsonData, customNodes);
        this.trees[name] = tree;
    }

    execute(treeName, unit, sim) {
        if (!this.trees[treeName]) return;

        // Get or create blackboard for this unit
        if (!this.blackboards[unit.instanceId]) {
            this.blackboards[unit.instanceId] = new b3.Blackboard();
        }

        const blackboard = this.blackboards[unit.instanceId];
        blackboard.set('context', { unit, sim });
        
        this.trees[treeName].tick(unit, blackboard);
    }
}

module.exports = new BTManager();
