const BaseService = require('./BaseService');
const validator = require('./gathering/GatheringValidator');
const calculator = require('./gathering/DurationCalculator');
const inventoryService = require('./inventoryService');
const statService = require('./statService');
const vitalityService = require('./vitalityService');

/**
 * GatheringService
 * Thin orchestrator for resource harvesting.
 * Delegating logic to Validator and Calculator components.
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
        const resource = await this.db.regionResource.findUnique({
            where: { id: regionResourceId },
            include: { item: true }
        });

        if (!user || !hero || !resource) throw new Error("Invalid harvest parameters.");

        // 1. Core Validations
        validator.validateOwnership(hero, userId);
        validator.validateRegion(user, resource);
        validator.validateAvailability(user);
        
        const hasSpace = await inventoryService.hasSpace(userId, resource.itemId);
        if (!hasSpace) throw new Error("Inventory full.");

        // 2. Context Determination
        const { context, isToolRequired } = this._getHarvestContext(resource.itemId);

        // 3. Fetch Contextual Stats
        const heroStats = await statService.calculateHeroStats(heroId, context);
        let duration = 0;

        if (!isToolRequired) {
            duration = await this._handleManualHarvest(heroId, resource, heroStats, context);
        } else {
            duration = await this._handleToolHarvest(heroId, resource, heroStats, context);
        }

        // 4. Finalize Task
        await vitalityService.consumeVitality(userId, this.BASE_VITALITY_COST);
        const now = new Date();
        const finishesAt = new Date(now.getTime() + (duration * 1000));

        return await this.db.taskQueue.create({
            data: {
                userId, heroId, type: "GATHERING", targetItemId: resource.itemId,
                status: "RUNNING", startedAt: now, finishesAt: finishesAt
            }
        });
    }

    async _handleManualHarvest(heroId, resource, heroStats, context) {
        let statValue = (context === "HERBALISM") ? heroStats.attributes.int : heroStats.attributes.dex;
        
        // Apply specialized tool multipliers (Sickle/Rod)
        const toolCategory = (context === "HERBALISM") ? "HERBALISM_SICKLE" : "FISHING_ROD";
        const tool = await this.db.heroEquipment.findFirst({
            where: { heroId, itemInstance: { template: { category: toolCategory } } },
            include: { itemInstance: { include: { template: true } } }
        });

        if (tool) {
            statValue = Math.floor(statValue * calculator.getToolMultiplier(tool.itemInstance.template.toolTier || 0));
        }

        return calculator.calculatePlantOrFishDuration(resource.gatherTimeSeconds, statValue);
    }

    async _handleToolHarvest(heroId, resource, heroStats, context) {
        const minToolTier = resource.item.minToolTier || 0;
        const requiredCategory = (context === "LUMBERING") ? "AXE" : "PICKAXE";

        validator.checkPhysicalRequirements(heroStats, resource.item.minStr || 0);
        await validator.checkToolRequirements(this.db, heroId, requiredCategory, minToolTier);

        return calculator.calculateMiningOrLumberingDuration(
            resource.gatherTimeSeconds, 
            resource.item.hardness || 1, 
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
        const task = await this.db.taskQueue.findUnique({ where: { id: taskId } });
        if (!task || task.status !== "RUNNING") return;

        await inventoryService.addItem(userId, task.targetItemId, 1);
        return await this.db.taskQueue.update({ where: { id: taskId }, data: { status: "COMPLETED" } });
    }
}

module.exports = new GatheringService();