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
    validateCalculationOptions
};
