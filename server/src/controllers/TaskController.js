const BaseController = require('./BaseController');
const prisma = require('../db');

class TaskController extends BaseController {
    async getActiveTask(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            const tasks = await prisma.taskQueue.findMany({
                where: { userId, status: "RUNNING" },
                include: { targetRegion: true }
            });
            this.sendSuccess(res, tasks[0] || null);
        });
    }
}

module.exports = new TaskController();
