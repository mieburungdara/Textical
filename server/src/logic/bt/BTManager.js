const b3 = require('behavior3js');
const fs = require('fs');
const path = require('path');

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
const CheckElement = require('./nodes/conditions/CheckElement');

// Import Actions
const BaseMove = require('./nodes/actions/BaseMove');
const FindTarget = require('./nodes/actions/FindTarget');
const AttackTarget = require('./nodes/actions/AttackTarget');
const MoveToTarget = require('./nodes/actions/MoveToTarget');
const UseSkill = require('./nodes/actions/UseSkill');
const KiteTarget = require('./nodes/actions/KiteTarget');

class BTManager {
    constructor() {
        this.trees = {};
        this.blackboards = {};
        this.initErrors = [];
        
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
            'CheckElement': CheckElement,
            'FindTarget': FindTarget,
            'AttackTarget': AttackTarget,
            'BaseMove': BaseMove,
            'MoveToTarget': MoveToTarget,
            'UseSkill': UseSkill,
            'KiteTarget': KiteTarget,
            
            'Priority': b3.Priority,
            'Switch': b3.Sequence,
            'Inverter': b3.Inverter
        };

        this._loadAllTrees();
    }

    _loadAllTrees() {
        const btDir = __dirname;
        try {
            const files = fs.readdirSync(btDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                const name = path.basename(file, '.json');
                const data = JSON.parse(fs.readFileSync(path.join(btDir, file), 'utf8'));
                this.loadTree(name, data);
            });
        } catch (e) { this.initErrors.push(`Registry load failed: ${e.message}`); }
    }

    /**
     * AAA Transformer: Convert Master-Detail JSON into behavior3js internal format
     */
    _formatDataForB3(jsonData) {
        // behavior3js internal format expects 'nodes' to be an object with IDs as keys
        // BUT it must NOT have circular references or complex objects during initialization
        // Our JSON is already an object-map, so the issue might be ID resolution.
        
        // Let's ensure EVERY node has an 'id' and 'name'
        const formattedNodes = {};
        for (let id in jsonData.nodes) {
            const node = jsonData.nodes[id];
            formattedNodes[id] = {
                id: id,
                name: node.name,
                title: node.title,
                description: node.description || '',
                properties: node.properties || {},
                children: node.children || []
            };
        }

        return {
            title: jsonData.title,
            description: jsonData.description || '',
            root: jsonData.root,
            nodes: formattedNodes
        };
    }

    loadTree(name, jsonData) {
        try {
            const tree = new b3.BehaviorTree();
            const formatted = this._formatDataForB3(jsonData);
            tree.load(formatted, this.nodeRegistry);
            this.trees[name] = tree;
        } catch (e) {
            this.initErrors.push(`Tree [${name}] parse failed: ${e.message}`);
        }
    }

    execute(treeName, unit, sim) {
        if (!this.trees[treeName]) return;
        if (!this.blackboards[unit.instanceId]) this.blackboards[unit.instanceId] = new b3.Blackboard();
        const blackboard = this.blackboards[unit.instanceId];
        blackboard.set('context', { unit, sim });
        this.trees[treeName].tick(unit, blackboard);
    }
}

module.exports = new BTManager();
