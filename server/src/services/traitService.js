const fs = require('fs');
const path = require('path');

/**
 * Modular Traits Manager
 * Automatically loads all trait definitions from the logic/traits/definitions folder.
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
                console.log(`[TRAITS] Loaded: ${traitInstance.name}`);
            }
        });
    }

    executeHook(hookName, actor, ...args) {
        // Support multiple traits per unit. Fallback to race if traits not defined.
        const traits = actor.traits || [actor.race];
        let result = null;

        traits.forEach(trait => {
            const traitKey = (typeof trait === 'string') ? trait.toLowerCase() : trait.name.toLowerCase();
            const traitDef = this.traits[traitKey];
            
            if (traitDef && typeof traitDef[hookName] === 'function') {
                const hookResult = traitDef[hookName](actor, ...args);
                // If any hook returns a non-null value (e.g. death cancel), capture it
                if (hookResult !== null && hookResult !== undefined) result = hookResult;
            }
        });
        return result;
    }
}

module.exports = new TraitsManager();