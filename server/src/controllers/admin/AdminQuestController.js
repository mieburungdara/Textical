const prisma = require('../../db');
const assetService = require('../../services/assetService');

/**
 * Controller for Quest management in the admin portal.
 */
class AdminQuestController {
    /**
     * Get paginated list of quest templates.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getQuests(req, res) {
        try {
            const { page = 1, limit = 50, search = '', category } = req.query;
            const skip = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ];
            }
            if (category && category !== 'ALL') where.category = category;
            const [quests, total] = await Promise.all([
                prisma.questTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' },
                    include: {
                        questGiver: true,
                        turnInNpc: true,
                        faction: true,
                        stages: {
                            include: {
                                objectives: true,
                                rewards: true
                            }
                        }
                    }
                }),
                prisma.questTemplate.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    quests,
                    pagination: {
                        page: parseInt(page),
                        limit: parseInt(limit),
                        total,
                        pages: Math.ceil(total / limit)
                    }
                }
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get all quest categories with counts.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getQuestCategories(req, res) {
        try {
            const categories = await prisma.questTemplate.groupBy({
                by: ['category'],
                _count: { category: true }
            });
            const formatted = categories.map(c => ({
                id: c.category,
                name: c.category,
                count: c._count.category
            }));
            res.json({ success: true, data: formatted });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Save/Create a quest template.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async saveQuest(req, res) {
        try {
            const { id } = req.params;
            const quest = await assetService.saveQuest(id, req.body);
            res.json({ success: true, data: quest });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new AdminQuestController();
