/**
 * Skill Mastery API Controller
 * Handles requests for skill mastery data
 */
const express = require('express');
const router = express.Router();
const skillMasteryService = require('../services/skill/SkillMasteryService');

const { requireAuth } = require('../middleware/auth');


/**
 * GET /api/skill-mastery/:heroId
 * Get all mastery data for a hero
 */
router.get('/:heroId', requireAuth, async (req, res) => {
    try {
        const heroId = parseInt(req.params.heroId);
        
        if (isNaN(heroId)) {
            return res.status(400).json({ error: 'Invalid heroId' });
        }

        const masteries = await skillMasteryService.getHeroMasteries(heroId);
        
        res.json({
            success: true,
            heroId,
            masteries
        });
    } catch (error) {
        console.error('[SkillMasteryAPI] Error:', error);
        res.status(500).json({ error: 'Failed to get skill mastery data' });
    }
});

/**
 * GET /api/skill-mastery/:heroId/:skillId
 * Get mastery data for a specific skill
 */
router.get('/:heroId/:skillId', requireAuth, async (req, res) => {
    try {
        const heroId = parseInt(req.params.heroId);
        const skillId = parseInt(req.params.skillId);
        
        if (isNaN(heroId) || isNaN(skillId)) {
            return res.status(400).json({ error: 'Invalid heroId or skillId' });
        }

        const mastery = await skillMasteryService.getMastery(heroId, skillId);
        
        res.json({
            success: true,
            heroId,
            skillId,
            mastery
        });
    } catch (error) {
        console.error('[SkillMasteryAPI] Error:', error);
        res.status(500).json({ error: 'Failed to get skill mastery data' });
    }
});

/**
 * GET /api/skill-mastery/bonuses/:level
 * Get bonus values for a mastery level
 */
router.get('/bonuses/:level', async (req, res) => {
    try {
        const level = req.params.level.toUpperCase();
        const bonuses = skillMasteryService.getBonuses(level);
        
        res.json({
            success: true,
            level,
            bonuses
        });
    } catch (error) {
        console.error('[SkillMasteryAPI] Error:', error);
        res.status(500).json({ error: 'Failed to get bonus data' });
    }
});

module.exports = router;
