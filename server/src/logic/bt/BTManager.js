const b3 = require('behavior3js');

// Import Conditions
const IsTargetInRange = require('./nodes/conditions/IsTargetInRange');
const CheckHealth = require('./nodes/conditions/CheckHealth');
const CheckMana = require('./nodes/conditions/CheckMana');
const HasStatusEffect = require('./nodes/conditions/HasStatusEffect');

// Import Actions
const FindTarget = require('./nodes/actions/FindTarget');
const AttackTarget = require('./nodes/actions/AttackTarget');
const MoveToTarget = require('./nodes/actions/MoveToTarget');
const UseSkill = require('./nodes/actions/UseSkill');

class BTManager {
    constructor() {
        this.trees = {};
        this.blackboards = {};
        
        this.nodeRegistry = {
            'IsTargetInRange': IsTargetInRange,
            'CheckHealth': CheckHealth,
            'CheckMana': CheckMana,
            'HasStatusEffect': HasStatusEffect,
            'FindTarget': FindTarget,
            'AttackTarget': AttackTarget,
            'MoveToTarget': MoveToTarget,
            'UseSkill': UseSkill,
            'Priority': b3.Selector,
            'Switch': b3.Sequence,
            'Inverter': b3.Inverter
        };
    }

    loadTree(name, jsonData) {
        const tree = new b3.BehaviorTree();
        tree.load(jsonData, this.nodeRegistry);
        this.trees[name] = tree;
    }

    execute(treeName, unit, sim) {
        if (!this.trees[treeName]) return;
        if (!this.blackboards[unit.instanceId]) {
            this.blackboards[unit.instanceId] = new b3.Blackboard();
        }
        const blackboard = this.blackboards[unit.instanceId];
        blackboard.set('context', { unit, sim });
        this.trees[treeName].tick(unit, blackboard);
    }
}

module.exports = new BTManager();
