const { Server } = require('socket.io');
const sessionService = require('./sessionService');
const socketRouter = require('./socketRouter');
const logger = require('../utils/logger');

/**
 * SocketService - Manages real-time connections via Socket.io
 */
class SocketService {
    constructor() {
        this.io = null;
        this.userSockets = new Map(); // userId -> Set of socketIds
        this.socketSessions = new Map(); // socketId -> session token
    }

    /**
     * Initializes the Socket.io server
     * @param {Object} server - The HTTP server instance
     */
    init(server) {
        this.io = new Server(server, {
            cors: {
                origin: "*",
                methods: ["GET", "POST"]
            }
        });

        this.io.use(async (socket, next) => {
            const token = socket.handshake.auth.token || socket.handshake.headers['x-session-token'];
            
            if (!token) {
                return next(new Error("Authentication required"));
            }

            try {
                const session = await sessionService.validateSession(token);
                if (!session) {
                    return next(new Error("Invalid or expired session"));
                }

                socket.userId = session.userId;
                socket.sessionToken = token;
                next();
            } catch (error) {
                logger.error("[SOCKET] Auth error:", error);
                next(new Error("Internal server error"));
            }
        });

        this.io.on('connection', (socket) => {
            const userId = socket.userId;
            const token = socket.sessionToken;

            logger.info(`[SOCKET] User ${userId} connected (socket: ${socket.id})`);

            // Track socket
            if (!this.userSockets.has(userId)) {
                this.userSockets.set(userId, new Set());
            }
            this.userSockets.get(userId).add(socket.id);
            this.socketSessions.set(socket.id, token);

            // Register handlers
            socketRouter.registerHandlers(this.io, socket, userId);

            socket.on('disconnect', () => {
                logger.info(`[SOCKET] User ${userId} disconnected (socket: ${socket.id})`);
                
                const sockets = this.userSockets.get(userId);
                if (sockets) {
                    sockets.delete(socket.id);
                    if (sockets.size === 0) {
                        this.userSockets.delete(userId);
                    }
                }
                this.socketSessions.delete(socket.id);
            });
        });

        logger.info("[SOCKET] Socket.io system initialized");
    }

    /**
     * Finds a socketId by session token
     * @param {string} token 
     * @returns {string|null}
     */
    getSocketIdBySessionToken(token) {
        for (const [socketId, t] of this.socketSessions.entries()) {
            if (t === token) return socketId;
        }
        return null;
    }

    /**
     * Emits an event to a specific socket
     */
    emitToSocket(socketId, event, data) {
        if (this.io) {
            this.io.to(socketId).emit(event, data);
        }
    }

    /**
     * Disconnects a specific socket
     */
    disconnectSocket(socketId, reason = "unknown") {
        const socket = this.io?.sockets.sockets.get(socketId);
        if (socket) {
            socket.disconnect(true);
            logger.info(`[SOCKET] Disconnected socket ${socketId} (reason: ${reason})`);
        }
    }

    /**
     * Disconnects all sockets for a user
     */
    disconnectAllUserSockets(userId, reason = "unknown") {
        const sockets = this.userSockets.get(userId);
        if (sockets) {
            for (const socketId of sockets) {
                this.disconnectSocket(socketId, reason);
            }
        }
    }

    /**
     * Disconnects socket by token
     */
    disconnectSocketByToken(token, reason = "unknown") {
        const socketId = this.getSocketIdBySessionToken(token);
        if (socketId) {
            this.disconnectSocket(socketId, reason);
        }
    }
}

module.exports = new SocketService();
