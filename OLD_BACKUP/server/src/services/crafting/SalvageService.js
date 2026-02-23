const BaseService = require('../BaseService');
const inventoryService = require('../inventoryService');
const resolver = require('../../logic/crafting/SalvageResolver');

/**
 * SalvageService
 * Orchestrates the dismantling of equipment into base materials.
 * Enhanced with Bulk Salvaging capabilities.
 */
class SalvageService extends BaseService {
    /**
     * Dismantles an item instance and returns materials.
     */
    async salvageItem(userId, itemInstanceId) {
        return this.bulkSalvage(userId, [itemInstanceId]);
    }

    /**
     * Dismantles multiple item instances in a single atomic transaction.
     * @param {number} userId - The user performing the action.
     * @param {Array<number>} itemInstanceIds - List of instance IDs to salvage.
     */
    async bulkSalvage(userId, itemInstanceIds) {
        if (!itemInstanceIds || itemInstanceIds.length === 0) {
            throw new Error("No items selected for salvage.");
        }

        const items = await this.db.inventoryItem.findMany({
            where: { id: { in: itemInstanceIds }, userId },
            include: { template: true, equippedIn: true, marketOrders: true }
        });

        if (items.length === 0) throw new Error("No valid items found.");

        const validItems = items.filter(item => {
            return !item.equippedIn && 
                   item.marketOrders.length === 0 && 
                   item.template.category !== "MATERIAL";
        });

        if (validItems.length === 0) {
            throw new Error("None of the selected items can be salvaged (Equipped, Listed, or Materials).");
        }

        // 1. Resolve all recipes needed
        const templateIds = [...new Set(validItems.map(i => i.templateId))];
        const recipes = await this.db.recipeTemplate.findMany({
            where: { resultItemId: { in: templateIds } },
            include: { ingredients: true }
        });

        // Map templateId -> recipe (prefer recipes with ingredients)
        const recipeMap = new Map();
        for (const r of recipes) {
            if (!recipeMap.has(r.resultItemId) || r.ingredients.length > 0) {
                recipeMap.set(r.resultItemId, r);
            }
        }
        
        // 2. Aggregate Returns
        const aggregatedReturns = new Map(); // templateId -> quantity

        for (const item of validItems) {
            const recipe = recipeMap.get(item.templateId);
            if (!recipe) continue;

            const returns = resolver.resolveReturns(recipe, item.quality);
            for (const ret of returns) {
                const current = aggregatedReturns.get(ret.templateId) || 0;
                aggregatedReturns.set(ret.templateId, current + ret.quantity);
            }
        }

        // 3. Atomic Execution
        return await this.runTransaction(async (tx) => {
            const validIds = validItems.map(i => i.id);

            // a. Destroy Items
            await tx.inventoryItem.deleteMany({
                where: { id: { in: validIds } }
            });

            // b. Add Materials (Aggregated)
            const summary = [];
            for (const [templateId, quantity] of aggregatedReturns.entries()) {
                await inventoryService.addItem(userId, templateId, quantity, tx);
                summary.push({ templateId, quantity });
            }

            this.log(`User ${userId} bulk-salvaged ${validItems.length} items. Recovered ${aggregatedReturns.size} material types.`, "Salvage");
            return { 
                count: validItems.length, 
                materials: summary 
            };
        });
    }

    /**
     * Automatically salvages all unequipped/unlisted items of a specific rarity.
     */
    async salvageByRarity(userId, rarity) {
        const items = await this.db.inventoryItem.findMany({
            where: { 
                userId, 
                template: { rarity: rarity, category: { not: "MATERIAL" } },
                equippedIn: null,
                marketOrders: { none: {} }
            }
        });

        if (items.length === 0) return { count: 0, materials: [] };

        return await this.bulkSalvage(userId, items.map(i => i.id));
    }
}

module.exports = new SalvageService();