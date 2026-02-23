/**
 * BaseSocketHandler
 * Extracts common Socket.IO emit patterns from GuildHandler and other handlers.
 * Follows SRP - only responsible for socket communication helpers.
 */

/**
 * Emit a socket event with data
 * @param {WebSocket} ws - WebSocket connection
 * @param {string} event - Event name
 * @param {Object} data - Event data
 */
function emitEvent(ws, event, data) {
    if (ws && ws.send) {
        ws.send('42' + JSON.stringify([event, data]));
    }
}

/**
 * Emit an error event
 * @param {WebSocket} ws - WebSocket connection
 * @param {string} message - Error message
 */
function emitError(ws, message) {
    emitEvent(ws, "error", { message });
}

/**
 * Emit a success event
 * @param {WebSocket} ws - WebSocket connection
 * @param {string} event - Success event name
 * @param {Object} data - Response data
 * @param {string} message - Optional success message
 */
function emitSuccess(ws, event, data, message = null) {
    emitEvent(ws, event, {
        success: true,
        ...data,
        ...(message && { message })
    });
}

module.exports = {
    emitEvent,
    emitError,
    emitSuccess
};
