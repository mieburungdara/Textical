const questRepository = require('../repositories/questRepository');
const userRepository = require('../repositories/userRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const prisma = new (require('@prisma/client').PrismaClient)();

class QuestService {
    /**
     * Logic to accept a new mission
     */
    async acceptQuest(user, questId) {
        // 1. Fetch Template
        const quest = await prisma.questTemplate.findUnique({
            where: { id: questId },
            include: { objectives: true }
        });
        if (!quest) throw new Error("Quest template not found.");

        // 2. Validate Prerequisites
        if (user.level < quest.minLevel) throw new Error(`Required Level: ${quest.minLevel}`);
        
        if (quest.prerequisiteQuestId) {
            const prereq = await prisma.userQuest.findFirst({
                where: { userId: user.id, questId: quest.prerequisiteQuestId, status: "COMPLETED" }
            });
            if (!prereq) throw new Error("Complete the prerequisite quest first.");
        }

        // 3. Create Instance via Repository
        return await questRepository.acceptQuest(user.id, questId, quest.objectives);
    }

    /**
     * AAA PROGRESS TRACKER: High-performance objective update
     */
    async trackActivity(user, type, targetId, amount = 1) {
        // Find all active quests for this user that have an objective of this type and target
        const userQuests = await questRepository.getPlayerQuests(user.id);
        const activeMissions = userQuests.filter(q => q.status === "ACTIVE");

        for (let mission of activeMissions) {
            for (let userObj of mission.objectives) {
                const template = userObj.objective;
                if (template.type === type && template.targetId === targetId && !userObj.isCompleted) {
                    
                    const newAmount = userObj.currentAmount + amount;
                    const isNowDone = newAmount >= template.amount;
                    
                    await questRepository.updateObjectiveProgress(userObj.id, Math.min(newAmount, template.amount), isNowDone);
                    
                    console.log(`[QUEST] ${user.username} progressed mission ${mission.questId}: ${newAmount}/${template.amount}`);
                    
                    // Auto-Check Mission Completion
                    await this.checkMissionCompletion(user, mission.id);
                }
            }
        }
    }

    async checkMissionCompletion(user, userQuestId) {
        const mission = await prisma.userQuest.findUnique({
            where: { id: userQuestId },
            include: { objectives: true, quest: true }
        });

        const allDone = mission.objectives.every(o => o.isCompleted);
        if (allDone && mission.status === "ACTIVE") {
            await questRepository.completeQuest(userQuestId);
            await this.distributeRewards(user, mission.quest);
            console.log(`[QUEST] ${user.username} completed ${mission.quest.name}!`);
        }
    }

    async distributeRewards(user, template) {
        const rewards = JSON.parse(template.rewards || "{}");
        
        if (rewards.gold) await userRepository.updateGold(user.id, user.gold + rewards.gold);
        if (rewards.fame) await userRepository.update(user.id, { fame: user.fame + rewards.fame });
        
        // Items Reward
        if (rewards.items) {
            for (let item of rewards.items) {
                await inventoryRepository.addItem(user.id, item.id, item.qty || 1);
            }
        }
    }
}

module.exports = new QuestService();
