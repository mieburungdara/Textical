const BaseService = require('../BaseService');

/**
 * AAA RewardDistributor (Multi-Stage Aware)
 * Awards stage-specific prizes and handles phase transitions.
 */
class RewardDistributor extends BaseService {
    async award(userId, userQuest) {
        const currentStage = userQuest.currentStage;
        if (!currentStage) throw new Error("No active stage found.");

        const nextStage = await this.db.questStage.findFirst({
            where: { questId: userQuest.questId, order: currentStage.order + 1 }
        });

        return await this.runTransaction(async (tx) => {
            // 1. Distribute Current Stage Rewards
            for (const r of currentStage.rewards) {
                if (r.type === "GOLD") {
                    await tx.user.update({ where: { id: userId }, data: { gold: { increment: r.amount } } });
                } else if (r.type === "ITEM" && r.itemId) {
                    await tx.inventoryItem.upsert({
                        where: { userId_templateId: { userId, templateId: r.itemId } },
                        update: { quantity: { increment: r.amount } },
                        create: { userId, templateId: r.itemId, quantity: r.amount }
                    });
                } else if (r.type === "XP") {
                    // AAA: Award XP to all user's heroes or current active formation
                    const user = await tx.user.findUnique({ where: { id: userId }, include: { heroes: true } });
                    for (const hero of user.heroes) {
                        await tx.hero.update({
                            where: { id: hero.id },
                            data: { unitXp: { increment: r.amount } }
                        });
                    }
                } else if (r.type === "REPUTATION" && r.factionId) {
                    await tx.userReputation.upsert({
                        where: { userId_factionId: { userId, factionId: r.factionId } },
                        update: { points: { increment: r.amount } },
                        create: { userId, factionId: r.factionId, points: r.amount }
                    });
                }
            }

            // 2. Handle Transition or Completion
            if (nextStage) {
                await tx.userQuest.update({
                    where: { id: userQuest.id },
                    data: { currentStageId: nextStage.id }
                });
                return { success: true, finished: false, nextStage: nextStage.name };
            } else {
                await tx.userQuest.update({
                    where: { id: userQuest.id },
                    data: { status: "COMPLETED", currentStageId: null }
                });
                return { success: true, finished: true, message: "Quest Fully Completed!" };
            }
        });
    }
}

module.exports = new RewardDistributor();