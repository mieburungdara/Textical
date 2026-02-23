/**
 * Stat Socket Handler
 * Handles real-time stat updates via WebSocket
 */
const statService = require('../services/statService');
const heroRepository = require('../repositories/heroRepository');

class StatHandler {
    constructor() {
        // Track subscribed clients per hero
        this.subscriptions = new Map();
    }

    /**
     * Handle stat request - send all stat data to client
     */
    async handleStatRequest(ws, request) {
        try {
            const { heroId, includeBreakdown, includeCapabilities, includeElemental, includeSets, includeEquipment } = request;

            if (!heroId) {
                return ws.send(JSON.stringify({
                    type: 'stat:error',
                    error: 'Hero ID is required'
                }));
            }

            const hero = await heroRepository.findById(heroId);
            if (!hero) {
                return ws.send(JSON.stringify({
                    type: 'stat:error',
                    error: 'Hero not found'
                }));
            }

            const response = {
                type: 'stat:data',
                heroId,
                timestamp: new Date().toISOString()
            };

            // Include requested data
            if (includeBreakdown) {
                response.stats = await statService.calculateStatsWithBreakdown(heroId);
            } else {
                response.stats = await statService.calculateHeroStats(heroId);
            }

            if (includeCapabilities) {
                response.capabilities = await statService.getStatCapabilities(heroId);
            }

            if (includeElemental) {
                response.elemental = await statService.getElementalStats(heroId);
            }

            if (includeSets) {
                response.sets = await statService.getSetBonuses(heroId);
            }

            if (includeEquipment) {
                response.equipment = await statService.getEquipmentStats(heroId);
            }

            ws.send(JSON.stringify(response));
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'stat:error',
                error: error.message
            }));
        }
    }

    /**
     * Handle stat comparison request
     */
    async handleStatCompare(ws, request) {
        try {
            const { heroId, previewEquipment } = request;

            if (!heroId) {
                return ws.send(JSON.stringify({
                    type: 'stat:compare:error',
                    error: 'Hero ID is required'
                }));
            }

            const comparison = await statService.compareStats(heroId, previewEquipment);

            ws.send(JSON.stringify({
                type: 'stat:compare:result',
                heroId,
                current: comparison.current,
                preview: comparison.preview,
                differences: comparison.differences,
                isImproved: comparison.isImproved
            }));
        } catch (error) {
            ws.send(JSON.stringify({
                type: 'stat:compare:error',
                error: error.message
            }));
        }
    }

    /**
     * Handle subscription to stat updates
     */
    handleSubscribe(ws, request) {
        const { heroId } = request;

        if (!heroId) {
            return ws.send(JSON.stringify({
                type: 'stat:subscribe:error',
                error: 'Hero ID is required'
            }));
        }

        // Add to subscription map
        if (!this.subscriptions.has(heroId)) {
            this.subscriptions.set(heroId, new Set());
        }
        this.subscriptions.get(heroId).add(ws);

        ws.send(JSON.stringify({
            type: 'stat:subscribe:success',
            heroId,
            message: `Subscribed to stat updates for hero ${heroId}`
        }));
    }

    /**
     * Handle unsubscribe from stat updates
     */
    handleUnsubscribe(ws, request) {
        const { heroId } = request;

        if (heroId && this.subscriptions.has(heroId)) {
            this.subscriptions.get(heroId).delete(ws);
            // Clean up empty sets
            if (this.subscriptions.get(heroId).size === 0) {
                this.subscriptions.delete(heroId);
            }
        }

        ws.send(JSON.stringify({
            type: 'stat:unsubscribe:success',
            heroId
        }));
    }

    /**
     * Emit stat update to subscribed clients
     */
    emitStatUpdate(heroId, updateData) {
        if (!this.subscriptions.has(heroId)) return;

        const subscribers = this.subscriptions.get(heroId);
        const message = JSON.stringify({
            type: 'stat:update',
            heroId,
            ...updateData,
            timestamp: new Date().toISOString()
        });

        subscribers.forEach(ws => {
            try {
                if (ws.readyState === 1) { // WebSocket.OPEN
                    ws.send(message);
                }
            } catch (error) {
                console.error(`Error sending stat update to client: ${error.message}`);
            }
        });
    }

    /**
     * Emit stat changes (for internal use by other services)
     */
    emitStatChanges(heroId, changes) {
        const stats = {
            ...changes,
            heroId
        };

        // Calculate only changed stats for efficiency
        const calculatedStats = {
            ...changes.calculatedStats,
            heroId
        };

        this.emitStatUpdate(heroId, {
            type: changes.type || 'UPDATE',
            changes: stats,
            calculatedStats,
            partial: true // Indicates only changed stats
        });
    }

    /**
     * Get subscription count for a hero
     */
    getSubscriptionCount(heroId) {
        const subscribers = this.subscriptions.get(heroId);
        return subscribers ? subscribers.size : 0;
    }

    /**
     * Remove client from all subscriptions (cleanup on disconnect)
     */
    removeClient(ws) {
        this.subscriptions.forEach((subscribers, heroId) => {
            subscribers.delete(ws);
            if (subscribers.size === 0) {
                this.subscriptions.delete(heroId);
            }
        });
    }
}

module.exports = new StatHandler();
