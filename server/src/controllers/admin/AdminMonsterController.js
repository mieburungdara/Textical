const prisma = require('../../db');
const assetService = require('../../services/assetService');

/**
 * Controller for Monster management in the admin portal.
 */
class AdminMonsterController {
    /**
     * Get paginated list of monster templates.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getMonsters(req, res) {
        try {
            const { page = 1, limit = 100, search = '', categoryId } = req.query;
            const skip = (page - 1) * limit;
            const where = {};
            if (search) where.name = { contains: search };
            if (categoryId && categoryId !== 'null' && categoryId !== '0') {
                where.categoryId = parseInt(categoryId);
            }
            const [monsters, total] = await Promise.all([
                prisma.monsterTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'asc' },
                    include: {
                        category: true,
                        traits: { include: { trait: true } }
                    }
                }),
                prisma.monsterTemplate.count({ where })
            ]);
            res.json(monsters);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get all monster categories.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getMonsterCategories(req, res) {
        try {
            const categories = await prisma.monsterCategory.findMany({
                orderBy: { name: 'asc' }
            });
            res.json(categories);
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Update an existing monster template.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async updateMonsterTemplate(req, res) {
        try {
            const id = req.params.id;
            const updated = await assetService.saveMonster(id, req.body);
            res.json({ success: true, data: updated });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Create a new monster template.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async createMonsterTemplate(req, res) {
        try {
            const lastMonster = await prisma.monsterTemplate.findFirst({
                orderBy: { id: 'desc' }
            });
            const nextId = (lastMonster ? lastMonster.id : 0) + 1;
            const created = await assetService.saveMonster(nextId, req.body);
            res.json({ success: true, data: created });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new AdminMonsterController();
