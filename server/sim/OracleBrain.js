const travelResolver = require('./OracleTravelResolver');
const progressionResolver = require('./OracleProgressionResolver');

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
        
        // 1. Resolve High-Level Goal
        const goal = progressionResolver.resolveGoal(ctx);
        const actionType = progressionResolver.resolveActionForGoal(goal, ctx.currentRegion, ctx);

        // 2. Override with Regional Awareness (Migration)
        // Only migrate if we aren't in the middle of a specific crafting/gathering loop
        if (goal === "IDLE" || goal === "GRIND_XP" || goal === "EARN_SILVER") {
            if (ctx.neighbors && ctx.neighbors.length > 0) {
                const migration = this._evaluateMigration(ctx);
                if (migration) return migration;
            }
        }

        // 3. Return combined decision object
        return { type: actionType, goal: goal };
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
