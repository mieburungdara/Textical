const BaseService = require('../BaseService');
const inventoryService = require('../inventoryService');
const resolver = require('../../logic/crafting/SalvageResolver');

/**
 * SalvageService
 * Orchestrates the dismantling of equipment into base materials.
 */
class SalvageService extends BaseService {
    /**
     * Dismantles an item instance and returns materials.
     */
    async salvageItem(userId, itemInstanceId) {
        const item = await this.db.inventoryItem.findUnique({
            where: { id: itemInstanceId },
            include: { template: true, equippedIn: true, marketOrders: true }
        });

        if (!item || item.userId !== userId) throw new Error("Item not found.");
        if (item.equippedIn) throw new Error("Cannot salvage equipped items.");
        if (item.marketOrders.length > 0) throw new Error("Cannot salvage items listed on market.");
        if (item.template.category === "MATERIAL") throw new Error("Cannot salvage raw materials.");

        // 1. Find Recipe for this item
        const recipe = await this.db.recipeTemplate.findFirst({
            where: { resultItemId: item.templateId },
            include: { ingredients: true }
        });

        if (!recipe) throw new Error("No salvage data found for this item.");

        // 2. Resolve Returns
        const returns = resolver.resolveReturns(recipe, item.quality);

        // 3. Atomic Execution
        return await this.runTransaction(async (tx) => {
            // a. Destroy Item
            await tx.inventoryItem.delete({ where: { id: itemInstanceId } });

            // b. Add Materials
            const results = [];
            for (const mat of returns) {
                const added = await inventoryService.addItem(userId, mat.templateId, mat.quantity, tx);
                results.push({ templateId: mat.templateId, quantity: mat.quantity });
            }

            this.log(`User ${userId} salvaged ${item.template.name}. Recovered ${returns.length} material types.`, "Salvage");
            return { salvaged: item.template.name, materials: results };
        });
    }
}

module.exports = new SalvageService();
