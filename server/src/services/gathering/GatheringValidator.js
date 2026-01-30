/**
 * AAA GatheringValidator
 * Handles physical and tool requirement checks.
 */
class GatheringValidator {
    validateOwnership(hero, userId) {
        if (hero.userId !== userId) throw new Error("You do not own this hero.");
    }

    validateRegion(user, resource) {
        if (user.currentRegion !== resource.regionId) throw new Error("Incorrect region.");
    }

    validateAvailability(user) {
        if (user.taskQueue.length > 0) throw new Error("Hero is busy.");
    }

    checkPhysicalRequirements(heroStats, minStr) {
        if (heroStats.attributes.str < minStr) {
            throw new Error(`Insufficient STR (${heroStats.attributes.str}/${minStr})`);
        }
    }

    async checkToolRequirements(prisma, heroId, category, minTier) {
        const tool = await prisma.heroEquipment.findFirst({
            where: { heroId, itemInstance: { template: { category } } },
            include: { itemInstance: { include: { template: true } } }
        });

        const tier = tool ? (tool.itemInstance.template.toolTier || 0) : -1;
        if (tier < minTier) {
            throw new Error(`Required ${category} Tier ${minTier} (Have: ${tier === -1 ? 'None' : tier})`);
        }
        return tool;
    }
}

module.exports = new GatheringValidator();
