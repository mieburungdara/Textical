const fs = require('fs');
const path = require('path');

/**
 * Modular Traits Manager (v3.5 - Equipment Aware)
 * Orchestrates hooks for Intrinsic Traits, Racial Traits, and Weapon Traits.
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
        // AAA: Aggregate ALL potential trait sources
        // 1. Core Traits (from DB)
        // 2. Race Trait (Fallback/Identity)
        // 3. Weapon Traits (from Equipment)
        const sources = [
            ...(actor.traits || []),
            actor.race,
            ...(actor.weaponTraits || [])
        ];

        let result = null;
        const processed = new Set(); // Prevent duplicate trait triggers

        sources.forEach(source => {
            if (!source) return;
            const traitKey = (typeof source === 'string') ? source.toLowerCase() : (source.name ? source.name.toLowerCase() : null);
            
            if (traitKey && !processed.has(traitKey)) {
                const traitDef = this.traits[traitKey];
                if (traitDef && typeof traitDef[hookName] === 'function') {
                    const hookResult = traitDef[hookName](actor, ...args);
                    if (hookResult !== null && hookResult !== undefined) result = hookResult;
                }
                processed.add(traitKey);
            }
        });
        return result;
    }
}

module.exports = new TraitsManager();
