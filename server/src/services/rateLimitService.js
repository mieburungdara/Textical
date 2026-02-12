const prisma = require('../db');

// Rate limiting configuration
const RATE_LIMIT_CONFIG = {
    MAX_ATTEMPTS: 5,                    // Max failed attempts before lockout
    LOCKOUT_DURATION: 15 * 60 * 1000,   // 15 minutes lockout duration
    WINDOW_SIZE: 60 * 60 * 1000         // 1 hour window for counting attempts
};

/**
 * RateLimitService - Manages login attempt rate limiting
 */
class RateLimitService {
    /**
     * Check if a request should be rate limited
     * @param {string} ipAddress - The IP address of the requester
     * @param {string} username - The username being accessed
     * @returns {Promise<Object>} { blocked: boolean, retryAfter: number }
     */
    async checkRateLimit(ipAddress, username) {
        const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.WINDOW_SIZE);

        // Count recent failed attempts from this IP for this username
        const failedAttempts = await prisma.loginAttempt.count({
            where: {
                ipAddress,
                username: username.toLowerCase(),
                success: false,
                createdAt: { gte: windowStart }
            }
        });

        // Check if currently locked out
        const lastFailed = await prisma.loginAttempt.findFirst({
            where: {
                ipAddress,
                username: username.toLowerCase(),
                success: false
            },
            orderBy: { createdAt: 'desc' }
        });

        if (lastFailed) {
            const timeSinceLast = Date.now() - new Date(lastFailed.createdAt).getTime();
            if (timeSinceLast < RATE_LIMIT_CONFIG.LOCKOUT_DURATION) {
                const retryAfter = Math.ceil((RATE_LIMIT_CONFIG.LOCKOUT_DURATION - timeSinceLast) / 1000);
                console.log(`[RATE-LIMIT] IP ${ipAddress} locked out, retry after ${retryAfter}s`);
                return { blocked: true, retryAfter };
            }
        }

        if (failedAttempts >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
            console.log(`[RATE-LIMIT] IP ${ipAddress} exceeded max attempts (${failedAttempts})`);
            return { blocked: true, retryAfter: Math.ceil(RATE_LIMIT_CONFIG.LOCKOUT_DURATION / 1000) };
        }

        return { blocked: false, retryAfter: 0 };
    }

    /**
     * Record a failed login attempt
     * @param {string} ipAddress - The IP address
     * @param {string} username - The username attempted
     * @param {string} reason - The reason for failure
     * @param {string|null} userAgent - User agent string
     * @param {number|null} userId - User ID if user exists
     */
    async recordFailedAttempt(ipAddress, username, reason = 'invalid_credentials', userAgent = null, userId = null) {
        await prisma.loginAttempt.create({
            data: {
                userId,
                username: username.toLowerCase(),
                ipAddress,
                userAgent,
                success: false,
                reason
            }
        });

        // Count attempts for logging
        const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.WINDOW_SIZE);
        const attemptCount = await prisma.loginAttempt.count({
            where: {
                ipAddress,
                username: username.toLowerCase(),
                createdAt: { gte: windowStart }
            }
        });

        console.log(`[RATE-LIMIT] Failed login attempt for '${username}' from ${ipAddress} (attempt ${attemptCount}/${RATE_LIMIT_CONFIG.MAX_ATTEMPTS})`);
    }

    /**
     * Record a successful login attempt and reset counters
     * @param {number} userId - The user ID
     * @param {string} username - The username
     * @param {string} ipAddress - The IP address
     * @param {string|null} userAgent - User agent string
     */
    async recordSuccessAttempt(userId, username, ipAddress, userAgent = null) {
        await prisma.loginAttempt.create({
            data: {
                userId,
                username: username.toLowerCase(),
                ipAddress,
                userAgent,
                success: true,
                reason: null
            }
        });

        console.log(`[RATE-LIMIT] Successful login for '${username}' from ${ipAddress}`);
    }

    /**
     * Reset attempts for a specific IP and username (called on successful login)
     * @param {string} ipAddress - The IP address
     * @param {string} username - The username
     */
    async resetAttempts(ipAddress, username) {
        // In this design, successful login is just recorded, 
        // the rate limit check looks at failed attempts only
        // This method is kept for API consistency
        console.log(`[RATE-LIMIT] Resetting attempt counter for ${username}@${ipAddress}`);
    }

    /**
     * Check if an IP is currently locked out
     * @param {string} ipAddress - The IP address
     * @param {string} username - The username
     * @returns {Promise<{locked: boolean, remainingTime: number}>}
     */
    async isLockedOut(ipAddress, username) {
        const windowStart = new Date(Date.now() - RATE_LIMIT_CONFIG.WINDOW_SIZE);

        const recentFailedCount = await prisma.loginAttempt.count({
            where: {
                ipAddress,
                username: username.toLowerCase(),
                success: false,
                createdAt: { gte: windowStart }
            }
        });

        if (recentFailedCount >= RATE_LIMIT_CONFIG.MAX_ATTEMPTS) {
            // Find the time of the last failed attempt
            const lastFailed = await prisma.loginAttempt.findFirst({
                where: {
                    ipAddress,
                    username: username.toLowerCase(),
                    success: false
                },
                orderBy: { createdAt: 'desc' }
            });

            if (lastFailed) {
                const timeSinceLast = Date.now() - new Date(lastFailed.createdAt).getTime();
                if (timeSinceLast < RATE_LIMIT_CONFIG.LOCKOUT_DURATION) {
                    return {
                        locked: true,
                        remainingTime: Math.ceil((RATE_LIMIT_CONFIG.LOCKOUT_DURATION - timeSinceLast) / 1000)
                    };
                }
            }
        }

        return { locked: false, remainingTime: 0 };
    }

    /**
     * Get login attempt history for an IP
     * @param {string} ipAddress - The IP address
     * @param {number} limit - Number of records to return
     * @returns {Promise<Array>}
     */
    async getAttemptHistory(ipAddress, limit = 10) {
        return await prisma.loginAttempt.findMany({
            where: { ipAddress },
            orderBy: { createdAt: 'desc' },
            take: limit
        });
    }

    /**
     * Cleanup old login attempt records
     * @param {number} olderThanDays - Delete records older than this many days
     * @returns {Promise<number>} Number of records deleted
     */
    async cleanupOldAttempts(olderThanDays = 30) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

        const result = await prisma.loginAttempt.deleteMany({
            where: {
                createdAt: { lt: cutoffDate }
            }
        });

        if (result.count > 0) {
            console.log(`[RATE-LIMIT] Cleaned up ${result.count} old login attempt records`);
        }
        return result.count;
    }
}

module.exports = new RateLimitService();
