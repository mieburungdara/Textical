const b3 = require('behavior3js');
const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Configure logger
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.simple(),
    transports: [new winston.transports.Console()]
});

class BTManager {
    constructor() {
        this.trees = {};
        this.blackboards = {};
        this.initErrors = [];
        this.nodeRegistry = this._initializeNodeRegistry();
        this._loadAllTrees();
    }

    /**
     * Initialize node registry by dynamically loading all nodes from specified directories
     * @returns {Object} Node registry mapping node names to their implementations
     */
    _initializeNodeRegistry() {
        const registry = {
            'Priority': b3.Priority,
            'Sequence': b3.Sequence,
            'MemSequence': b3.MemSequence,
            'Inverter': b3.Inverter,
            'MemPriority': b3.MemPriority
        };

        const conditionsDir = path.join(__dirname, 'nodes', 'conditions');
        const actionsDir = path.join(__dirname, 'nodes', 'actions');

        // Load condition nodes
        try {
            const conditionFiles = fs.readdirSync(conditionsDir).filter(f => f.endsWith('.js'));
            conditionFiles.forEach(file => {
                const nodeName = path.basename(file, '.js');
                const nodePath = path.join(conditionsDir, file);
                registry[nodeName] = require(nodePath);
            });
        } catch (e) {
            const errorMsg = `Failed to load condition nodes: ${e.message}`;
            this.initErrors.push(errorMsg);
            logger.error(errorMsg);
        }

        // Load action nodes
        try {
            const actionFiles = fs.readdirSync(actionsDir).filter(f => f.endsWith('.js'));
            actionFiles.forEach(file => {
                const nodeName = path.basename(file, '.js');
                const nodePath = path.join(actionsDir, file);
                registry[nodeName] = require(nodePath);
            });
        } catch (e) {
            const errorMsg = `Failed to load action nodes: ${e.message}`;
            this.initErrors.push(errorMsg);
            logger.error(errorMsg);
        }

        logger.info(`Node registry initialized with ${Object.keys(registry).length} nodes`);
        return registry;
    }

    /**
     * Load all behavior trees from JSON files in the current directory
     */
    _loadAllTrees() {
        const btDir = __dirname;
        try {
            const files = fs.readdirSync(btDir).filter(f => f.endsWith('.json'));
            files.forEach(file => {
                const name = path.basename(file, '.json');
                const data = JSON.parse(fs.readFileSync(path.join(btDir, file), 'utf8'));
                this.loadTree(name, data);
            });
            logger.info(`Loaded ${Object.keys(this.trees).length} behavior trees`);
        } catch (e) {
            const errorMsg = `Registry load failed: ${e.message}`;
            this.initErrors.push(errorMsg);
            logger.error(errorMsg);
        }
    }

    /**
     * Convert Master-Detail JSON into behavior3js internal format
     * @param {Object} jsonData - Raw JSON data from behavior tree file
     * @returns {Object} Formatted data suitable for behavior3js
     */
    _formatDataForB3(jsonData) {
        const formattedNodes = {};
        
        for (let id in jsonData.nodes) {
            const node = jsonData.nodes[id];
            
            // Validate node structure
            if (!node.name) {
                const errorMsg = `Node ${id} missing 'name' property`;
                this.initErrors.push(errorMsg);
                logger.error(errorMsg);
                continue;
            }

            formattedNodes[id] = {
                id: id,
                name: node.name,
                title: node.title || node.name,
                description: node.description || '',
                properties: node.properties || {},
                children: node.children || []
            };
        }

        // Validate root node exists
        if (!jsonData.root || !formattedNodes[jsonData.root]) {
            const errorMsg = 'Behavior tree missing valid root node';
            this.initErrors.push(errorMsg);
            logger.error(errorMsg);
        }

        return {
            title: jsonData.title,
            description: jsonData.description || '',
            root: jsonData.root,
            nodes: formattedNodes
        };
    }

    /**
     * Load a behavior tree from JSON data
     * @param {string} name - Tree name
     * @param {Object} jsonData - Raw JSON data
     */
    loadTree(name, jsonData) {
        try {
            const tree = new b3.BehaviorTree();
            const formatted = this._formatDataForB3(jsonData);
            tree.load(formatted, this.nodeRegistry);
            this.trees[name] = tree;
            logger.debug(`Loaded behavior tree: ${name}`);
        } catch (e) {
            const errorMsg = `Tree [${name}] parse failed: ${e.message}`;
            this.initErrors.push(errorMsg);
            logger.error(errorMsg);
        }
    }

    /**
     * Remove a behavior tree from the manager
     * @param {string} treeName - Name of the tree to remove
     * @returns {boolean} True if tree was removed successfully
     */
    removeTree(treeName) {
        if (this.trees[treeName]) {
            delete this.trees[treeName];
            logger.info(`Removed behavior tree: ${treeName}`);
            return true;
        }
        logger.warn(`Attempted to remove non-existent tree: ${treeName}`);
        return false;
    }

    /**
     * Reload a behavior tree from JSON data
     * @param {string} treeName - Name of the tree to reload
     * @param {Object} jsonData - Raw JSON data
     */
    reloadTree(treeName, jsonData) {
        this.removeTree(treeName);
        this.loadTree(treeName, jsonData);
        logger.info(`Reloaded behavior tree: ${treeName}`);
    }

    /**
     * Execute a behavior tree for a specific unit
     * @param {string} treeName - Name of the tree to execute
     * @param {Object} unit - Unit executing the tree
     * @param {Object} sim - Simulation context
     */
    execute(treeName, unit, sim) {
        // Validate inputs
        if (!treeName || typeof treeName !== 'string') {
            logger.error('Invalid treeName: must be a string');
            return;
        }

        if (!this.trees[treeName]) {
            logger.error(`Behavior tree not found: ${treeName}`);
            return;
        }

        if (!unit || !unit.instanceId) {
            logger.error('Invalid unit: must have instanceId property');
            return;
        }

        if (!sim) {
            logger.error('Invalid sim: simulation context is required');
            return;
        }

        // Initialize blackboard if it doesn't exist
        if (!this.blackboards[unit.instanceId]) {
            this.blackboards[unit.instanceId] = new b3.Blackboard();
            logger.debug(`Created blackboard for unit: ${unit.instanceId}`);
        }

        const blackboard = this.blackboards[unit.instanceId];
        blackboard.set('context', { unit, sim });

        try {
            this.trees[treeName].tick(unit, blackboard);
        } catch (e) {
            logger.error(`Error executing tree ${treeName} for unit ${unit.instanceId}: ${e.message}`);
        }
    }

    /**
     * Clear the blackboard for a specific unit
     * @param {string} unitInstanceId - Instance ID of the unit
     * @returns {boolean} True if blackboard was cleared successfully
     */
    clearBlackboard(unitInstanceId) {
        if (this.blackboards[unitInstanceId]) {
            delete this.blackboards[unitInstanceId];
            logger.debug(`Cleared blackboard for unit: ${unitInstanceId}`);
            return true;
        }
        logger.warn(`Attempted to clear non-existent blackboard: ${unitInstanceId}`);
        return false;
    }

    /**
     * Clear all blackboards from the manager
     * @returns {number} Number of blackboards cleared
     */
    clearAllBlackboards() {
        const count = Object.keys(this.blackboards).length;
        this.blackboards = {};
        logger.info(`Cleared all ${count} blackboards`);
        return count;
    }

    /**
     * Get all initialized behavior trees
     * @returns {Array} List of tree names
     */
    getTreeNames() {
        return Object.keys(this.trees);
    }

    /**
     * Get a specific behavior tree
     * @param {string} treeName - Name of the tree
     * @returns {b3.BehaviorTree|undefined} Behavior tree instance or undefined if not found
     */
    getTree(treeName) {
        return this.trees[treeName];
    }

    /**
     * Get initialization errors
     * @returns {Array} List of error messages
     */
    getInitErrors() {
        return [...this.initErrors];
    }

    /**
     * Check if there were any initialization errors
     * @returns {boolean} True if there are initialization errors
     */
    hasInitErrors() {
        return this.initErrors.length > 0;
    }
}

module.exports = new BTManager();
