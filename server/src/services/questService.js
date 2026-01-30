const BaseService = require('./BaseService');
const questRefreshSystem = require('./quest/QuestRefreshSystem');
const objectiveValidator = require('./quest/ObjectiveValidator');
const rewardDistributor = require('./quest/RewardDistributor');

/**
 * QuestService (Refactored)
 * Orchestrates multi-stage quest progression.
 */
class QuestService extends BaseService {
    
    async acceptQuest(userId, questId) {
        const quest = await this.db.questTemplate.findUnique({
            where: { id: questId },
            include: { stages: { orderBy: { order: 'asc' } } }
        });

        if (!quest || quest.stages.length === 0) throw new Error("Quest template invalid.");

        return await this.db.userQuest.create({
            data: {
                userId,
                questId,
                currentStageId: quest.stages[0].id,
                status: "ACTIVE"
            }
        });
    }

    async completeCurrentStage(userId, userQuestId) {
        const uQuest = await this.db.userQuest.findUnique({
            where: { id: userQuestId },
            include: { 
                currentStage: { include: { objectives: true, rewards: true } }
            }
        });

        if (!uQuest || uQuest.userId !== userId) throw new Error("User quest record not found.");
        if (uQuest.status === "COMPLETED") throw new Error("Quest already fully finished.");

        this.log(`Hero attempting to complete stage: ${uQuest.currentStage.name}`, "Quest");

        // 1. Validate Current Stage Objectives
        await objectiveValidator.validateAndConsume(userId, uQuest);

        // 2. Award Stage Rewards & Handle Transitions
        return await rewardDistributor.award(userId, uQuest);
    }

    async getActiveQuests(userId) {
        return await this.db.userQuest.findMany({
            where: { userId, status: "ACTIVE" },
            include: { currentStage: { include: { objectives: true } }, quest: true }
        });
    }
}

module.exports = new QuestService();
