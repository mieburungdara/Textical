const BaseController = require('./BaseController');
const questService = require('../services/questService');

class QuestController extends BaseController {
    async getQuests(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.userId);
            const quests = await questService.getActiveQuests(userId);
            this.sendSuccess(res, quests);
        });
    }

    async completeQuest(req, res) {
        await this.execute(res, async () => {
            const { userId, userQuestId } = req.body;
            await questService.completeQuest(userId, userQuestId);
            this.sendSuccess(res, null, "Quest completed");
        });
    }
}

module.exports = new QuestController();
