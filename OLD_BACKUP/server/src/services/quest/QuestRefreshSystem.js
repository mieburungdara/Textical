const BaseService = require('../BaseService');

/**
 * QuestRefreshSystem
 * Manages daily quest assignment and time-based resets.
 */
class QuestRefreshSystem extends BaseService {
    constructor() {
        super();
        this.DAILY_QUEST_COUNT = 3;
    }

    async refresh(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { activeQuests: true }
        });

        const now = new Date();
        const elapsedSinceReset = now - new Date(user.lastQuestResetAt);

        if (elapsedSinceReset > 86400000 || user.activeQuests.length === 0) {
            console.log(`[QUEST] Refreshing dailies for User ${userId}`);
            
            await this.db.userQuest.deleteMany({ where: { userId } });

            const allTemplates = await this.db.questTemplate.findMany();
            const templates = allTemplates
                .sort(() => 0.5 - Math.random())
                .slice(0, this.DAILY_QUEST_COUNT);
            
            for (const template of templates) {
                await this.db.userQuest.create({
                    data: {
                        userId,
                        questId: template.id,
                        status: "ACTIVE"
                    }
                });
            }

            await this.db.user.update({
                where: { id: userId },
                data: { lastQuestResetAt: now }
            });
        }
    }
}

module.exports = new QuestRefreshSystem();
