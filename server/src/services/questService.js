const BaseService = require('./BaseService');
const questRefreshSystem = require('./quest/QuestRefreshSystem');
const objectiveValidator = require('./quest/ObjectiveValidator');
const rewardDistributor = require('./quest/RewardDistributor');

/**
 * QuestService (v2.0 - Modular Orchestrator)
 * Orchestrates daily rotations, validation, and rewards for the quest system.
 */
class QuestService extends BaseService {
    
    async completeQuest(userId, userQuestId) {
        const uQuest = await this.db.userQuest.findUnique({
            where: { id: userQuestId },
            include: { 
                quest: { 
                    include: { objectives: true, rewards: true } 
                } 
            }
        });

        if (!uQuest || uQuest.userId !== userId) throw new Error("Quest not found.");
        if (uQuest.status === "COMPLETED") throw new Error("Quest already finished.");

        // 1. Validate Objectives
        await objectiveValidator.validateAndConsume(userId, uQuest);

        // 2. Award Rewards
        return await rewardDistributor.award(userId, uQuest);
    }

    async getActiveQuests(userId) {
        await questRefreshSystem.refresh(userId);
        return await this.db.userQuest.findMany({
            where: { userId, status: "ACTIVE" },
            include: { quest: { include: { objectives: true, rewards: true } } }
        });
    }
}

module.exports = new QuestService();