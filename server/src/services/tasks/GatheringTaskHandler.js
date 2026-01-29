const TaskHandler = require('./TaskHandler');
const gatheringService = require('../gatheringService');

class GatheringTaskHandler extends TaskHandler {
    async complete(task) {
        return await gatheringService.completeGathering(task.userId, task.id);
    }

    async getDuration(task, user) {
        const res = await this.db.regionResource.findFirst({ 
            where: { regionId: user.currentRegion, itemId: task.targetItemId } 
        });
        return res ? res.gatherTimeSeconds : 5;
    }
}

module.exports = GatheringTaskHandler;
