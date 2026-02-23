const prisma = require('../../db');

/**
 * Controller for Item management in the admin portal.
 */
class AdminItemController {
    /**
     * Get paginated list of item templates.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getItems(req, res) {
        try {
            const { page = 1, limit = 50, search = '', category = '' } = req.query;
            const skip = (page - 1) * limit;
            const where = {};
            if (search) {
                where.OR = [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ];
            }
            if (category) where.category = category;
            const [items, total] = await Promise.all([
                prisma.itemTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' },
                    include: {
                        stats: true,
                        traits: true,
                        equipSlots: true
                    }
                }),
                prisma.itemTemplate.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    items,
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
}

module.exports = new AdminItemController();
