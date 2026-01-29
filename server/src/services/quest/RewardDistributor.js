const BaseService = require('../BaseService');

/**
 * RewardDistributor
 * Calculates and awards quest completion payouts.
 */
class RewardDistributor extends BaseService {
    async award(userId, userQuest) {
        let totalGoldReward = 0;
        for (const reward of userQuest.quest.rewards) {
            if (reward.type === "GOLD") {
                totalGoldReward += reward.amount;
            }
        }

        const user = await this.db.user.findUnique({ where: { id: userId } });

        return await this.db.$transaction([
            this.db.userQuest.update({
                where: { id: userQuest.id },
                data: { status: "COMPLETED" }
            }),
            this.db.user.update({
                where: { id: userId },
                data: { gold: user.gold + totalGoldReward }
            }),
            this.db.transactionLedger.create({
                data: {
                    userId,
                    type: "QUEST_REWARD",
                    currencyTier: "GOLD",
                    amountDelta: totalGoldReward,
                    newBalance: user.gold + totalGoldReward,
                    metadata: JSON.stringify({ questId: userQuest.questId })
                }
            })
        ]);
    }
}

module.exports = new RewardDistributor();
