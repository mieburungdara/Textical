/**
 * Socket Router - Extracts handler registration logic from SocketService
 * Following SRP: Only responsible for registering handlers to sockets
 */

const chatHandler = require('../handlers/chatSocketHandler');
const statHandler = require('../handlers/statHandler');
const guildHandler = require('../handlers/guildHandler');
const mapHandler = require('../handlers/MapRealtimeHandler');
const enchantmentHandler = require('../handlers/enchantmentHandler');
const treasureMapHandler = require('../handlers/treasureMapSocketHandler');

/**
 * Register all socket event handlers to a socket connection
 * @param {Object} io - Socket.io server instance
 * @param {Object} socket - Individual socket connection
 * @param {number} userId - Authenticated user ID
 */
function registerHandlers(io, socket, userId) {
    // Register Chat Handlers
    chatHandler.register(io, socket, userId);
    console.log(`[SOCKET_ROUTER] Chat handlers registered for user ${userId}`);

    // Register Stat Handlers
    socket.on("stat:request", (request) => statHandler.handleStatRequest(socket, request));
    socket.on("stat:allocate", (request) => statHandler.handleStatAllocate(socket, request));
    socket.on("stat:compare", (request) => statHandler.handleStatCompare(socket, request));
    socket.on("stat:subscribe", (request) => statHandler.handleSubscribe(socket, request));
    socket.on("stat:unsubscribe", (request) => statHandler.handleUnsubscribe(socket, request));
    console.log(`[SOCKET_ROUTER] Stat handlers registered for user ${userId}`);

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
    console.log(`[SOCKET_ROUTER] Guild handlers registered for user ${userId}`);

    // Register Map Realtime Handlers
    mapHandler.register(io, socket, userId);
    console.log(`[SOCKET_ROUTER] Map realtime handlers registered for user ${userId}`);

    // Register Enchantment Handlers
    socket.on("enchantment:apply", (request) => enchantmentHandler.handleApplyEnchantment(socket, request));
    socket.on("enchantment:preview", (request) => enchantmentHandler.handleGetEnchantmentPreview(socket, request));
    socket.on("enchantment:available", (request) => enchantmentHandler.handleGetAvailableEnchantments(socket, request));
    socket.on("enchantment:item_enchantments", (request) => enchantmentHandler.handleGetItemEnchantments(socket, request));
    console.log(`[SOCKET_ROUTER] Enchantment handlers registered for user ${userId}`);

    // Register Treasure Map Handlers
    treasureMapHandler.register(io, socket, userId);
}

/**
 * Unregister all handlers for cleanup (optional)
 * @param {Object} socket - Individual socket connection
 */
function unregisterHandlers(socket) {
    // Remove all event listeners
    const eventTypes = [
        'stat:request', 'stat:allocate', 'stat:compare', 'stat:subscribe', 'stat:unsubscribe',
        'guild:create', 'guild:join', 'guild:leave', 'guild:kick', 'guild:promote',
        'guild:demote', 'guild:transfer_leadership', 'guild:update_settings',
        'guild:deposit_treasury', 'guild:withdraw_treasury', 'guild:build_facility',
        'guild:upgrade_facility', 'guild:create_invite', 'guild:accept_invite',
        'guild:cancel_invite', 'guild:get_info', 'guild:get_my_info', 'guild:search',
        'guild:disband',
        'treasure:get_maps', 'treasure:get_unused_maps', 'treasure:get_active_maps',
        'treasure:use_map', 'treasure:check_dig', 'treasure:start_dig', 'treasure:complete_dig',
        'treasure:debug_create'
    ];

    eventTypes.forEach(eventType => {
        socket.removeAllListeners(eventType);
    });

    console.log(`[SOCKET_ROUTER] All handlers unregistered for socket ${socket.id}`);
}

module.exports = {
    registerHandlers,
    unregisterHandlers
};
