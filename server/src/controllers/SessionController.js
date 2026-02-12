const BaseController = require('./BaseController');
const sessionService = require('../services/sessionService');
const socketService = require('../services/socketService');
const authService = require('../services/AuthenticationService');

class SessionController extends BaseController {
    async login(req, res) {
        await this.execute(res, async () => {
            const { username, password, deviceInfo } = req.body;
            const ipAddress = req.ip || req.connection?.remoteAddress || 'unknown';
            const userAgent = req.headers['user-agent'];
            
            // Delegate authentication to AuthenticationService
            const user = await authService.validateCredentials(username, password, ipAddress, userAgent);
            await authService.recordSuccess(user.id, username, ipAddress, userAgent);
            
            // Handle existing sessions and create new one
            const existingSession = await sessionService.getActiveSessionByUserId(user.id);
            
            if (existingSession) {
                const existingSocketId = socketService.getSocketIdBySessionToken(existingSession.token);
                
                if (existingSocketId) {
                    socketService.emitToSocket(existingSocketId, "session_disconnecting", {
                        reason: "new_login",
                        message: "New login detected on another device"
                    });
                    
                    console.log(`[LOGIN] Existing session detected for user ${user.id}, waiting 5s before disconnect...`);
                    await new Promise(resolve => setTimeout(resolve, 5000));
                    
                    socketService.disconnectSocket(existingSocketId, "new_login");
                    await sessionService.invalidateSession(existingSession.token);
                    
                    console.log(`[LOGIN] Old session disconnected for user ${user.id}`);
                }
            }
            
            const session = await sessionService.createSession(
                user.id,
                deviceInfo || 'Unknown Device',
                ipAddress,
                userAgent
            );
            
            console.log(`[LOGIN] User ${username} logged in successfully from ${ipAddress}`);
            
            this.sendSuccess(res, {
                user,
                session: {
                    token: session.token,
                    deviceId: session.deviceId,
                    deviceType: session.deviceType,
                    createdAt: session.createdAt,
                    expiresAt: session.expiresAt
                }
            });
        });
    }

    async logout(req, res) {
        await this.execute(res, async () => {
            const token = req.headers['x-session-token'];
            const { all } = req.body || {};
            
            if (!token) {
                return this.sendError(res, "No session token provided", 400);
            }
            
            const session = await sessionService.validateSession(token);
            if (!session) {
                return this.sendError(res, "Invalid or expired session", 401);
            }
            
            if (all) {
                // Logout from all devices
                const count = await sessionService.invalidateAllUserSessions(session.userId, null);
                // Also disconnect all sockets for this user
                socketService.disconnectAllUserSockets(session.userId, "logout_all");
                this.sendSuccess(res, { message: `Logged out from ${count} sessions` });
            } else {
                // Logout from current device only
                await sessionService.invalidateSession(token);
                socketService.disconnectSocketByToken(token, "logout");
                this.sendSuccess(res, { message: "Logged out successfully" });
            }
        });
    }

    async getActiveSessions(req, res) {
        await this.execute(res, async () => {
            const token = req.headers['x-session-token'];
            
            if (!token) {
                return this.sendError(res, "No session token provided", 400);
            }
            
            const session = await sessionService.validateSession(token);
            if (!session) {
                return this.sendError(res, "Invalid or expired session", 401);
            }
            
            const sessions = await sessionService.getUserSessions(session.userId);
            
            const formattedSessions = sessions.map(s => ({
                id: s.id,
                deviceId: s.deviceId,
                deviceInfo: s.deviceInfo,
                deviceType: s.deviceType,
                ipAddress: s.ipAddress,
                isCurrent: s.token === token,
                createdAt: s.createdAt,
                lastActiveAt: s.lastActiveAt,
                expiresAt: s.expiresAt
            }));
            
            this.sendSuccess(res, { sessions: formattedSessions });
        });
    }
}

module.exports = new SessionController();
