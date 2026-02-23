/**
 * AuthenticationService
 * Handles user authentication logic.
 * Follows SRP - only responsible for authentication (username/password validation).
 */

const prisma = require('../db');
const rateLimitService = require('./rateLimitService');
const bcrypt = require('bcryptjs');
const logger = require('../utils/logger');

class AuthenticationService {
    /**
     * Validate user credentials
     * @param {string} username - Username
     * @param {string} password - Password
     * @param {string} ipAddress - Client IP address
     * @param {string} userAgent - Client user agent
     * @returns {Object} { user, error } or throws error
     */
    async validateCredentials(username, password, ipAddress, userAgent) {
        logger.info(`[AUTH_SERVICE] Validating credentials for: ${username}`, { ipAddress });
        
        if (!username || !password) {
            logger.warn(`[AUTH_SERVICE] Missing credentials for: ${username}`);
            throw { status: 400, message: "Username and password are required" };
        }

        // Rate limiting check
        const isRateLimitDisabled = process.env.DISABLE_AUTH_RATE_LIMIT === 'true';
        const rateLimit = await rateLimitService.checkRateLimit(ipAddress, username);
        
        if (rateLimit.blocked && !isRateLimitDisabled) {
            throw {
                status: 429,
                message: "Too many failed login attempts. Please try again later.",
                retryAfter: rateLimit.retryAfter
            };
        } else if (rateLimit.blocked && isRateLimitDisabled) {
            console.log(`[AUTH] Rate limit blocked for ${username} (${ipAddress}), but Bypassed due to DISABLE_AUTH_RATE_LIMIT=true`);
        }


        // Find user
        const lowercaseUsername = username.toLowerCase();
        const user = await prisma.user.findUnique({
            where: { username: lowercaseUsername }
        });

        if (!user) {
            logger.warn(`[AUTH_SERVICE] User not found: ${lowercaseUsername}`);
            await rateLimitService.recordFailedAttempt(ipAddress, username, 'user_not_found', userAgent);
            throw { status: 401, message: "Invalid username or password (U)" };
        }

        // Password check using bcrypt
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            logger.warn(`[AUTH_SERVICE] Invalid password for user: ${lowercaseUsername}`);
            await rateLimitService.recordFailedAttempt(ipAddress, username, 'invalid_password', userAgent, user.id);
            throw { status: 401, message: "Invalid username or password (P)" };
        }

        logger.info(`[AUTH_SERVICE] Authentication successful for: ${lowercaseUsername}`);
        return user;
    }

    /**
     * Record successful login
     * @param {number} userId - User ID
     * @param {string} username - Username
     * @param {string} ipAddress - Client IP address
     * @param {string} userAgent - Client user agent
     */
    async recordSuccess(userId, username, ipAddress, userAgent) {
        await rateLimitService.recordSuccessAttempt(userId, username, ipAddress, userAgent);
    }
}

module.exports = new AuthenticationService();
