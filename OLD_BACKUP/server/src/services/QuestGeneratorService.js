const BaseService = require('./BaseService');

/**
 * QuestGeneratorService
 * Procedurally generates regional daily tasks based on region content.
 */
class QuestGeneratorService extends BaseService {
    constructor() {
        super();
        this.TASK_EXPIRY_HOURS = 24;
    }

    /**
     * Generate tasks for a specific region
     */
    async generateTasksForRegion(regionId) {
        const region = await this.db.regionTemplate.findUnique({
            where: { id: regionId },
            include: { resources: true, monsters: true }
        });

        if (!region || !region.hasInn) return [];

        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + this.TASK_EXPIRY_HOURS);

        const tasks = [];

        // 1. GATHER Tasks (from resources)
        if (region.resources.length > 0) {
            const res = region.resources[Math.floor(Math.random() * region.resources.length)];
            const item = await this.db.itemTemplate.findUnique({ where: { id: res.templateId } });
            
            tasks.push({
                regionId,
                title: `Gathering: ${item.name}`,
                description: `We need ${item.name} for our local supplies. Can you help?`,
                type: "GATHER",
                targetId: res.templateId,
                requiredCount: Math.floor(Math.random() * 5) + 5,
                silverReward: 500,
                repReward: 10,
                expiresAt
            });
        }

        // 2. KILL Tasks (from monsters)
        if (region.monsters.length > 0) {
            const mob = region.monsters[Math.floor(Math.random() * region.monsters.length)];
            const monster = await this.db.monsterTemplate.findUnique({ where: { id: mob.templateId } });

            tasks.push({
                regionId,
                title: `Extermination: ${monster.name}`,
                description: `The ${monster.name} populations are getting out of hand. Thin them out.`,
                type: "KILL",
                targetId: mob.templateId,
                requiredCount: Math.floor(Math.random() * 10) + 10,
                silverReward: 800,
                repReward: 15,
                expiresAt
            });
        }

        // Save generated tasks
        const createdTasks = [];
        for (const taskData of tasks) {
            const task = await this.db.regionalDailyTask.create({ data: taskData });
            createdTasks.push(task);
        }

        return createdTasks;
    }

    /**
     * Clear expired tasks and regenerate for all Inn regions
     */
    async refreshAllGlobalTasks() {
        // Delete expired
        await this.db.regionalDailyTask.deleteMany({
            where: { expiresAt: { lt: new Date() } }
        });

        const regionsWithInns = await this.db.regionTemplate.findMany({
            where: { hasInn: true },
            select: { id: true }
        });

        for (const r of regionsWithInns) {
            await this.generateTasksForRegion(r.id);
        }
        
        return { count: regionsWithInns.length, message: "Refresh complete." };
    }
}

module.exports = new QuestGeneratorService();
