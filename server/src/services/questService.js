const questRepository = require('../repositories/questRepository');
const userRepository = require('../repositories/userRepository');
const inventoryRepository = require('../repositories/inventoryRepository');
const jobService = require('./jobService');
const prisma = new (require('@prisma/client').PrismaClient)();

class QuestService {
    async acceptQuest(user, questId) {
        const quest = await prisma.questTemplate.findUnique({
            where: { id: questId },
            include: { objectives: true }
        });
        if (!quest) throw new Error("Quest template not found.");
        if (user.activeQuests.some(q => q.questId === questId)) throw new Error("Quest already active.");

        return await questRepository.acceptQuest(user.id, questId, quest.objectives);
    }

    async distributeRewards(user, template, targetHeroId = null) {
        const rewards = await prisma.questReward.findMany({
            where: { questId: template.id }
        });

        for (let reward of rewards) {
            switch (reward.type) {
                case "GOLD": 
                    await userRepository.update(user.id, { gold: user.gold + reward.amount });
                    break;
                case "ITEM":
                    await inventoryRepository.addItem(user.id, reward.targetId, reward.amount);
                    break;
                case "JOB":
                    if (targetHeroId) {
                        await jobService.assignPermanentJob(targetHeroId, reward.targetId);
                        console.log(`[QUEST] Hero ${targetHeroId} is now a permanent ${reward.targetId}`);
                    }
                    break;
                case "FAME":
                    await userRepository.update(user.id, { fame: user.fame + reward.amount });
                    break;
            }
        }
    }
}

module.exports = new QuestService();