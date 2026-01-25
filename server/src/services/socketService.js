const { Server } = require("socket.io");

class SocketService {
    constructor() {
        this.io = null;
        this.userSockets = new Map(); // userId -> socketId
    }

    init(server) {
        this.io = new Server(server, {
            cors: { origin: "*" }
        });

        this.io.on("connection", (socket) => {
            console.log(`[SOCKET] New connection: ${socket.id}`);

            socket.on("authenticate", (userId) => {
                this.userSockets.set(userId, socket.id);
                console.log(`[SOCKET] User ${userId} authenticated on socket ${socket.id}`);
            });

            socket.on("disconnect", () => {
                // Cleanup mapping
                for (let [userId, socketId] of this.userSockets.entries()) {
                    if (socketId === socket.id) {
                        this.userSockets.delete(userId);
                        break;
                    }
                }
            });
        });
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
}

module.exports = new SocketService();
