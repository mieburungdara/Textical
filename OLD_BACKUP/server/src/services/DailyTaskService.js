const BaseService = require('./BaseService');

/**
 * DailyTaskService
 * Handles player acceptance, progress tracking, and reward claiming for daily tasks.
 */
class DailyTaskService extends BaseService {
    constructor() {
        super();
    }

    /**
     * Accept a daily task
     */
    async acceptTask(userId, taskId) {
        return await this.runTransaction(async (tx) => {
            const task = await tx.regionalDailyTask.findUnique({ where: { id: taskId } });
            if (!task) throw new Error("Task not found.");

            // Check if already accepted
            const existing = await tx.playerDailyTaskProgress.findFirst({
                where: { userId, taskId }
            });
            if (existing) throw new Error("Task already accepted.");

            return await tx.playerDailyTaskProgress.create({
                data: { userId, taskId, status: "ACCEPTED" }
            });
        });
    }

    /**
     * Report progress (usually called from other services like Gathering/RewardProcessor)
     */
    async reportProgress(userId, type, targetId, count = 1) {
        const progresses = await this.db.playerDailyTaskProgress.findMany({
            where: {
                userId,
                status: "ACCEPTED",
                task: {
                    type,
                    targetId
                }
            },
            include: { task: true }
        });

        for (const prog of progresses) {
            const newCount = Math.min(prog.task.requiredCount, prog.currentCount + count);
            const status = (newCount >= prog.task.requiredCount) ? "COMPLETED" : "ACCEPTED";

            await this.db.playerDailyTaskProgress.update({
                where: { id: prog.id },
                data: { currentCount: newCount, status }
            });
        }
    }

    /**
     * Claim rewards for a completed task
     */
    async claimReward(userId, progressId) {
        return await this.runTransaction(async (tx) => {
            const progress = await tx.playerDailyTaskProgress.findUnique({
                where: { id: progressId },
                include: { task: true }
            });

            if (!progress || progress.userId !== userId) throw new Error("Invalid progress record.");
            if (progress.status !== "COMPLETED") throw new Error("Task is not completed yet.");

            // 1. Mark as CLAIMED
            await tx.playerDailyTaskProgress.update({
                where: { id: progressId },
                data: { status: "CLAIMED" }
            });

            // 2. Give Silver
            const transactionManager = require('./economy/TransactionManager');
            await transactionManager.addCurrency(tx, userId, progress.task.silverReward, "DAILY_TASK_REWARD");

            // 3. Give Reputation (TODO: If reputation system is expanded)
            
            return {
                silverReward: progress.task.silverReward,
                repReward: progress.task.repReward,
                message: "Rewards claimed successfully!"
            };
        });
    }

    /**
     * Get tasks for a user in their current region
     */
    async getAvailableTasks(userId, regionId) {
        const tasks = await this.db.regionalDailyTask.findMany({
            where: { regionId, expiresAt: { gt: new Date() } },
            include: { 
                playerProgress: { 
                    where: { userId } 
                } 
            }
        });

        return tasks.map(t => ({
            ...t,
            userStatus: t.playerProgress[0]?.status || "AVAILABLE",
            currentProgress: t.playerProgress[0]?.currentCount || 0
        }));
    }
}

module.exports = new DailyTaskService();
