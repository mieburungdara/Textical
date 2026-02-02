const BaseService = require('./BaseService');
const validator = require('./crafting/CraftingValidator');
const inventoryService = require('./inventoryService');
const vitalityService = require('./vitalityService');
const affixResolver = require('../logic/crafting/AffixResolver');

/**
 * CraftingService
 * Thin orchestrator for material refining and equipment production.
 * Enhanced with Magical Affixes (Catalysts).
 */
class CraftingService extends BaseService {
    constructor() {
        super();
        this.BASE_VITALITY_COST = 10;
    }

    async startCrafting(userId, recipeId, affixMaterialId = null) {
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

        // Optional: Check if affix material is owned
        if (affixMaterialId) {
            const hasAffix = await this.db.inventoryItem.findFirst({
                where: { userId, templateId: affixMaterialId, quantity: { gte: 1 } }
            });
            if (!hasAffix) throw new Error("Affix material not found in inventory.");
        }

        // 2. Resource Consumption
        return await this.runTransaction(async (tx) => {
            await vitalityService.consumeVitality(userId, this.BASE_VITALITY_COST);

            // Consume Recipe Ingredients
            for (const ing of recipe.ingredients) {
                await this._consumeItem(tx, userId, ing.itemId, ing.quantity);
            }

            // Consume Affix Material
            if (affixMaterialId) {
                await this._consumeItem(tx, userId, affixMaterialId, 1);
            }

            const now = new Date();
            const finishesAt = new Date(now.getTime() + (recipe.craftTimeSeconds * 1000));

            this.log(`Hero starting recipe ${recipe.name}${affixMaterialId ? ' with affix' : ''}`, "Crafting");
            return await tx.taskQueue.create({
                data: {
                    userId, type: "CRAFTING", targetItemId: recipe.resultItemId,
                    status: "RUNNING", startedAt: now, finishesAt: finishesAt,
                    affixMaterialId: affixMaterialId
                }
            });
        });
    }

    async _consumeItem(tx, userId, templateId, quantity) {
        const inv = await tx.inventoryItem.findFirst({
            where: { userId, templateId }
        });
        
        if (inv.quantity <= quantity) {
            await tx.inventoryItem.delete({ where: { id: inv.id } });
        } else {
            await tx.inventoryItem.update({
                where: { id: inv.id },
                data: { quantity: { decrement: quantity } }
            });
        }
    }

    async completeCrafting(userId, taskId) {
        const task = await this.db.taskQueue.findUnique({ where: { id: taskId } });
        if (!task || task.status !== "RUNNING") return;

        let traitId = null;
        if (task.affixMaterialId) {
            traitId = affixResolver.resolveTraitId(task.affixMaterialId);
        }

        return await this.runTransaction(async (tx) => {
            await inventoryService.addItem(userId, task.targetItemId, 1, tx, traitId);
            
            return await tx.taskQueue.update({ 
                where: { id: taskId }, 
                data: { status: "COMPLETED" } 
            });
        });
    }
}

module.exports = new CraftingService();