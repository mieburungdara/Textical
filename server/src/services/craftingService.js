const BaseService = require('./BaseService');
const validator = require('./crafting/CraftingValidator');
const inventoryService = require('./inventoryService');
const energyService = require('./energyService');
const affixResolver = require('../logic/crafting/AffixResolver');
const stationBuffResolver = require('../logic/crafting/StationBuffResolver');
const qualityResolver = require('../logic/crafting/QualityResolver');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../constants/ErrorCodes');

/**
 * CraftingService
 * Thin orchestrator for material refining and equipment production.
 * Enhanced with Magical Affixes, Regional Station Buffs, and Item Quality Tiers.
 */
class CraftingService extends BaseService {
    constructor() {
        super();
        this.BASE_ENERGY_COST = 10;
    }

    async startCrafting(userId, recipeId, affixMaterialId = null) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { taskQueue: { where: { status: "RUNNING" } }, heroes: { where: { isMain: true } } }
        });

        const region = await this.db.regionTemplate.findUnique({ where: { id: user.currentRegion } });
        const recipe = await this.db.recipeTemplate.findUnique({
            where: { id: recipeId },
            include: { 
                ingredients: { include: { item: true }, orderBy: { quantity: 'desc' } },
                resultItem: true
            } 
        });

        if (!user || !recipe) {
            throw new AppError(ErrorCodes.CRAFTING_INVALID_REQUEST, 'Invalid crafting request.');
        }

        // 1. Validations
        validator.validateAvailability(user);
        validator.validateLocation(region);
        
        const hasSpace = await inventoryService.hasSpace(userId, recipe.resultItemId);
        if (!hasSpace) {
            throw new AppError(ErrorCodes.INVENTORY_FULL, 'Inventory full.');
        }

        await validator.checkMaterials(this.db, userId, recipe.ingredients);

        // Optional: Check if affix material is owned
        if (affixMaterialId) {
            const hasAffix = await this.db.inventoryItem.findFirst({
                where: { userId, templateId: affixMaterialId, quantity: { gte: 1 } }
            });
            if (!hasAffix) {
                throw new AppError(ErrorCodes.CRAFTING_AFFIX_MATERIAL_NOT_FOUND, 'Affix material not found in inventory.');
            }
        }

        // --- AAA: Regional Station Buffs ---
        let speedMult = 1.0;
        
        // 1. Resource Abundance Buff
        if (recipe.ingredients.length > 0) {
            const primaryIngredientId = recipe.ingredients[0].itemId;
            const stats = await this.db.regionalExtractionStats.findUnique({
                where: { regionId_templateId: { regionId: user.currentRegion, templateId: primaryIngredientId } }
            });
            speedMult *= stationBuffResolver.resolveResourceBuff(stats ? stats.volume24h : 0);
        }

        // 2. Specialized Station Buff
        const workshopBuffs = stationBuffResolver.resolveStationBuffs(region.specialization, recipe.resultItem.category);
        speedMult *= workshopBuffs.speedMult;

        // 2. Resource Consumption
        return await this.runTransaction(async (tx) => {
            await energyService.consumeEnergy(userId, this.BASE_ENERGY_COST);

            // Consume Recipe Ingredients
            for (const ing of recipe.ingredients) {
                await this._consumeItem(tx, userId, ing.itemId, ing.quantity);
            }

            // Consume Affix Material
            if (affixMaterialId) {
                await this._consumeItem(tx, userId, affixMaterialId, 1);
            }

            const now = new Date();
            const duration = Math.floor(recipe.craftTimeSeconds * speedMult);
            const finishesAt = new Date(now.getTime() + (duration * 1000));

            this.log(`Hero starting recipe ${recipe.name}${affixMaterialId ? ' with affix' : ''}. Regional Speed: ${((1 - speedMult) * 100).toFixed(0)}% boost.`, "Crafting");
            return await tx.taskQueue.create({
                data: {
                    userId, type: "CRAFTING", targetItemId: recipe.resultItemId,
                    status: "RUNNING", startedAt: now, finishesAt: finishesAt,
                    affixMaterialId: affixMaterialId,
                    heroId: user.heroes[0] ? user.heroes[0].id : null // Store crafter ID if possible
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
        const task = await this.db.taskQueue.findUnique({ 
            where: { id: taskId },
            include: { user: { include: { heroes: { where: { isMain: true } } } }, targetItem: { include: { ingredients: { orderBy: { quantity: 'desc' } } } } }
        });
        if (!task || task.status !== "RUNNING") return;

        // 1. Resolve Affix Trait
        let traitId = null;
        if (task.affixMaterialId) {
            traitId = affixResolver.resolveTraitId(task.affixMaterialId);
        }

        // 2. Resolve Quality (AAA Integration)
        let quality = "COMMON";
        let powerScale = 1.0;

        const mainHero = task.user.heroes[0];
        const heroLevel = mainHero ? mainHero.unitLevel : 1;

        // Find primary ingredient volume
        const recipe = await this.db.recipeTemplate.findFirst({
            where: { resultItemId: task.targetItemId },
            include: { 
                ingredients: { orderBy: { quantity: 'desc' } },
                resultItem: true
            }
        });

        let regionalVolume = 0;
        let workshopBuffs = { qualityLuck: 0 };

        if (recipe && recipe.ingredients.length > 0) {
            const stats = await this.db.regionalExtractionStats.findUnique({
                where: { regionId_templateId: { regionId: task.user.currentRegion, templateId: recipe.ingredients[0].itemId } }
            });
            regionalVolume = stats ? stats.volume24h : 0;

            // Fetch regional specialization for luck
            const region = await this.db.regionTemplate.findUnique({ where: { id: task.user.currentRegion } });
            workshopBuffs = stationBuffResolver.resolveStationBuffs(region.specialization, recipe.resultItem.category);
        }

        const qualityResult = qualityResolver.resolve(heroLevel, regionalVolume, workshopBuffs.qualityLuck);
        quality = qualityResult.quality;
        powerScale = qualityResult.powerScale;

        return await this.runTransaction(async (tx) => {
            await inventoryService.addItem(userId, task.targetItemId, 1, tx, { 
                traitId, 
                quality, 
                powerScale 
            });
            
            return await tx.taskQueue.update({ 
                where: { id: taskId }, 
                data: { status: "COMPLETED" } 
            });
        });
    }
}

module.exports = new CraftingService();