const { v4: uuidv4 } = require('uuid');
const prisma = require('../db');

// Session configuration
const SESSION_CONFIG = {
    ABSOLUTE_EXPIRY: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    INACTIVITY_EXPIRY: 24 * 60 * 60 * 1000,     // 24 hours of inactivity
};

/**
 * SessionService - Manages user sessions for single-device login enforcement
 */
class SessionService {
    /**
     * Create a new session for a user, optionally invalidating existing ones
     * @param {number} userId - The user ID
     * @param {string} deviceInfo - Human-readable device information
     * @param {string} ipAddress - IP address of the client
     * @param {string} userAgent - User agent string
     * @param {boolean} invalidateExisting - Whether to invalidate existing sessions
     * @returns {Promise<Object>} The created session
     */
    async createSession(userId, deviceInfo, ipAddress, userAgent = null, invalidateExisting = true) {
        const token = uuidv4();
        const now = new Date();
        const expiresAt = new Date(now.getTime() + SESSION_CONFIG.ABSOLUTE_EXPIRY);

        // Determine device type from user agent
        const deviceType = this._detectDeviceType(userAgent);

        // Determine device ID
        const deviceId = this._generateDeviceId(userId, ipAddress, userAgent);

        // If single-device mode is enabled, invalidate all existing sessions for this user
        if (invalidateExisting) {
            await this.invalidateAllUserSessions(userId, null);
        }

        // Create new session
        const session = await prisma.userSession.create({
            data: {
                userId,
                deviceId,
                deviceInfo,
                deviceType,
                ipAddress,
                userAgent,
                token,
                expiresAt,
                isActive: true
            }
        });

        console.log(`[SESSION] Created new session for user ${userId}, token: ${token.substring(0, 8)}...`);
        return session;
    }

    /**
     * Validate a session token
     * @param {string} token - The session token to validate
     * @returns {Promise<Object|null>} The session if valid, null otherwise
     */
    async validateSession(token) {
        if (!token) return null;

        const session = await prisma.userSession.findUnique({
            where: { token }
        });

        if (!session) {
            console.log(`[SESSION] Token validation failed: token not found`);
            return null;
        }

        // Check if session is active
        if (!session.isActive) {
            console.log(`[SESSION] Token validation failed: session inactive`);
            return null;
        }

        // Check if session has expired
        const now = new Date();
        if (new Date(session.expiresAt) < now) {
            console.log(`[SESSION] Token validation failed: session expired`);
            return null;
        }

        // Check inactivity timeout
        const lastActive = new Date(session.lastActiveAt);
        if (now.getTime() - lastActive.getTime() > SESSION_CONFIG.INACTIVITY_EXPIRY) {
            console.log(`[SESSION] Token validation failed: session inactive for too long`);
            await this.invalidateSession(token);
            return null;
        }

        return session;
    }

    /**
     * Get session by user ID (the currently active one)
     * @param {number} userId - The user ID
     * @returns {Promise<Object|null>} The active session or null
     */
    async getActiveSessionByUserId(userId) {
        const session = await prisma.userSession.findFirst({
            where: {
                userId,
                isActive: true,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });
        return session;
    }

    /**
     * Update heartbeat for a session
     * @param {string} token - The session token
     * @returns {Promise<Object>} The updated session
     */
    async heartbeat(token) {
        const session = await prisma.userSession.update({
            where: { token },
            data: {
                lastActiveAt: new Date(),
                lastHeartbeat: new Date()
            }
        });
        return session;
    }

    /**
     * Invalidate a specific session
     * @param {string} token - The session token to invalidate
     * @returns {Promise<Object>} The invalidated session
     */
    async invalidateSession(token) {
        const session = await prisma.userSession.update({
            where: { token },
            data: { isActive: false }
        });
        console.log(`[SESSION] Invalidated session: ${token.substring(0, 8)}...`);
        return session;
    }

    /**
     * Invalidate all sessions for a user, optionally except one
     * @param {number} userId - The user ID
     * @param {string|null} exceptToken - Token to keep active (null to invalidate all)
     * @returns {Promise<number>} Number of sessions invalidated
     */
    async invalidateAllUserSessions(userId, exceptToken = null) {
        const whereClause = {
            userId,
            isActive: true
        };

        if (exceptToken) {
            whereClause.token = { not: exceptToken };
        }

        const result = await prisma.userSession.updateMany({
            where: whereClause,
            data: { isActive: false }
        });

        if (result.count > 0) {
            console.log(`[SESSION] Invalidated ${result.count} sessions for user ${userId}`);
        }
        return result.count;
    }

    /**
     * Get all active sessions for a user
     * @param {number} userId - The user ID
     * @returns {Promise<Array>} Array of active sessions
     */
    async getUserSessions(userId) {
        const sessions = await prisma.userSession.findMany({
            where: {
                userId,
                isActive: true,
                expiresAt: { gt: new Date() }
            },
            orderBy: { createdAt: 'desc' }
        });
        return sessions;
    }

    /**
     * Cleanup expired sessions
     * @returns {Promise<number>} Number of sessions cleaned up
     */
    async cleanupExpiredSessions() {
        const result = await prisma.userSession.deleteMany({
            where: {
                expiresAt: { lt: new Date() }
            }
        });

        if (result.count > 0) {
            console.log(`[SESSION] Cleaned up ${result.count} expired sessions`);
        }
        return result.count;
    }

    /**
     * Get session by token
     * @param {string} token - The session token
     * @returns {Promise<Object|null>} The session or null
     */
    async getSessionByToken(token) {
        return await prisma.userSession.findUnique({
            where: { token }
        });
    }

    /**
     * Detect device type from user agent string
     * @param {string|null} userAgent - The user agent string
     * @returns {string} The device type
     */
    _detectDeviceType(userAgent) {
        if (!userAgent) return 'UNKNOWN';

        const ua = userAgent.toLowerCase();
        if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
            return 'MOBILE';
        }
        if (ua.includes('tablet') || ua.includes('ipad')) {
            return 'TABLET';
        }
        return 'DESKTOP';
    }

    /**
     * Generate a device ID based on user, IP and user agent
     * @param {number} userId - The user ID
     * @param {string} ipAddress - IP address
     * @param {string|null} userAgent - User agent string
     * @returns {string} The device ID
     */
    _generateDeviceId(userId, ipAddress, userAgent) {
        const crypto = require('crypto');
        const data = `${userId}-${ipAddress}-${userAgent || 'unknown'}`;
        return crypto.createHash('md5').update(data).digest('hex').substring(0, 16);
    }
}

module.exports = new SessionService();
