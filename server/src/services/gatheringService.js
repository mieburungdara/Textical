const BaseService = require('./BaseService');
const validator = require('./gathering/GatheringValidator');
const calculator = require('./gathering/DurationCalculator');
const inventoryService = require('./inventoryService');
const statService = require('./statService');
const vitalityService = require('./vitalityService');
const worldSpawner = require('./worldSpawnerService');

/**
 * GatheringService
 * Thin orchestrator for resource harvesting.
 * Delegating logic to Validator, Calculator, and WorldSpawner components.
 */
class GatheringService extends BaseService {
    constructor() {
        super();
        this.BASE_VITALITY_COST = 3;
    }

    async startGathering(userId, heroId, regionResourceId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { taskQueue: { where: { status: "RUNNING" } } }
        });

        const hero = await this.db.hero.findUnique({ where: { id: heroId } });
        
        // AAA: Resolve resource via WorldSpawner (supports dynamic injections)
        const availableResources = await worldSpawner.getAvailableResources(user.currentRegion);
        const resource = availableResources.find(r => r.id === regionResourceId || `event_${r.id}` === regionResourceId);

        if (!user || !hero || !resource) throw new Error("Resource not available in this region.");

        // 1. Core Validations
        validator.validateOwnership(hero, userId);
        validator.validateAvailability(user);
        
        const hasSpace = await inventoryService.hasSpace(userId, resource.templateId);
        if (!hasSpace) throw new Error("Inventory full.");

        // 2. Context Determination
        const { context, isToolRequired } = this._getHarvestContext(resource.templateId);

        // 3. Fetch Contextual Stats
        const heroStats = await statService.calculateHeroStats(heroId, context);
        let duration = 0;

        // Fetch full template for hardness/requirements
        const template = await this.db.itemTemplate.findUnique({ where: { id: resource.templateId } });

        if (!isToolRequired) {
            duration = await this._handleManualHarvest(heroId, resource, heroStats, context);
        } else {
            duration = await this._handleToolHarvest(heroId, resource, template, heroStats, context);
        }

        // 4. Finalize Task
        await vitalityService.consumeVitality(userId, this.BASE_VITALITY_COST);
        const now = new Date();
        const finishesAt = new Date(now.getTime() + (duration * 1000));

        return await this.db.taskQueue.create({
            data: {
                userId, heroId, type: "GATHERING", targetItemId: resource.templateId,
                status: "RUNNING", startedAt: now, finishesAt: finishesAt
            }
        });
    }

    async _handleManualHarvest(heroId, resource, heroStats, context) {
        let statValue = (context === "HERBALISM") ? heroStats.attributes.int : heroStats.attributes.dex;
        
        const toolCategory = (context === "HERBALISM") ? "HERBALISM_SICKLE" : "FISHING_ROD";
        const tool = await this.db.heroEquipment.findFirst({
            where: { heroId, itemInstance: { template: { category: toolCategory } } },
            include: { itemInstance: { include: { template: true } } }
        });

        if (tool) {
            statValue = Math.floor(statValue * calculator.getToolMultiplier(tool.itemInstance.template.toolTier || 0));
        }

        return calculator.calculatePlantOrFishDuration(resource.gatherTime, statValue);
    }

    async _handleToolHarvest(heroId, resource, template, heroStats, context) {
        const minToolTier = template.minToolTier || 0;
        const requiredCategory = (context === "LUMBERING") ? "AXE" : "PICKAXE";

        validator.checkPhysicalRequirements(heroStats, template.minStr || 0);
        await validator.checkToolRequirements(this.db, heroId, requiredCategory, minToolTier);

        return calculator.calculateMiningOrLumberingDuration(
            resource.gatherTime, 
            template.hardness || 1, 
            heroStats.attributes.str || 10
        );
    }

    _getHarvestContext(itemId) {
        const isWood = itemId >= 2400 && itemId < 2500;
        const isPlant = itemId >= 2800 && itemId < 2900;
        const isFish = itemId >= 3300 && itemId < 3400;

        if (isWood) return { context: "LUMBERING", isToolRequired: true };
        if (isPlant) return { context: "HERBALISM", isToolRequired: false };
        if (isFish) return { context: "FISHING", isToolRequired: false };
        return { context: "MINING", isToolRequired: true };
    }

    async completeGathering(userId, taskId) {
        const task = await this.db.taskQueue.findUnique({ 
            where: { id: taskId },
            include: { user: true }
        });
        if (!task || task.status !== "RUNNING") return;

        let yieldQuantity = 1;
        const now = new Date();
        const activeEvents = await this.db.activeEvent.findMany({
            where: { regionId: task.user.currentRegion, expiresAt: { gt: now } },
            include: { template: true }
        });

        const { context } = this._getHarvestContext(task.targetItemId);
        const multKey = `${context.toLowerCase()}YieldMult`; // Normalized Column Name

        for (const ae of activeEvents) {
            const t = ae.template;
            if (t[multKey]) {
                yieldQuantity = Math.floor(yieldQuantity * t[multKey]);
            }
        }

        await inventoryService.addItem(userId, task.targetItemId, Math.max(1, yieldQuantity));

        // --- AAA Guild Gathering Taxation ---
        const territory = await this.db.territory.findUnique({
            where: { regionId: task.user.currentRegion },
            include: { guild: true }
        });

        if (territory && territory.guild.gatheringTaxRate > 0) {
            const itemTemplate = await this.db.itemTemplate.findUnique({ where: { id: task.targetItemId } });
            const totalValue = (itemTemplate ? itemTemplate.baseValue : 10) * yieldQuantity;
            const guildFee = Math.floor(totalValue * territory.guild.gatheringTaxRate);

            if (guildFee > 0) {
                await this.runTransaction(async (tx) => {
                    // Try to deduct gold from user (if they have it), otherwise guild just gets it (Subsidized)
                    try {
                        const transactionManager = require('./economy/TransactionManager');
                        await transactionManager.removeGold(tx, userId, guildFee, "GATHERING_TAX", territory.id, "TERRITORY");
                    } catch (e) {
                        // User too poor? Guild still gets their tithe (Kingdom Subsidy logic)
                    }
                    await tx.guild.update({
                        where: { id: territory.guildId },
                        data: { treasury: { increment: guildFee } }
                    });
                });
            }
        }

        return await this.db.taskQueue.update({ where: { id: taskId }, data: { status: "COMPLETED" } });
    }
}

module.exports = new GatheringService();
