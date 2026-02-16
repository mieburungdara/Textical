const prisma = require('../../db');
const weatherService = require('../../services/RegionWeatherService');
const mapHandler = require('../../handlers/MapRealtimeHandler');

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

    /**
     * Get detailed region template by ID.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getRegionById(req, res) {
        try {
            const { id } = req.params;
            const region = await prisma.regionTemplate.findUnique({
                where: { id: parseInt(id) },
                include: {
                    faction: true,
                    area: true,
                    mapMusic: true,
                    resources: {
                        include: {
                            item: true
                        }
                    },
                    monsters: {
                        include: {
                            monster: true
                        }
                    },
                    npcs: {
                        include: {
                            npc: true
                        }
                    },
                    hazards: {
                        include: {
                            hazardType: true
                        }
                    },
                    spirits: true,
                    dailyTasks: true,
                    worldBosses: {
                        include: {
                            monster: true
                        }
                    }
                }
            });

            if (!region) {
                return res.status(404).json({ success: false, error: 'Region not found' });
            }

            res.json({
                success: true,
                data: region
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get all regions for map visualization.
     * @param {Object} req - Express request.
     * @param {Object} res - Express response.
     */
    async getMapRegions(req, res) {
        try {
            const regions = await prisma.regionTemplate.findMany({
                select: {
                    id: true,
                    name: true,
                    gridX: true,
                    gridY: true,
                    visualType: true,
                    zoneType: true,
                    zoneLevel: true,
                    regionalTaxRate: true,
                    corruptionLevel: true,
                    sanctuaryPower: true,
                    ecologicalStress: true,
                    spiritDensity: true,
                    banditThreatLevel: true,
                    factionId: true,
                    faction: {
                        select: {
                            name: true,
                            color: true
                        }
                    },
                    guildOwnership: {
                        select: {
                            name: true,
                            color: true
                        }
                    }
                }
            });
            res.json({
                success: true,
                data: regions
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get real-time weather snapshot for all regions.
     */
    async getWeatherSnapshot(req, res) {
        try {
            res.json({
                success: true,
                data: weatherService.getWeatherSnapshot()
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get real-time NPC presence snapshot.
     */
    async getNPCSnapshot(req, res) {
        try {
            const npcs = await mapHandler._getNPCSnapshot();
            res.json({
                success: true,
                data: npcs
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get real-time Elite Boss snapshot.
     */
    async getEliteBossSnapshot(req, res) {
        try {
            const bosses = await mapHandler._getEliteBossSnapshot();
            res.json({
                success: true,
                data: bosses
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }

    /**
     * Get player density snapshot.
     */
    async getPlayerDensity(req, res) {
        try {
            const density = await mapHandler._getPlayerDensity();
            res.json({
                success: true,
                data: density
            });
        } catch (error) {
            res.status(500).json({ success: false, error: error.message });
        }
    }
}

module.exports = new AdminRegionController();
