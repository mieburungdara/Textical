const BaseTrait = require('../BaseTrait');

/**
 * Opportunist Trait
 * Increases Hit Chance and Critical Hit Chance when attacking from the side or back.
 */
class OpportunistTrait extends BaseTrait {
    constructor() {
        super('opportunist');
    }

    _getRelPos(attacker, defender) {
        const from = defender.gridPos;
        const to = attacker.gridPos;
        const dx = to.x - from.x;
        const dy = to.y - from.y;
        
        let dirToAttacker;
        if (Math.abs(dx) > Math.abs(dy)) {
            dirToAttacker = dx > 0 ? "EAST" : "WEST";
        } else {
            dirToAttacker = dy > 0 ? "SOUTH" : "NORTH";
        }

        if (dirToAttacker === defender.facing) return "FRONT";
        
        const opposite = { "NORTH": "SOUTH", "SOUTH": "NORTH", "EAST": "WEST", "WEST": "EAST" };
        if (dirToAttacker === opposite[defender.facing]) return "BACK";
        
        return "SIDE";
    }

    _getBonus(attacker) {
        const traitObj = attacker.traits.find(t => 
            (typeof t === 'string' && t.toLowerCase() === 'opportunist') || 
            (t && t.name && t.name.toLowerCase() === 'opportunist')
        );
        const level = (traitObj && typeof traitObj === 'object') ? (traitObj.level || 1) : 1;

        // Tiering: Lv1 (+10), Lv2 (+25), Lv3 (+50)
        const bonusMapping = { 1: 10, 2: 25, 3: 50 };
        return bonusMapping[level] || 10;
    }

    onCalculateHitChance(attacker, sim, defender) {
        if (!defender) return {};
        const relPos = this._getRelPos(attacker, defender);
        
        if (relPos === "SIDE" || relPos === "BACK") {
            const bonus = this._getBonus(attacker);
            return { hitChanceMod: bonus };
        }
        return {};
    }

    onCalculateCrit(attacker, sim, defender) {
        if (!defender) return {};
        const relPos = this._getRelPos(attacker, defender);
        
        if (relPos === "SIDE" || relPos === "BACK") {
            const bonus = this._getBonus(attacker);
            // Convert bonus to decimal for crit chance (e.g. 10 -> 0.10)
            return { critChanceMod: bonus / 100 };
        }
        return {};
    }
}

module.exports = OpportunistTrait;
