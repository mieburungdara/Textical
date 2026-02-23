const prisma = require('../../db');

/**
 * Controller for Faction management in the admin portal.
 */
class AdminFactionController {
    /**
     * Get paginated list of factions with member counts.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getFactions(req, res) {
        try {
            const { page = 1, limit = 50, search = '' } = req.query;
            const skip = (page - 1) * limit;
            const where = search ? {
                OR: [
                    { name: { contains: search } },
                    { description: { contains: search } }
                ]
            } : {};
            const [factions, total] = await Promise.all([
                prisma.faction.findMany({
                    where,
                    skip,
                    take: parseInt(limit),
                    orderBy: { id: 'desc' }
                }),
                prisma.faction.count({ where })
            ]);
            const factionsWithCounts = await Promise.all(
                factions.map(async faction => {
                    const memberCount = await prisma.user.count({
                        where: { factionId: faction.id }
                    });
                    return { ...faction, memberCount };
                })
            );
            res.json({
                success: true,
                data: {
                    factions: factionsWithCounts,
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

module.exports = new AdminFactionController();
