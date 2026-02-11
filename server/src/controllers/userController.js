const BaseController = require('./BaseController');
const vitalityService = require('../services/vitalityService');
const formationService = require('../services/formationService');
const inventoryService = require('../services/inventoryService');
const prisma = require('../db');

class UserController extends BaseController {
    async login(req, res) {
        await this.execute(res, async () => {
            const { username, password } = req.body;
            const user = await prisma.user.findUnique({ where: { username } });
            
            if (!user) return this.sendError(res, "User not found", 404);

            // Simple password check (In production, use bcrypt)
            if (user.password !== password) {
                return this.sendError(res, "Invalid password", 401);
            }
            
            this.sendSuccess(res, user);
        });
    }

    async getHeroProfile(req, res) {
        await this.execute(res, async () => {
            const heroId = parseInt(req.params.id);
            if (isNaN(heroId)) return this.sendError(res, "Invalid Hero ID", 400);
            const profile = await formationService.getHeroCombatProfile(heroId);
            this.sendSuccess(res, profile);
        });
    }

    async getHeroes(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            const heroes = await prisma.hero.findMany({
                where: { userId },
                include: { 
                    combatClass: true, 
                    equipment: true,
                    skills: {
                        where: { isActive: true },
                        include: { skill: true }
                    },
                    // Also include passives from traits if needed, but for now skills
                }
            });

            // Transform heroes to flatten the skill structure if necessary, 
            // or client needs to handle "skills": [{ "skill": {...} }]
            // Let's flatten it to match client expectation: skills: [ {id, name...}, {id, name...} ]
            const flattenedHeroes = heroes.map(hero => {
                const flatSkills = hero.skills.map(hs => hs.skill);
                // Merge with legacy skills string/json field if it exists and hasn't been migrated completely
                // But for now, let's prioritize the relation data we just added.
                return {
                    ...hero,
                    skills: flatSkills
                };
            });

            this.sendSuccess(res, flattenedHeroes);
        });
    }

    async getInventory(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            const items = await prisma.inventoryItem.findMany({
                where: { userId },
                include: { template: true }
            });
            const status = await inventoryService.getStatus(userId);
            this.sendSuccess(res, { status, items });
        });
    }

    async getRecipes(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            const recipes = await prisma.userRecipe.findMany({
                where: { userId },
                include: { recipe: { include: { resultItem: true } } }
            });
            this.sendSuccess(res, recipes.map(r => r.recipe));
        });
    }

    async getFormation(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            const presets = await prisma.formationPreset.findMany({
                where: { userId },
                include: { slots: { include: { hero: true } } }
            });
            this.sendSuccess(res, presets);
        });
    }

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

    async getUserProfile(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);
            
            // Sync vitality first
            await vitalityService.syncUserVitality(userId);

            const user = await prisma.user.findUnique({
                where: { id: userId },
                include: { 
                    inventory: { include: { template: true } },
                    taskQueue: { 
                        where: { status: "RUNNING" },
                        include: { targetRegion: true }
                    },
                    premiumTier: true,
                    region: true
                }
            });
            
            if (!user) return this.sendError(res, "User not found", 404);

            const activeTask = user.taskQueue.length > 0 ? {
                ...user.taskQueue[0],
                targetRegionType: user.taskQueue[0].targetRegion ? user.taskQueue[0].targetRegion.type : "TOWN",
                targetRegionName: user.taskQueue[0].targetRegion ? user.taskQueue[0].targetRegion.name : "Destination"
            } : null;
            
            const regionMetadata = user.region ? { 
                type: user.region.visualType, 
                visualType: user.region.visualType,
                name: user.region.name 
            } : { type: "TOWN", name: "Unknown" };

            this.sendSuccess(res, { 
                ...user, 
                activeTask,
                currentRegionData: regionMetadata
            });
        });
    }

    async getFriends(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.params.id);
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            const friendships = await prisma.userFriend.findMany({
                where: { userId, status: "ACCEPTED" },
                include: { friend: { select: { id: true, username: true, isInTavern: true, currentRegion: true } } }
            });

            const friends = friendships.map(f => ({
                id: f.friend.id,
                name: f.friend.username,
                status: "online", // Simplification: in a real app, track online status via sockets/redis
                location: f.friend.isInTavern ? "Tavern" : "World"
            }));

            this.sendSuccess(res, friends);
        });
    }

    async updateSettings(req, res) {
        await this.execute(res, async () => {
            const userId = parseInt(req.body.userId);
            const { settings } = req.body;
            if (isNaN(userId)) return this.sendError(res, "Invalid User ID", 400);

            const updatedUser = await prisma.user.update({
                where: { id: userId },
                data: { settings: JSON.stringify(settings) }
            });

            this.sendSuccess(res, { settings: JSON.parse(updatedUser.settings) });
        });
    }

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

module.exports = new UserController();
