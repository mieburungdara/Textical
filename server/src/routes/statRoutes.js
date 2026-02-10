/**
 * Stat Routes
 * REST endpoints untuk hero stat management
 */
const express = require('express');
const router = express.Router();
const statService = require('../services/statService');
const heroRepository = require('../repositories/heroRepository');

/**
 * Validate hero exists
 */
const validateHero = async (heroId) => {
    const id = parseInt(heroId);
    if (isNaN(id)) {
        throw new Error('Invalid Hero ID');
    }
    const hero = await heroRepository.findById(id);
    if (!hero) {
        throw new Error('Hero not found');
    }
    return hero;
};

/**
 * POST /api/stats/calculate
 * Calculate stats with context/environment
 */
router.post('/calculate', async (req, res) => {
    try {
        const { heroId, context, environment, includeBreakdown } = req.body;
        if (!heroId) throw new Error('Hero ID required');

        const result = includeBreakdown 
            ? await statService.calculateStatsWithBreakdown(parseInt(heroId), { ...context, ...environment })
            : await statService.calculateHeroStats(parseInt(heroId), { ...context, ...environment });

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/stats/metadata
 * Get stat formulas and caps metadata
 */
router.get('/metadata', (req, res) => {
    try {
        const metadata = statService.getStatMetadata();
        res.json({ success: true, data: metadata });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/stats/:heroId
 * Get complete hero stats with breakdown
 */
router.get('/:heroId', async (req, res) => {
    try {
        const { heroId } = req.params;
        const { forceRecalculate } = req.query;

        await validateHero(heroId);

        const stats = await statService.calculateStatsWithBreakdown(parseInt(heroId), {
            forceRecalculate: forceRecalculate === 'true'
        });

        res.json({
            success: true,
            data: stats
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stats/:heroId/history
 * Get hero stat history (level up, allocation changes)
 */
router.get('/:heroId/history', async (req, res) => {
    try {
        const { heroId } = req.params;
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;

        await validateHero(heroId);

        const history = await statService.getStatHistory(parseInt(heroId), { limit, offset });

        res.json({
            success: true,
            data: history,
            pagination: { limit, offset }
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/stats/:heroId/allocate
 * Allocate stat points
 */
router.post('/:heroId/allocate', async (req, res) => {
    try {
        const { heroId } = req.params;
        const { statName, points } = req.body;

        await validateHero(heroId);
        const result = await statService.allocateStat(parseInt(heroId), statName, points);

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/stats/:heroId/allocate/batch
 * Batch allocate stat points
 */
router.post('/:heroId/allocate/batch', async (req, res) => {
    try {
        const { heroId } = req.params;
        const { batch } = req.body;

        if (!batch || typeof batch !== 'object') {
            throw new Error('Invalid batch data');
        }

        await validateHero(heroId);
        const result = await statService.batchAllocateStats(parseInt(heroId), batch);

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/stats/:heroId/preview
 * Preview/Simulate stat changes
 */
router.post('/:heroId/preview', async (req, res) => {
    try {
        const { heroId } = req.params;
        const { additions, context } = req.body;

        await validateHero(heroId);
        const result = await statService.simulateStats(parseInt(heroId), additions, context);

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/stats/:heroId/reset
 * Reset stat allocations
 */
router.post('/:heroId/reset', async (req, res) => {
    try {
        const { heroId } = req.params;

        await validateHero(heroId);
        const result = await statService.resetStatAllocation(parseInt(heroId));

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/stats/:heroId/recovery
 * Get HP/Mana/Vitality recovery stats and TTF
 */
router.get('/:heroId/recovery', async (req, res) => {
    try {
        const { heroId } = req.params;

        await validateHero(heroId);
        const result = await statService.getRecoveryStats(parseInt(heroId));

        res.json({ success: true, data: result });
    } catch (error) {
        res.status(404).json({ success: false, error: error.message });
    }
});

/**
 * POST /api/admin/stats/recalculate-all
 * Bulk recalculation (Admin)
 */
router.post('/admin/recalculate-all', async (req, res) => {
    try {
        const result = await statService.recalculateAllHeroes();
        res.json({ success: true, data: result });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

/**
 * GET /api/stats/:heroId/capabilities
 * Get stat caps, available points, growth info
 */
router.get('/:heroId/capabilities', async (req, res) => {
    try {
        const { heroId } = req.params;

        await validateHero(heroId);

        const capabilities = await statService.getStatCapabilities(parseInt(heroId));

        res.json({
            success: true,
            data: capabilities
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stats/elemental/:heroId
 * Get elemental affinities, resistances, bonus damage
 */
router.get('/elemental/:heroId', async (req, res) => {
    try {
        const { heroId } = req.params;

        await validateHero(heroId);

        const elemental = await statService.getElementalStats(parseInt(heroId));

        res.json({
            success: true,
            data: elemental
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stats/sets/:heroId
 * Get equipped sets, active bonuses, synergy info
 */
router.get('/sets/:heroId', async (req, res) => {
    try {
        const { heroId } = req.params;

        await validateHero(heroId);

        const sets = await statService.getSetBonuses(parseInt(heroId));

        res.json({
            success: true,
            data: sets
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stats/equipment/:heroId
 * Get equipment stat bonuses, quality modifiers, durability impact
 */
router.get('/equipment/:heroId', async (req, res) => {
    try {
        const { heroId } = req.params;

        await validateHero(heroId);

        const equipment = await statService.getEquipmentStats(parseInt(heroId));

        res.json({
            success: true,
            data: equipment
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/stats/:heroId/predict/:targetLevel
 * Predict stats at target level
 */
router.get('/:heroId/predict/:targetLevel', async (req, res) => {
    try {
        const { heroId, targetLevel } = req.params;

        await validateHero(heroId);

        const prediction = await statService.predictStatsAtLevel(
            parseInt(heroId),
            parseInt(targetLevel)
        );

        res.json({
            success: true,
            data: prediction
        });
    } catch (error) {
        res.status(404).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
