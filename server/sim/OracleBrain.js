const travelResolver = require('./OracleTravelResolver');

/**
 * AAA OracleBrain
 * Pure logic component for bot decision making.
 */
class OracleBrain {
    /**
     * Context: { archetype, vitality, silver, inventoryCount, items, currentRegion, neighbors }
     */
    decideAction(ctx) {
        if (ctx.vitality < 10) return "IDLE"; // Need rest

        // 0. AAA: Item Sink Pressure - Salvage if full
        if (ctx.inventoryCount >= 16) return "SALVAGE"; 

        // 1. AAA: Maintenance Pressure - Repair if broken
        const needsRepair = ctx.items.some(i => i.equippedIn && (i.currentDurability / i.maxDurability) < 0.3);
        if (needsRepair) return "REPAIR";

        // 2. AAA: Regional Migration Pressure
        if (ctx.neighbors && ctx.neighbors.length > 0) {
            const currentScore = travelResolver.scoreRegion(ctx.currentRegion, ctx.archetype);
            
            // Find best neighbor
            let bestNeighbor = null;
            let bestScore = -1;

            for (const n of ctx.neighbors) {
                const s = travelResolver.scoreRegion(n, ctx.archetype);
                if (s > bestScore) {
                    bestScore = s;
                    bestNeighbor = n;
                }
            }

            if (bestNeighbor && travelResolver.shouldMigrate(currentScore, bestScore)) {
                return { type: "TRAVEL", targetRegionId: bestNeighbor.id };
            }
        }

        switch (ctx.archetype) {
            case "GATHERER":
                // AAA: Incentive - Sell more often (50% capacity)
                if (ctx.inventoryCount >= 10) return "SELL"; 
                return "GATHER";

            case "CRAFTER":
                const hasIron = ctx.items.some(i => i.templateId === 2005 && i.quantity >= 3);
                if (hasIron) return "CRAFT";
                if (ctx.silver > 1000) return "BUY_MATERIALS";
                return "IDLE";

            case "WARRIOR":
                if (ctx.vitality > 50) return "HUNT";
                return "IDLE";

            case "OUTLAW":
                if (ctx.vitality > 30) return "PVP";
                return "IDLE";

            default:
                return "IDLE";
        }
    }
}

module.exports = new OracleBrain();
