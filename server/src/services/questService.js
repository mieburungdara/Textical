const prisma = require('../db');


/**
 * QuestService
 * The primary engine for Gold Injection.
 * Handles daily quest assignment, objective validation, and audited rewards.
 */
class QuestService {
    constructor() {
        this.DAILY_QUEST_COUNT = 3;
    }

    /**
     * Checks if a user is eligible for a quest refresh and populates new dailies.
     */
    async refreshDailyQuests(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { activeQuests: true }
        });

        const now = new Date();
        const elapsedSinceReset = now - new Date(user.lastQuestResetAt);

        // If 24 hours passed, clear old ones and assign new ones
        if (elapsedSinceReset > 86400000 || user.activeQuests.length === 0) {
            console.log(`[QUEST] Refreshing dailies for User ${userId}`);
            
            // 1. Clear old user quests
            await prisma.userQuest.deleteMany({ where: { userId } });

            // 2. Pick random quest templates (Gold source)
            const templates = await prisma.questTemplate.findMany({ take: this.DAILY_QUEST_COUNT });
            
            for (const template of templates) {
                await prisma.userQuest.create({
                    data: {
                        userId,
                        questId: template.id,
                        status: "ACTIVE"
                    }
                });
            }

            await prisma.user.update({
                where: { id: userId },
                data: { lastQuestResetAt: now }
            });
        }
    }

    /**
     * Validates and completes a quest, injecting Gold into the economy.
     */
    async completeQuest(userId, userQuestId) {
        const uQuest = await prisma.userQuest.findUnique({
            where: { id: userQuestId },
            include: { 
                quest: { 
                    include: { objectives: true, rewards: true } 
                } 
            }
        });

        if (!uQuest || uQuest.userId !== userId) throw new Error("Quest not found.");
        if (uQuest.status === "COMPLETED") throw new Error("Quest already finished.");

        // 1. Validate Objectives (e.g. Gather 5 Iron)
        for (const obj of uQuest.quest.objectives) {
            if (obj.type === "GATHER") {
                const invItem = await prisma.inventoryItem.findFirst({
                    where: { userId, templateId: obj.targetId }
                });
                if (!invItem || invItem.quantity < obj.amount) {
                    throw new Error(`Objective incomplete: Need ${obj.amount}x [Item ${obj.targetId}]`);
                }
                
                // Consume quest items
                await prisma.inventoryItem.update({
                    where: { id: invItem.id },
                    data: { quantity: invItem.quantity - obj.amount }
                });
            }
            // Add KILL or other types as needed here
        }

        // 2. Distribute Audited Rewards (Gold Injection)
        let totalGoldReward = 0;
        for (const reward of uQuest.quest.rewards) {
            if (reward.type === "GOLD") {
                totalGoldReward += reward.amount;
            }
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        return await prisma.$transaction([
            prisma.userQuest.update({
                where: { id: userQuestId },
                data: { status: "COMPLETED" }
            }),
            prisma.user.update({
                where: { id: userId },
                data: { gold: user.gold + totalGoldReward }
            }),
            prisma.transactionLedger.create({
                data: {
                    userId,
                    type: "QUEST_REWARD",
                    currencyTier: "GOLD",
                    amountDelta: totalGoldReward,
                    newBalance: user.gold + totalGoldReward,
                    metadata: JSON.stringify({ questId: uQuest.questId })
                }
            })
        ]);
    }

    /**
     * Get active quests for display.
     */
    async getActiveQuests(userId) {
        await this.refreshDailyQuests(userId);
        return await prisma.userQuest.findMany({
            where: { userId, status: "ACTIVE" },
            include: { quest: { include: { objectives: true, rewards: true } } }
        });
    }
}

module.exports = new QuestService();
