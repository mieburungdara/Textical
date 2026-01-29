const TaskHandler = require('./TaskHandler');
const travelService = require('../travelService');

class TravelTaskHandler extends TaskHandler {
    async complete(task) {
        return await travelService.completeTravel(task.userId, task.id);
    }

    async getCompletionPayload(task) {
        return {
            targetRegionId: task.targetRegionId,
            targetRegionType: task.targetRegion ? task.targetRegion.visualType : "TOWN",
            targetRegion: task.targetRegion ? { ...task.targetRegion, type: task.targetRegion.visualType } : null
        };
    }
}

module.exports = TravelTaskHandler;
