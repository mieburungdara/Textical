const prisma = require('../db');

const vitalityService = require('./vitalityService');
const inventoryService = require('./inventoryService');

class CraftingService {
    constructor() {
        this.BASE_CRAFTING_VITALITY_COST = 10;
    }

    async startCrafting(userId, recipeId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { 
                taskQueue: { where: { status: "RUNNING" } },
                recipes: { where: { recipeId: recipeId } }
            }
        });

        if (user.taskQueue.length > 0) throw new Error("You are too busy to start crafting right now.");

        const region = await prisma.regionTemplate.findUnique({ where: { id: user.currentRegion } });
        if (!region || region.type !== "TOWN") throw new Error("Town-only.");
        
        const recipe = await prisma.recipeTemplate.findUnique({
            where: { id: recipeId },
            include: { ingredients: true }
        });

        // Unified Slot Check
        const hasSpace = await inventoryService.hasSpace(userId, recipe.resultItemId);
        if (!hasSpace) throw new Error("Inventory full.");

        for (const ingredient of recipe.ingredients) {
            const inv = await prisma.inventoryItem.findFirst({
                where: { 
                    userId, 
                    templateId: ingredient.itemId,
                    marketListing: null, // NOT LISTED
                    equippedIn: null     // NOT EQUIPPED
                }
            });
            if (!inv || inv.quantity < ingredient.quantity) throw new Error(`Missing materials: ${ingredient.item.name}. (Check if items are equipped or listed on market)`);
        }

        await vitalityService.consumeVitality(userId, this.BASE_CRAFTING_VITALITY_COST);
        
        for (const ing of recipe.ingredients) {
            const inv = await prisma.inventoryItem.findUnique({
                where: { userId_templateId: { userId, templateId: ing.itemId } }
            });
            
            if (inv.quantity === ing.quantity) {
                await prisma.inventoryItem.delete({
                    where: { id: inv.id }
                });
            } else {
                await prisma.inventoryItem.update({
                    where: { userId_templateId: { userId, templateId: ing.itemId } },
                    data: { quantity: { decrement: ing.quantity } }
                });
            }
        }

        const now = new Date();
        const finishesAt = new Date(now.getTime() + (recipe.craftTimeSeconds * 1000));

        return await prisma.taskQueue.create({
            data: {
                userId, type: "CRAFTING", targetItemId: recipe.resultItemId,
                status: "RUNNING", startedAt: now, finishesAt: finishesAt
            }
        });
    }

    async completeCrafting(userId, taskId) {
        const task = await prisma.taskQueue.findUnique({ where: { id: taskId } });
        if (!task || task.status !== "RUNNING") return;

        // Unified Item Addition
        await inventoryService.addItem(userId, task.targetItemId, 1);

        return await prisma.taskQueue.update({
            where: { id: taskId },
            data: { status: "COMPLETED" }
        });
    }
}

module.exports = new CraftingService();
