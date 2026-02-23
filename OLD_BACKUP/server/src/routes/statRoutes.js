/**
 * Stat Routes
 * REST endpoints untuk hero stat management
 */
const express = require('express');
const router = express.Router();
const statService = require('../services/statService');
const { 
    validateHero, 
    validateCalculationOptions 
} = require('../middleware/statValidator');

/**
 * Helper to handle async route errors
 * @param {Function} fn - Async route handler function.
 * @returns {Function} Express middleware function.
 */
const asyncHandler = fn => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * Standardized success response handler
 * @param {Object} res - Express response object.
 * @param {any} data - Data to send in response.
 * @returns {Object} JSON response.
 */
const handleResponse = (res, data) => res.json({ success: true, data });

/**
 * POST /api/stats/calculate
 * Calculate stats with context/environment
 */
router.post('/calculate', 
    validateHero, 
    validateCalculationOptions, 
    asyncHandler(async (req, res) => {
        const { context, environment, includeBreakdown } = req.body;
        const heroId = req.hero.id;

        const result = includeBreakdown 
            ? await statService.calculateStatsWithBreakdown(heroId, { ...context, ...environment })
            : await statService.calculateHeroStats(heroId, { ...context, ...environment });

        handleResponse(res, result);
    })
);

/**
 * GET /api/stats/metadata
 * Get stat formulas and caps metadata
 */
router.get('/metadata', asyncHandler(async (req, res) => {
    const metadata = statService.getStatMetadata();
    handleResponse(res, metadata);
}));

/**
 * GET /api/stats/:heroId
 * Get complete hero stats with breakdown
 */
router.get('/:heroId', 
    validateHero, 
    asyncHandler(async (req, res) => {
        const { forceRecalculate } = req.query;
        const stats = await statService.calculateStatsWithBreakdown(req.hero.id, {
            forceRecalculate: forceRecalculate === 'true'
        });
        handleResponse(res, stats);
    })
);

/**
 * GET /api/stats/:heroId/history
 * Get hero stat history (level ups, stat changes)
 */
router.get('/:heroId/history', 
    validateHero, 
    asyncHandler(async (req, res) => {
        const limit = parseInt(req.query.limit) || 50;
        const offset = parseInt(req.query.offset) || 0;
        const history = await statService.getStatHistory(req.hero.id, { limit, offset });

        res.json({
            success: true,
            data: history,
            pagination: { limit, offset }
        });
    })
);


/**
 * POST /api/stats/:heroId/preview
 * Preview/Simulate stat changes
 */
router.post('/:heroId/preview', 
    validateHero, 
    asyncHandler(async (req, res) => {
        const { additions, context } = req.body;
        const result = await statService.simulateStats(req.hero.id, additions, context);
        handleResponse(res, result);
    })
);


/**
 * GET /api/stats/:heroId/recovery
 * Get HP/Mana/Vitality recovery stats and TTF
 */
router.get('/:heroId/recovery', 
    validateHero, 
    asyncHandler(async (req, res) => {
        const result = await statService.getRecoveryStats(req.hero.id);
        handleResponse(res, result);
    })
);

/**
 * POST /api/admin/stats/recalculate-all
 * Bulk recalculation (Admin)
 */
router.post('/admin/recalculate-all', asyncHandler(async (req, res) => {
    const result = await statService.recalculateAllHeroes();
    handleResponse(res, result);
}));

/**
 * GET /api/stats/:heroId/capabilities
 * Get stat caps, available points, growth info
 */
router.get('/:heroId/capabilities', 
    validateHero, 
    asyncHandler(async (req, res) => {
        const capabilities = await statService.getStatCapabilities(req.hero.id);
        handleResponse(res, capabilities);
    })
);

/**
 * GET /api/stats/elemental/:heroId
 * Get elemental affinities, resistances, bonus damage
 */
router.get('/elemental/:heroId', 
    validateHero, 
    asyncHandler(async (req, res) => {
        const elemental = await statService.getElementalStats(req.hero.id);
        handleResponse(res, elemental);
    })
);

/**
 * GET /api/stats/sets/:heroId
 * Get equipped sets, active bonuses, synergy info
 */
router.get('/sets/:heroId', 
    validateHero, 
    asyncHandler(async (req, res) => {
        const sets = await statService.getSetBonuses(req.hero.id);
        handleResponse(res, sets);
    })
);

/**
 * GET /api/stats/equipment/:heroId
 * Get equipment stat bonuses, quality modifiers, durability impact
 */
router.get('/equipment/:heroId', 
    validateHero, 
    asyncHandler(async (req, res) => {
        const equipment = await statService.getEquipmentStats(req.hero.id);
        handleResponse(res, equipment);
    })
);

/**
 * GET /api/stats/:heroId/predict/:targetLevel
 * Predict stats at target level
 */
router.get('/:heroId/predict/:targetLevel', 
    validateHero, 
    asyncHandler(async (req, res) => {
        const { targetLevel } = req.params;
        const prediction = await statService.predictStatsAtLevel(
            req.hero.id,
            parseInt(targetLevel)
        );
        handleResponse(res, prediction);
    })
);

/**
 * GET /api/stats/growth/:className
 * Get growth information for a specific class
 */
router.get('/growth/:className', asyncHandler(async (req, res) => {
    const { className } = req.params;
    const growthInfo = statService.getGrowthInfo(className);
    handleResponse(res, growthInfo);
}));

/**
 * GET /api/stats/formula/:className/:statKey
 * Explain the formula for a specific stat
 */
router.get('/formula/:className/:statKey', asyncHandler(async (req, res) => {
    const { className, statKey } = req.params;
    const formula = statService.explainStatFormula(className, statKey);
    handleResponse(res, { className, statKey, formula });
}));

/**
 * GET /api/stats/fixed-growth/:className/:level
 * Calculate fixed stats for a class at a specific level
 */
router.get('/fixed-growth/:className/:level', asyncHandler(async (req, res) => {
    const { className, level } = req.params;
    const stats = statService.calculateFixedStats(className, parseInt(level));
    handleResponse(res, stats);
}));

/**
 * Error handler for this router
 */
router.use((err, req, res, next) => {
    console.error(`[StatRoutes Error] ${err.message}`);
    const statusCode = err.status || (err.message.includes('not found') ? 404 : 400);
    res.status(statusCode).json({ success: false, error: err.message });
});

module.exports = router;
