const BaseController = require('./BaseController');
const prisma = require('../db');

class AchievementController extends BaseController {
    async getAchievements(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            const userAchievements = await prisma.userAchievement.findMany({
                where: { userId },
                include: { achievement: true }
            });

            const allAchievements = await prisma.achievementTemplate.findMany();

            const result = allAchievements.map(template => {
                const earned = userAchievements.find(ua => ua.achievementId === template.id);
                return {
                    ...template,
                    unlocked: !!earned,
                    unlockedAt: earned ? earned.unlockedAt : null
                };
            });

            this.sendSuccess(res, result);
        });
    }
}

module.exports = new AchievementController();
