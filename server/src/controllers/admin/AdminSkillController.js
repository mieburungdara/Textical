const prisma = require('../../db');

/**
 * Controller for Skill management in the admin portal.
 */
class AdminSkillController {
    /**
     * Get paginated list of skill templates.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getSkills(req, res) {
        try {
            const { page = 1, limit = 50, search = '' } = req.query;
            const skip = (page - 1) * limit;
            const where = search ? {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ]
            } : {};
            const [skills, total] = await Promise.all([
                prisma.skillTemplate.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' }
                }),
                prisma.skillTemplate.count({ where })
            ]);
            res.json({
                success: true,
                data: {
                    skills,
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

module.exports = new AdminSkillController();
