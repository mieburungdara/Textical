const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * Modular Traits Manager (v3.6 - AAA Multi-Merge)
 * Aggregates hooks and intelligently merges object results.
 */
class TraitsManager {
    constructor() {
        this.traits = {};
        this._loadTraits();
    }

    _loadTraits() {
        const definitionsPath = path.join(__dirname, '../logic/traits/definitions');
        if (!fs.existsSync(definitionsPath)) return;

        const files = fs.readdirSync(definitionsPath);
        files.forEach(file => {
            if (file.endsWith('.js')) {
                const TraitClass = require(path.join(definitionsPath, file));
                const traitInstance = new TraitClass();
                this.traits[traitInstance.name] = traitInstance;
            }
        });
    }

    executeHook(hookName, actor, ...args) {
        const sources = [
            ...(actor.traits || []),
            actor.race,
            ...(actor.weaponTraits || [])
        ];

        let result = null;
        const processed = new Set();

        sources.forEach(source => {
            if (!source) return;
            const traitKey = (typeof source === 'string') ? source.toLowerCase() : (source.name ? source.name.toLowerCase() : null);
            
            if (traitKey && !processed.has(traitKey)) {
                const traitDef = this.traits[traitKey];
                if (traitDef && typeof traitDef[hookName] === 'function') {
                    const hookResult = traitDef[hookName](actor, ...args);
                    
                    if (hookResult !== null && hookResult !== undefined) {
                        // AAA: Intelligent Result Merging
                        if (typeof hookResult === 'object' && !Array.isArray(hookResult)) {
                            result = _.merge(result || {}, hookResult);
                        } else {
                            result = hookResult; // Primitives (Boolean/String) take last non-null
                        }
                    }
                }
                processed.add(traitKey);
            }
        });
        return result;
    }
}

module.exports = new TraitsManager();