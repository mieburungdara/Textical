const BaseController = require('./BaseController');
const travelService = require('../services/travelService');

class TravelController extends BaseController {
    async travel(req, res) {
        await this.execute(res, async () => {
            const { userId, targetRegionId } = req.body;
            const task = await travelService.startTravel(parseInt(userId), parseInt(targetRegionId));
            this.sendSuccess(res, task);
        });
    }
}

module.exports = new TravelController();
