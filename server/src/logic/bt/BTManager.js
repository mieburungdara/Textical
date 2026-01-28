const b3 = require('behavior3js');

// Import Conditions
const IsTargetInRange = require('./nodes/conditions/IsTargetInRange');
const CheckHealth = require('./nodes/conditions/CheckHealth');
const CheckMana = require('./nodes/conditions/CheckMana');
const HasStatusEffect = require('./nodes/conditions/HasStatusEffect');
const NearbyUnitsCount = require('./nodes/conditions/NearbyUnitsCount');
const RandomProbability = require('./nodes/conditions/RandomProbability');
const CheckSkillReady = require('./nodes/conditions/CheckSkillReady');
const CheckDistance = require('./nodes/conditions/CheckDistance');
const CheckTerrain = require('./nodes/conditions/CheckTerrain');
const CheckTargetStatus = require('./nodes/conditions/CheckTargetStatus');
const CheckAllyCount = require('./nodes/conditions/CheckAllyCount');
const CheckLineOfSight = require('./nodes/conditions/CheckLineOfSight');
const CheckTrait = require('./nodes/conditions/CheckTrait');

// Import Actions
const FindTarget = require('./nodes/actions/FindTarget');
const AttackTarget = require('./nodes/actions/AttackTarget');
const MoveToTarget = require('./nodes/actions/MoveToTarget');
const UseSkill = require('./nodes/actions/UseSkill');
const KiteTarget = require('./nodes/actions/KiteTarget');

class BTManager {
    constructor() {
        this.trees = {};
        this.blackboards = {};
        
        this.nodeRegistry = {
            'IsTargetInRange': IsTargetInRange,
            'CheckHealth': CheckHealth,
            'CheckMana': CheckMana,
            'HasStatusEffect': HasStatusEffect,
            'NearbyUnitsCount': NearbyUnitsCount,
            'RandomProbability': RandomProbability,
            'CheckSkillReady': CheckSkillReady,
            'CheckDistance': CheckDistance,
            'CheckTerrain': CheckTerrain,
            'CheckTargetStatus': CheckTargetStatus,
            'CheckAllyCount': CheckAllyCount,
            'CheckLineOfSight': CheckLineOfSight,
            'CheckTrait': CheckTrait,
            'FindTarget': FindTarget,
            'AttackTarget': AttackTarget,
            'MoveToTarget': MoveToTarget,
            'UseSkill': UseSkill,
            'KiteTarget': KiteTarget,
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
