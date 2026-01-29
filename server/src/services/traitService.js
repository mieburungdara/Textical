const fs = require('fs');
const path = require('path');
const _ = require('lodash');

/**
 * Modular Traits Manager (v3.7 - Critical Safety)
 * Aggregates hooks and intelligently merges object results with null-safety.
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
        if (!actor) return null;

        // Safety: Ensure source parts are arrays
        const actorTraits = Array.isArray(actor.traits) ? actor.traits : [];
        const weaponTraits = Array.isArray(actor.weaponTraits) ? actor.weaponTraits : [];
        
        const sources = [
            ...actorTraits,
            actor.race,
            ...weaponTraits
        ];

        let result = null;
        const processed = new Set();

        sources.forEach(source => {
            if (!source) return;
            const traitKey = (typeof source === 'string') ? source.toLowerCase() : (source.name ? source.name.toLowerCase() : null);
            
            if (traitKey && !processed.has(traitKey)) {
                const traitDef = this.traits[traitKey];
                if (traitDef && typeof traitDef[hookName] === 'function') {
                    try {
                        const hookResult = traitDef[hookName](actor, ...args);
                        if (hookResult !== null && hookResult !== undefined) {
                            if (typeof hookResult === 'object' && !Array.isArray(hookResult)) {
                                result = _.merge(result || {}, hookResult);
                            } else {
                                result = hookResult;
                            }
                        }
                    } catch (e) {
                        console.error(`[TRAIT ERROR] Hook ${hookName} failed for trait ${traitKey}:`, e.message);
                    }
                }
                processed.add(traitKey);
            }
        });
        return result;
    }
}

module.exports = new TraitsManager();
