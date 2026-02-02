const travelResolver = require('./OracleTravelResolver');

/**
 * AAA OracleBrain (Professional Version)
 * Sophisticated state machine for simulating full hero progression.
 */
class OracleBrain {
    /**
     * Context: { 
     *   archetype, vitality, silver, inventoryCount, items, 
     *   currentRegion, neighbors, unitLevel 
     * }
     */
    decideAction(ctx) {
        // 0. Vitality & Maintenance (Highest Priority)
        if (ctx.vitality < 15) return "IDLE"; 
        
        // Repair equipment if any equipped item is nearly broken (<20%)
        const needsRepair = ctx.items.some(i => i.equippedIn && (i.currentDurability / i.maxDurability) < 0.2);
        if (needsRepair && ctx.silver > 500) return "REPAIR";

        // Inventory Management
        if (ctx.inventoryCount >= 18) return "SALVAGE"; 

        // 1. Regional Awareness (Migration)
        if (ctx.neighbors && ctx.neighbors.length > 0) {
            const decision = this._evaluateMigration(ctx);
            if (decision) return decision;
        }

        // 2. Progression-Based State Machine
        
        // STAGE 1: NOVICE (Level 1-10)
        if (ctx.unitLevel < 10) {
            return this._noviceBehavior(ctx);
        }

        // STAGE 2: ADVENTURER (Level 10-30)
        if (ctx.unitLevel < 30) {
            return this._adventurerBehavior(ctx);
        }

        // STAGE 3: ELITE (Level 30+)
        return this._eliteBehavior(ctx);
    }

    _noviceBehavior(ctx) {
        // Novices need to HUNT to level up!
        if (ctx.vitality > 40) return "HUNT";

        // Gather resources to sell or craft
        if (ctx.inventoryCount > 10) return "SELL";
        
        const iron = ctx.items.find(i => i.templateId === 2005);
        if (iron && iron.quantity >= 10) return "CRAFT";

        return "GATHER";
    }

    _adventurerBehavior(ctx) {
        if (ctx.vitality > 60) return "HUNT"; 
        if (ctx.inventoryCount > 12) return "SELL";

        const materials = ctx.items.filter(i => i.template.category === "MATERIAL");
        if (materials.length > 5) return "CRAFT";

        return "GATHER";
    }

    _eliteBehavior(ctx) {
        if (ctx.currentRegion.zoneType === "RED" && ctx.vitality > 50) {
            return "PVP"; 
        }

        if (ctx.silver >= 2000 && ctx.vitality > 70) {
            return "CARAVAN";
        }

        if (ctx.vitality > 40) return "HUNT";

        return "SELL";
    }

    _evaluateMigration(ctx) {
        const currentScore = travelResolver.scoreRegion(ctx.currentRegion, ctx.archetype);
        
        let bestNeighbor = null;
        let bestScore = -1;

        for (const n of ctx.neighbors) {
            let s = travelResolver.scoreRegion(n, ctx.archetype);
            
            if (ctx.unitLevel >= 30 && n.zoneType === "RED") s += 100;
            if (ctx.unitLevel < 10 && n.zoneType === "RED") s -= 200;

            if (s > bestScore) {
                bestScore = s;
                bestNeighbor = n;
            }
        }

        if (bestNeighbor && travelResolver.shouldMigrate(currentScore, bestScore)) {
            return { type: "TRAVEL", targetRegionId: bestNeighbor.id };
        }

        return null;
    }
}

module.exports = new OracleBrain();
