const { Server } = require("socket.io");
const sessionService = require('./sessionService');
const socketRouter = require('./socketRouter');

class SocketService {
    constructor() {
        this.io = null;
        this.userSockets = new Map(); // userId -> socketId
        this.socketToToken = new Map(); // socketId -> sessionToken
        this.socketToUser = new Map(); // socketId -> userId
    }

    init(server) {
        this.io = new Server(server, {
            cors: { origin: "*" }
        });

        this.io.on("connection", (socket) => {
            console.log(`[SOCKET] New connection: ${socket.id}`);

            socket.on("authenticate", async (data) => {
                try {
                    // Support both old format (userId only) and new format (userId + sessionToken)
                    let userId, sessionToken;
                    
                    if (typeof data === 'object' && data.sessionToken) {
                        userId = parseInt(data.userId);
                        sessionToken = data.sessionToken;
                    } else {
                        userId = parseInt(data);
                        sessionToken = null;
                    }
                    
                    // If new session-based auth, validate the token
                    if (sessionToken) {
                        const session = await sessionService.validateSession(sessionToken);
                        if (!session) {
                            socket.emit("session_invalid", { reason: "expired" });
                            console.log(`[SOCKET] Authentication failed for ${socket.id}: invalid session token`);
                            return;
                        }
                        
                        // Check if user already has an active socket
                        const existingSocketId = this.userSockets.get(userId);
                        if (existingSocketId && existingSocketId !== socket.id) {
                            // Send disconnect notification to old socket
                            this.emitToSocket(existingSocketId, "session_disconnecting", {
                                reason: "new_login",
                                message: "New login detected on another device"
                            });
                            
                            // Wait 5 seconds then disconnect old socket
                            setTimeout(() => {
                                this.disconnectSocket(existingSocketId, "new_login");
                            }, 5000);
                        }
                        
                        // Store session token mapping
                        this.socketToToken.set(socket.id, sessionToken);
                    }
                    
                    // Store user mapping
                    this.userSockets.set(userId, socket.id);
                    this.socketToUser.set(socket.id, userId);
                    socket.userId = userId;
                    socket.sessionToken = sessionToken;
                    
                    // Register handlers via SocketRouter
                    socketRouter.registerHandlers(this.io, socket, userId);

                    console.log(`[SOCKET] User ${userId} authenticated on socket ${socket.id}`);
                    socket.emit("authenticated", { userId, sessionToken }); // Confirm auth
                    
                } catch (error) {
                    console.error(`[SOCKET] Authentication error: ${error.message}`);
                    socket.emit("error", { message: "Authentication failed" });
                }
            });

            // Admin bypass login handler (DEVELOPMENT MODE ONLY)
            if (process.env.NODE_ENV === 'development') {
                socket.on("admin_bypass_login", async () => {
                    try {
                        // Use dev user ID 1 for bypass login
                        const devUserId = 1;
                        
                        // Store user mapping
                        this.userSockets.set(devUserId, socket.id);
                        this.socketToUser.set(socket.id, devUserId);
                        socket.userId = devUserId;
                        socket.sessionToken = null;
                        socket.isDevAdmin = true;
                        
                        // Register handlers via SocketRouter
                        socketRouter.registerHandlers(this.io, socket, devUserId);

                        console.log(`[SOCKET] Dev admin bypass login: User ${devUserId} authenticated on socket ${socket.id}`);
                        socket.emit("authenticated", { userId: devUserId, devMode: true });
                        
                    } catch (error) {
                        console.error(`[SOCKET] Admin bypass login error: ${error.message}`);
                        socket.emit("error", { message: "Admin bypass login failed" });
                    }
                });
            } else {
                // Production mode: log warning and ignore bypass attempts
                socket.on("admin_bypass_login", () => {
                    console.warn(`[SECURITY] Admin bypass login attempt blocked in ${process.env.NODE_ENV} mode`);
                    socket.emit("error", { message: "Admin bypass not available in production" });
                });
            }

            // Heartbeat handler
            socket.on("heartbeat", async (data) => {
                const token = data?.token || socket.sessionToken;
                if (token) {
                    await sessionService.heartbeat(token);
                }
            });



            socket.on("disconnect", () => {
                console.log(`[SOCKET] Disconnected: ${socket.id}`);
                
                // Lazy-load to avoid circular dependencies
                try {
                    const statHandler = require('../handlers/statHandler');
                    if (statHandler && typeof statHandler.removeClient === 'function') {
                        statHandler.removeClient(socket);
                    }
                } catch (e) {
                    console.error("[SOCKET] Failed to cleanup statHandler:", e.message);
                }
                
                // Get userId before cleanup
                const userId = socket.userId;
                const token = socket.sessionToken;
                
                // Cleanup mappings
                this.socketToToken.delete(socket.id);
                this.socketToUser.delete(socket.id);
                
                if (userId) {
                    // Only clear user socket mapping if this is the current socket for that user
                    if (this.userSockets.get(userId) === socket.id) {
                        this.userSockets.delete(userId);
                        console.log(`[SOCKET] User ${userId} socket cleared`);
                    }
                }
            });
        });
    }

    /**
     * Emit event to specific socket by socketId
     */
    emitToSocket(socketId, event, data) {
        if (this.io && socketId) {
            this.io.to(socketId).emit(event, data);
            return true;
        }
        return false;
    }

    /**
     * Get socketId by session token
     */
    getSocketIdBySessionToken(token) {
        for (let [socketId, sessionToken] of this.socketToToken.entries()) {
            if (sessionToken === token) {
                return socketId;
            }
        }
        return null;
    }

    /**
     * Disconnect a specific socket with reason
     */
    disconnectSocket(socketId, reason = "unknown") {
        if (this.io && socketId) {
            const userId = this.socketToUser.get(socketId);
            
            // Emit force_logout before disconnecting
            this.io.to(socketId).emit("force_logout", {
                reason,
                message: `Disconnected: ${reason}`
            });
            
            // Disconnect the socket
            const socket = this.io.sockets.sockets.get(socketId);
            if (socket) {
                socket.disconnect(true);
            }
            
            // Cleanup mappings
            this.socketToToken.delete(socketId);
            this.socketToUser.delete(socketId);
            
            if (userId) {
                if (this.userSockets.get(userId) === socketId) {
                    this.userSockets.delete(userId);
                }
            }
            
            console.log(`[SOCKET] Force disconnected socket ${socketId}, reason: ${reason}`);
            return true;
        }
        return false;
    }

    /**
     * Disconnect socket by session token
     */
    disconnectSocketByToken(token, reason = "logout") {
        const socketId = this.getSocketIdBySessionToken(token);
        if (socketId) {
            return this.disconnectSocket(socketId, reason);
        }
        return false;
    }

    /**
     * Disconnect all sockets for a user
     */
    disconnectAllUserSockets(userId, reason = "logout") {
        const socketIds = [];
        
        // Find all socketIds for this user
        for (let [socketId, uid] of this.socketToUser.entries()) {
            if (uid === userId) {
                socketIds.push(socketId);
            }
        }
        
        // Disconnect each socket
        for (const socketId of socketIds) {
            this.disconnectSocket(socketId, reason);
        }
        
        return socketIds.length;
    }

    /**
     * Pushes data to a specific user instantly.
     */
    emitToUser(userId, event, data) {
        const socketId = this.userSockets.get(userId);
        if (socketId && this.io) {
            this.io.to(socketId).emit(event, data);
            return true;
        }
        return false;
    }

    /**
     * Broadcast to everyone (World events).
     */
    broadcast(event, data) {
        if (this.io) this.io.emit(event, data);
    }

    /**
     * Get all connected socket IDs
     */
    getConnectedSocketIds() {
        if (!this.io) return [];
        return Array.from(this.io.sockets.sockets.keys());
    }

    /**
     * Get count of connected sockets
     */
    getConnectedCount() {
        return this.socketToUser.size;
    }
}

module.exports = new SocketService();
