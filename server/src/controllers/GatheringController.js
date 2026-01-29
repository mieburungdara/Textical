const BaseController = require('./BaseController');
const gatheringService = require('../services/gatheringService');

class GatheringController extends BaseController {
    async gather(req, res) {
        await this.execute(res, async () => {
            const { userId, heroId, resourceId } = req.body;
            const task = await gatheringService.startGathering(userId, heroId, resourceId);
            this.sendSuccess(res, task);
        });
    }
}

module.exports = new GatheringController();
