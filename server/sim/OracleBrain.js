/**
 * AAA BehaviorBrain
 * Pure logic component to decide bot actions based on status and archetype.
 */
class BehaviorBrain {
    /**
     * Decides the next action for a bot.
     * @param {Object} botContext - { archetype, vitality, silver, inventoryCount, items }
     * @returns {string} Action key: GATHER, CRAFT, SELL, HUNT, IDLE
     */
    decideAction(ctx) {
        if (ctx.vitality < 10) return "IDLE"; // Need rest

        // 0. AAA: Item Sink Pressure - Salvage if full
        if (ctx.inventoryCount >= 16) return "SALVAGE"; 

        switch (ctx.archetype) {
            case "GATHERER":
                if (ctx.inventoryCount >= 15) return "SELL";
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

module.exports = new BehaviorBrain();
