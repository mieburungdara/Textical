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

        // 3. Tool Progression Check (Priority 1: Need tools to get gear mats)
        const pickaxe = ctx.items.find(i => i.equippedIn && i.template.category === "PICKAXE");
        const axe = ctx.items.find(i => i.equippedIn && i.template.category === "AXE");
        
        const needsPickaxeUpgrade = !pickaxe || pickaxe.template.toolTier < 1;
        const needsAxeUpgrade = !axe || axe.template.toolTier < 1;

        if (needsPickaxeUpgrade || needsAxeUpgrade) {
            const hasOre = ctx.items.some(i => i.template.name === "Iron Ore" && i.quantity >= 3);
            const hasWood = ctx.items.some(i => i.template.name === "Oak Wood" && i.quantity >= 2);
            return (hasOre && hasWood) ? "CRAFT_TOOL" : "GATHER_TOOL_MATS";
        }

        // 4. Equipment Check (Priority 2: Combat Survival)
        const weapon = ctx.items.find(i => i.equippedIn && (i.template.category === "EQUIPMENT" || i.template.category === "WEAPON"));
        const body = ctx.items.find(i => i.equippedIn && (i.template.category === "ARMOR" && i.template.name.includes("Plate")));
        const boots = ctx.items.find(i => i.equippedIn && (i.template.name.includes("Boots")));

        if (!weapon || !body || !boots) {
            // Check for materials for missing gear
            const hasOre = ctx.items.some(i => i.template.name === "Iron Ore" && i.quantity >= 5);
            const hasWood = ctx.items.some(i => i.template.name === "Oak Wood" && i.quantity >= 2);
            const hasHide = ctx.items.some(i => (i.template.name === "Boar Skin" || i.template.name === "Ragged Hide") && i.quantity >= 4);
            
            const hasMats = hasOre && hasWood && hasHide;
            return hasMats ? "CRAFT_GEAR" : "GATHER_GEAR_MATS";
        }

        // 5. Level Progression
        if (ctx.level < this.LEVEL_CAP) {
            return "GRIND_XP";
        }

        return "IDLE";
    }

    /**
     * Maps a goal to a specific action based on the current region.
     */
    resolveActionForGoal(goal, region, ctx) {
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
            case "GATHER_GEAR_MATS":
                // If we need hide/skin, we must hunt.
                const hasHide = ctx.items.some(i => (i.template.name === "Boar Skin" || i.template.name === "Ragged Hide") && i.quantity >= 4);
                return !hasHide ? "HUNT" : "GATHER";
            case "GRIND_XP":
                // If in red zone, we do combat. If in green, we gather (safe XP).
                return region.zoneType === "RED" ? "COMBAT" : "GATHER";
            default:
                return "IDLE";
        }
    }
}

module.exports = new OracleProgressionResolver();