const prisma = require('../../db');

/**
 * Controller for Trait management in the admin portal.
 */
class AdminTraitController {
    /**
     * Get paginated list of trait templates.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getTraits(req, res) {
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
            const [traits, total] = await Promise.all([
                prisma.traitTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' },
                    include: { stats: true }
                }),
                prisma.traitTemplate.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    traits,
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

module.exports = new AdminTraitController();
