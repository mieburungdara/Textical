const sessionService = require('../services/sessionService');
const logger = require('../utils/logger');

/**
 * requireAuth middleware
 * Validates the session token from headers
 */
const requireAuth = async (req, res, next) => {
    const token = req.headers['x-session-token'];

    if (!token) {
        logger.warn('[Auth Middleware] No session token provided');
        return res.status(401).json({ 
            success: false, 
            error: 'Authentication required' 
        });
    }

    try {
        const session = await sessionService.validateSession(token);
        
        if (!session) {
            logger.warn('[Auth Middleware] Invalid or expired session token', { token: token.substring(0, 8) });
            return res.status(401).json({ 
                success: false, 
                error: 'Invalid or expired session' 
                });
        }

        // Add user info to request
        req.user = {
            id: session.userId,
            token: token
        };

        next();
    } catch (error) {
        logger.error('[Auth Middleware] Error validating session:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Internal server error during authentication' 
        });
    }
};

module.exports = { requireAuth, authMiddleware: requireAuth };

