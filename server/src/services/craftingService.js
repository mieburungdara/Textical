const BaseService = require('./BaseService');
const validator = require('./crafting/CraftingValidator');
const inventoryService = require('./inventoryService');
const vitalityService = require('./vitalityService');

/**
 * CraftingService
 * Thin orchestrator for material refining and equipment production.
 */
class CraftingService extends BaseService {
    constructor() {
        super();
        this.BASE_VITALITY_COST = 10;
    }

    async startCrafting(userId, recipeId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { taskQueue: { where: { status: "RUNNING" } } }
        });

        const region = await this.db.regionTemplate.findUnique({ where: { id: user.currentRegion } });
        const recipe = await this.db.recipeTemplate.findUnique({
            where: { id: recipeId },
            include: { ingredients: { include: { item: true } } }
        });

        if (!user || !recipe) throw new Error("Invalid crafting request.");

        // 1. Validations
        validator.validateAvailability(user);
        validator.validateLocation(region);
        
        const hasSpace = await inventoryService.hasSpace(userId, recipe.resultItemId);
        if (!hasSpace) throw new Error("Inventory full.");

        await validator.checkMaterials(this.db, userId, recipe.ingredients);

        // 2. Resource Consumption
        return await this.runTransaction(async (tx) => {
            await vitalityService.consumeVitality(userId, this.BASE_VITALITY_COST);

            for (const ing of recipe.ingredients) {
                const inv = await tx.inventoryItem.findUnique({
                    where: { userId_templateId: { userId, templateId: ing.itemId } }
                });
                
                if (inv.quantity === ing.quantity) {
                    await tx.inventoryItem.delete({ where: { id: inv.id } });
                } else {
                    await tx.inventoryItem.update({
                        where: { userId_templateId: { userId, templateId: ing.itemId } },
                        data: { quantity: { decrement: ing.quantity } }
                    });
                }
            }

            const now = new Date();
            const finishesAt = new Date(now.getTime() + (recipe.craftTimeSeconds * 1000));

            this.log(`Hero starting recipe ${recipe.name}`, "Crafting");
            return await tx.taskQueue.create({
                data: {
                    userId, type: "CRAFTING", targetItemId: recipe.resultItemId,
                    status: "RUNNING", startedAt: now, finishesAt: finishesAt
                }
            });
        });
    }

    async completeCrafting(userId, taskId) {
        const task = await this.db.taskQueue.findUnique({ where: { id: taskId } });
        if (!task || task.status !== "RUNNING") return;

        await inventoryService.addItem(userId, task.targetItemId, 1);
        return await this.db.taskQueue.update({ where: { id: taskId }, data: { status: "COMPLETED" } });
    }
}

module.exports = new CraftingService();