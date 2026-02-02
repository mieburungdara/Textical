/**
 * AAA OracleProgressionResolver
 * Pure component for determining bot goals based on current state.
 */
class OracleProgressionResolver {
    constructor() {
        this.LEVEL_CAP = 100;
        this.SILVER_LOW_THRESHOLD = 500;
        this.INV_FULL_THRESHOLD = 15;
    }

    /**
     * Resolves the current "Main Goal" for a Super-Agent.
     * @param {Object} ctx - { level, silver, inventory, items, equipped }
     * @returns {string} GOAL (XP, GEAR, SILVER, TRAVEL)
     */
    resolveGoal(ctx) {
        // 1. Inventory Management First
        if (ctx.inventoryCount >= this.INV_FULL_THRESHOLD) {
            return "CLEAN_INV";
        }

        // 2. Financial Stability
        if (ctx.silver < this.SILVER_LOW_THRESHOLD) {
            return "EARN_SILVER";
        }

        // 3. Equipment Check
        const hasWeapon = ctx.items.some(i => i.equippedIn && (i.template.category === "EQUIPMENT" || i.template.category === "WEAPON"));
        if (!hasWeapon) {
            // Do we have materials to craft one? (Simplified: check for Iron)
            const hasIron = ctx.items.some(i => i.template.name.includes("Iron") && i.quantity >= 3);
            return hasIron ? "CRAFT_GEAR" : "GATHER_MATS";
        }

        // AAA: Tool Progression Check
        const pickaxe = ctx.items.find(i => i.equippedIn && i.template.category === "PICKAXE");
        const axe = ctx.items.find(i => i.equippedIn && i.template.category === "AXE");
        
        const needsPickaxeUpgrade = !pickaxe || pickaxe.template.toolTier < 1;
        const needsAxeUpgrade = !axe || axe.template.toolTier < 1;

        if (needsPickaxeUpgrade || needsAxeUpgrade) {
            const hasOre = ctx.items.some(i => i.template.name === "Iron Ore" && i.quantity >= 3);
            const hasWood = ctx.items.some(i => i.template.name === "Oak Wood" && i.quantity >= 2);
            return (hasOre && hasWood) ? "CRAFT_TOOL" : "GATHER_TOOL_MATS";
        }

        // 4. Level Progression
        if (ctx.level < this.LEVEL_CAP) {
            return "GRIND_XP";
        }

        return "IDLE";
    }

    /**
     * Maps a goal to a specific action based on the current region.
     */
    resolveActionForGoal(goal, region) {
        switch (goal) {
            case "CLEAN_INV":
                return "SELL";
            case "EARN_SILVER":
                return region.visualType === "TOWN" ? "HAUL" : "SELL";
            case "CRAFT_GEAR":
            case "CRAFT_TOOL":
                return "CRAFT";
            case "GATHER_MATS":
            case "GATHER_TOOL_MATS":
                return "GATHER";
            case "GRIND_XP":
                // If in red zone, we do combat. If in green, we gather (safe XP).
                return region.zoneType === "RED" ? "COMBAT" : "GATHER";
            default:
                return "IDLE";
        }
    }
}

module.exports = new OracleProgressionResolver();
