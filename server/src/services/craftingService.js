const BaseService = require('./BaseService');
const validator = require('./crafting/CraftingValidator');
const inventoryService = require('./inventoryService');
const energyService = require('./energyService');
const affixResolver = require('../logic/crafting/AffixResolver');
const stationBuffResolver = require('../logic/crafting/StationBuffResolver');
const qualityResolver = require('../logic/crafting/QualityResolver');
const failResolver = require('../logic/crafting/CraftingFailResolver');
const AppError = require('../utils/AppError');
const ErrorCodes = require('../constants/ErrorCodes');

/**
 * CraftingService
 * Thin orchestrator for material refining and equipment production.
 * Enhanced with Magical Affixes, Regional Station Buffs, Item Quality Tiers, and Crafting Fail System.
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

        // 3. Crafting Fail System - Check if fail system applies
        let craftingOutcome = { outcome: 'SUCCESS', isSuccess: true };
        let profession = 'BLACKSMITH';
        
        if (recipe && recipe.resultItem) {
            const itemRarity = recipe.resultItem.rarity;
            
            // Check if fail system should apply (Epic/Legendary items)
            if (failResolver.shouldApplyFailSystem(itemRarity)) {
                // Determine profession from item category
                profession = failResolver.getProfessionFromCategory(recipe.resultItem.category);
                
                // Get or create crafting skill
                let skill = await this.db.craftingSkill.findUnique({
                    where: { userId_profession: { userId, profession } }
                });
                
                // Create skill if doesn't exist
                if (!skill) {
                    skill = await this.db.craftingSkill.create({
                        data: { userId, profession, rank: 'NOVICE', level: 1, experience: 0 }
                    });
                }
                
                // Calculate success rate
                const successRate = failResolver.calculateSuccessRate(skill);
                
                // Determine outcome
                craftingOutcome = failResolver.determineOutcome(successRate, skill);
                
                // Log the crafting attempt
                await this.db.craftingLog.create({
                    data: {
                        userId,
                        recipeId: recipe.id,
                        profession,
                        outcome: craftingOutcome.outcome,
                        itemRarity,
                        successRate,
                        rolled: craftingOutcome.roll
                    }
                });
                
                // Process skill progression
                const skillUpdate = failResolver.processOutcome(skill, craftingOutcome.isSuccess);
                await this.db.craftingSkill.update({
                    where: { id: skill.id },
                    data: skillUpdate
                });
                
                // Handle failure outcomes
                if (!craftingOutcome.isSuccess) {
                    this.log(`Crafting failed: ${craftingOutcome.outcome} - ${craftingOutcome.description}`, "Crafting");
                    
                    switch (craftingOutcome.outcome) {
                        case 'SAFE_FAIL':
                            // Materials already consumed, just mark task as completed with failure
                            await this.db.taskQueue.update({ 
                                where: { id: taskId }, 
                                data: { status: "COMPLETED" } 
                            });
                            return {
                                success: false,
                                outcome: 'SAFE_FAIL',
                                message: 'Crafting failed. Materials lost, item not created.',
                                skill: skillUpdate
                            };
                            
                        case 'QUALITY_DROP':
                            // Apply quality drop but still create item
                            powerScale = failResolver.calculateQualityDrop(powerScale);
                            // Downgrade quality
                            const qualityMap = { 'LEGENDARY': 'EPIC', 'EPIC': 'RARE', 'RARE': 'UNCOMMON', 'UNCOMMON': 'COMMON' };
                            quality = qualityMap[quality] || quality;
                            break;
                            
                        case 'DESTROYED':
                            // Item destroyed - same as safe fail for now (no item created)
                            await this.db.taskQueue.update({ 
                                where: { id: taskId }, 
                                data: { status: "COMPLETED" } 
                            });
                            return {
                                success: false,
                                outcome: 'DESTROYED',
                                message: 'Crafting failed catastrophically. Item destroyed!',
                                skill: skillUpdate
                            };
                            
                        case 'CATASTROPHIC':
                            // Catastrophic failure - item not created
                            await this.db.taskQueue.update({ 
                                where: { id: taskId }, 
                                data: { status: "COMPLETED" } 
                            });
                            return {
                                success: false,
                                outcome: 'CATASTROPHIC',
                                message: 'CATASTROPHIC FAILURE! All materials lost!',
                                skill: skillUpdate
                            };
                    }
                }
            }
        }

        return await this.runTransaction(async (tx) => {
            await inventoryService.addItem(userId, task.targetItemId, 1, tx, { 
                traitId, 
                quality, 
                powerScale 
            });
            
            const updatedTask = await tx.taskQueue.update({ 
                where: { id: taskId }, 
                data: { status: "COMPLETED" } 
            });
            
            return {
                ...updatedTask,
                success: true,
                outcome: craftingOutcome.outcome,
                quality,
                powerScale
            };
        });
    }
    
    /**
     * Get user's crafting skill for a profession
     * @param {number} userId 
     * @param {string} profession 
     */
    async getCraftingSkill(userId, profession) {
        const skill = await this.db.craftingSkill.findUnique({
            where: { userId_profession: { userId, profession } }
        });
        
        if (!skill) {
            return {
                profession,
                rank: 'NOVICE',
                level: 1,
                experience: 0,
                totalCrafts: 0,
                successCount: 0,
                failCount: 0,
                successRate: failResolver.calculateSuccessRate(null)
            };
        }
        
        return {
            ...skill,
            successRate: failResolver.calculateSuccessRate(skill)
        };
    }
    
    /**
     * Get all crafting skills for a user
     * @param {number} userId 
     */
    async getAllCraftingSkills(userId) {
        const skills = await this.db.craftingSkill.findMany({
            where: { userId }
        });
        
        return skills.map(skill => ({
            ...skill,
            successRate: failResolver.calculateSuccessRate(skill)
        }));
    }
    
    /**
     * Get success rate preview for a recipe
     * @param {number} userId 
     * @param {number} recipeId 
     */
    async getCraftingSuccessRate(userId, recipeId) {
        const recipe = await this.db.recipeTemplate.findUnique({
            where: { id: recipeId },
            include: { resultItem: true }
        });
        
        if (!recipe || !recipe.resultItem) {
            return null;
        }
        
        const itemRarity = recipe.resultItem.rarity;
        const applyFailSystem = failResolver.shouldApplyFailSystem(itemRarity);
        
        if (!applyFailSystem) {
            return {
                applies: false,
                message: 'Fail system does not apply to this item rarity',
                successRate: 1.0
            };
        }
        
        const profession = failResolver.getProfessionFromCategory(recipe.resultItem.category);
        const skill = await this.db.craftingSkill.findUnique({
            where: { userId_profession: { userId, profession } }
        });
        
        return {
            applies: true,
            profession,
            itemRarity,
            ...failResolver.getSuccessRateInfo(skill)
        };
    }
}

module.exports = new CraftingService();