const BaseController = require('./BaseController');
const achievementService = require('../services/AchievementService');
const titleService = require('../services/TitleService');
const logger = require('../utils/logger');

class AchievementController extends BaseController {
    // Get all achievements and player progress
    async getAchievements(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            const progress = await achievementService.getProgress(userId);
            this.sendSuccess(res, progress);
        });
    }

    // Get achievements by category
    async getAchievementsByCategory(req, res) {
        await this.execute(res, async () => {
            const { category } = req.query;
            const achievements = await achievementService.getAllAchievements(category);
            this.sendSuccess(res, achievements);
        });
    }

    // Get specific achievement
    async getAchievement(req, res) {
        await this.execute(res, async () => {
            const { code } = req.params;
            const achievement = await achievementService.getAchievement(code);
            
            if (!achievement) {
                return this.sendError(res, "Achievement not found", 404);
            }
            
            this.sendSuccess(res, achievement);
        });
    }

    // Get player progress
    async getProgress(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            const progress = await achievementService.getProgress(userId);
            this.sendSuccess(res, progress);
        });
    }

    // Claim reward for completed achievement
    async claimReward(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            const { code } = req.params;
            
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            try {
                const result = await achievementService.claimReward(userId, code);
                this.sendSuccess(res, result);
            } catch (error) {
                this.sendError(res, error.message, 400);
            }
        });
    }

    // Get player titles
    async getTitles(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            const titles = await titleService.getTitles(userId);
            const activeTitle = await titleService.getActiveTitle(userId);
            
            this.sendSuccess(res, {
                titles,
                activeTitle
            });
        });
    }

    // Equip a title
    async equipTitle(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            const { titleId } = req.body;
            
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            if (!titleId) return this.sendError(res, "Title ID required", 400);

            const title = await titleService.equipTitle(userId, titleId);
            this.sendSuccess(res, title);
        });
    }

    // Unequip current title
    async unequipTitle(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            await titleService.unequipTitle(userId);
            this.sendSuccess(res, { message: "Title unequipped" });
        });
    }

    // Seed achievements (admin endpoint)
    async seedAchievements(req, res) {
        await this.execute(res, async () => {
            try {
                const count = await achievementService.seedAchievements();
                this.sendSuccess(res, { message: `Seeded ${count} achievements` });
            } catch (error) {
                logger.error('[AchievementController] Error seeding achievements:', error);
                this.sendError(res, error.message, 500);
            }
        });
    }
}

module.exports = new AchievementController();
