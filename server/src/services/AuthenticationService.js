/**
 * AuthenticationService
 * Handles user authentication logic.
 * Follows SRP - only responsible for authentication (username/password validation).
 */

const prisma = require('../db');
const rateLimitService = require('./rateLimitService');

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
        if (!username || !password) {
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
        const user = await prisma.user.findUnique({
            where: { username: username.toLowerCase() }
        });

        if (!user) {
            await rateLimitService.recordFailedAttempt(ipAddress, username, 'user_not_found', userAgent);
            throw { status: 401, message: "Invalid username or password" };
        }

        // Password check
        if (user.password !== password) {
            await rateLimitService.recordFailedAttempt(ipAddress, username, 'invalid_password', userAgent, user.id);
            throw { status: 401, message: "Invalid username or password" };
        }

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
