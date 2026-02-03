const { Server } = require("socket.io");
const chatHandler = require('../handlers/chatSocketHandler');
const statHandler = require('../handlers/statHandler');
const guildHandler = require('../handlers/guildHandler');

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

            socket.on("authenticate", (rawUserId) => {
                const userId = parseInt(rawUserId); // BUG FIX: Force integer key
                this.userSockets.set(userId, socket.id);
                socket.userId = userId; // Store on socket for easy access
                
                // Register Chat Handlers
                chatHandler.register(this.io, socket, userId);

                console.log(`[SOCKET] User ${userId} authenticated on socket ${socket.id}`);
                socket.emit("authenticated", { userId }); // Confirm auth
            });

            // Register Stat Handlers for all connections
            socket.on("stat:request", (request) => statHandler.handleStatRequest(socket, request));
            socket.on("stat:allocate", (request) => statHandler.handleStatAllocate(socket, request));
            socket.on("stat:compare", (request) => statHandler.handleStatCompare(socket, request));
            socket.on("stat:subscribe", (request) => statHandler.handleSubscribe(socket, request));
            socket.on("stat:unsubscribe", (request) => statHandler.handleUnsubscribe(socket, request));

            // Register Guild Handlers
            socket.on("guild:create", (request) => guildHandler.handleCreateGuild(socket, request));
            socket.on("guild:join", (request) => guildHandler.handleJoinGuild(socket, request));
            socket.on("guild:leave", (request) => guildHandler.handleLeaveGuild(socket, request));
            socket.on("guild:kick", (request) => guildHandler.handleKickMember(socket, request));
            socket.on("guild:promote", (request) => guildHandler.handlePromoteMember(socket, request));
            socket.on("guild:demote", (request) => guildHandler.handleDemoteMember(socket, request));
            socket.on("guild:transfer_leadership", (request) => guildHandler.handleTransferLeadership(socket, request));
            socket.on("guild:update_settings", (request) => guildHandler.handleUpdateSettings(socket, request));
            socket.on("guild:deposit_treasury", (request) => guildHandler.handleDepositTreasury(socket, request));
            socket.on("guild:withdraw_treasury", (request) => guildHandler.handleWithdrawTreasury(socket, request));
            socket.on("guild:build_facility", (request) => guildHandler.handleBuildFacility(socket, request));
            socket.on("guild:upgrade_facility", (request) => guildHandler.handleUpgradeFacility(socket, request));
            socket.on("guild:create_invite", (request) => guildHandler.handleCreateInvite(socket, request));
            socket.on("guild:accept_invite", (request) => guildHandler.handleAcceptInvite(socket, request));
            socket.on("guild:cancel_invite", (request) => guildHandler.handleCancelInvite(socket, request));
            socket.on("guild:get_info", (request) => guildHandler.handleGetGuildInfo(socket, request));
            socket.on("guild:get_my_info", (request) => guildHandler.handleGetMyGuild(socket, request));
            socket.on("guild:search", (request) => guildHandler.handleSearchGuilds(socket, request));
            socket.on("guild:disband", (request) => guildHandler.handleDisbandGuild(socket, request));

            socket.on("disconnect", () => {
                // Cleanup stat handler subscriptions
                statHandler.removeClient(socket);
                
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
