/**
 * Stat Validator Middleware
 * Handles validation for hero stats related requests.
 */
const heroRepository = require('../repositories/heroRepository');

/**
 * Middleware to validate if hero exists and attach it to request object.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 * @returns {Promise<void>}
 */
const validateHero = async (req, res, next) => {
    try {
        const heroId = req.params.heroId || req.body.heroId;
        const id = parseInt(heroId);
        
        if (isNaN(id)) {
            return res.status(400).json({ success: false, error: 'Invalid Hero ID' });
        }

        const hero = await heroRepository.findById(id);
        if (!hero) {
            return res.status(404).json({ success: false, error: 'Hero not found' });
        }

        req.hero = hero;
        next();
    } catch (error) {
        const message = error instanceof Error ? error.message : 'Unknown error';
        res.status(500).json({ success: false, error: message });
    }
};

/**
 * Middleware to validate allocation payload.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const validateAllocation = (req, res, next) => {
    const { statName, points } = req.body;
    
    if (!statName || typeof statName !== 'string') {
        return res.status(400).json({ success: false, error: 'Valid stat name is required' });
    }
    
    if (points === undefined || isNaN(parseInt(points)) || parseInt(points) <= 0) {
        return res.status(400).json({ success: false, error: 'Positive point allocation is required' });
    }
    
    next();
};

/**
 * Middleware to validate batch allocation payload.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const validateBatchAllocation = (req, res, next) => {
    const { batch } = req.body;
    
    if (!batch || typeof batch !== 'object' || Object.keys(batch).length === 0) {
        return res.status(400).json({ success: false, error: 'Non-empty batch allocation data is required' });
    }
    
    next();
};

/**
 * Middleware to validate calculation options.
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 * @param {Function} next - Express next middleware function.
 */
const validateCalculationOptions = (req, res, next) => {
    const { context, environment } = req.body;
    
    if (context && typeof context !== 'object') {
        return res.status(400).json({ success: false, error: 'Context must be an object' });
    }
    
    if (environment && typeof environment !== 'object') {
        return res.status(400).json({ success: false, error: 'Environment must be an object' });
    }
    
    next();
};

module.exports = {
    validateHero,
    validateAllocation,
    validateBatchAllocation,
    validateCalculationOptions
};
