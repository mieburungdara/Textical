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
 * Body: { statName, points, confirm }
 */
router.post('/:heroId/allocate', async (req, res) => {
    try {
        const { heroId } = req.params;
        const { statName, points, confirm } = req.body;

        // Validation
        if (!statName || typeof points !== 'number' || points <= 0) {
            return res.status(400).json({
                success: false,
                error: 'Invalid request. Required: statName, points (positive number)'
            });
        }

        const validStats = ['str', 'dex', 'int', 'vit', 'luk'];
        if (!validStats.includes(statName)) {
            return res.status(400).json({
                success: false,
                error: `Invalid statName. Must be one of: ${validStats.join(', ')}`
            });
        }

        await validateHero(heroId);

        const result = await statService.allocateStat(parseInt(heroId), statName, points, {
            confirm: confirm === true
        });

        res.json({
            success: true,
            data: result
        });
    } catch (error) {
        const statusCode = error.message.includes('not found') ? 404 :
                          error.message.includes('Insufficient') ? 400 :
                          error.message.includes('cap') ? 400 : 500;

        res.status(statusCode).json({
            success: false,
            error: error.message
        });
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
