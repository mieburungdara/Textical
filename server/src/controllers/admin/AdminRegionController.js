const prisma = require('../../db');

/**
 * Controller for Region management in the admin portal.
 */
class AdminRegionController {
    /**
     * Get paginated list of region templates.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getRegions(req, res) {
        try {
            const { page = 1, limit = 50, search = '' } = req.query;
            const skip = (page - 1) * limit;
            const where = search ? { OR: [{ name: { contains: search } }] } : {};
            const [regions, total] = await Promise.all([
                prisma.regionTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' },
                    include: {
                        faction: true,
                        resources: true,
                        monsters: true
                    }
                }),
                prisma.regionTemplate.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    regions,
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

module.exports = new AdminRegionController();
