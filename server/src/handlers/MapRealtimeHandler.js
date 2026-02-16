const weatherService = require('../services/RegionWeatherService');
const prisma = require('../db');

/**
 * MapRealtimeHandler
 * Handles real-time map data subscriptions and broadcasting.
 */
class MapRealtimeHandler {
    adminRoom = 'admin:map_updates';
    densityUpdateInterval = 5000;
    npcUpdateInterval = 10000;
    eliteBossUpdateInterval = 15000;
    intervals = {
        density: null,
        npc: null,
        boss: null
    };

    constructor() {
        // Properties already initialized above
    }

    /**
     * Registers socket events for the Map Realtime Handler.
     */
    register(io, socket, userId) {
        // Only allow admins to subscribe (simplified check for now)
        socket.on('admin:map:subscribe', async () => {
            // In a real app, verify admin role here
            socket.join(this.adminRoom);
            console.log(`[MAP_HANDLER] Admin ${userId} subscribed to map updates`);
            
            // Send initial state snapshots
            this._sendInitialSnapshots(socket);
            
            // Start global broadcast timers if not already running
            this._ensureBroadcastTimers(io);
        });

        socket.on('admin:map:unsubscribe', () => {
            socket.leave(this.adminRoom);
            console.log(`[MAP_HANDLER] Admin ${userId} unsubscribed from map updates`);
        });
    }

    /**
     * Sends the current state of all layers to a newly subscribed client.
     */
    async _sendInitialSnapshots(socket) {
        try {
            // 1. Weather
            socket.emit('map:weather_update', {
                timestamp: Date.now(),
                regions: weatherService.getWeatherSnapshot()
            });

            // 2. Player Density
            const density = await this._getPlayerDensity();
            socket.emit('map:density_update', {
                timestamp: Date.now(),
                counts: density
            });

            // 3. NPCs
            const npcs = await this._getNPCSnapshot();
            socket.emit('map:npc_update', {
                timestamp: Date.now(),
                npcs: npcs
            });

            // 4. Elite Bosses
            const eliteBosses = await this._getEliteBossSnapshot();
            socket.emit('map:elite_boss_update', {
                timestamp: Date.now(),
                bosses: eliteBosses
            });

        } catch (error) {
            console.error("[MAP_HANDLER] Failed to send initial snapshots:", error instanceof Error ? error.message : String(error));
        }
    }

    /**
     * Ensures that background timers are broadcasting to the admin room.
     */
    _ensureBroadcastTimers(io) {
        if (this.intervals.density) return; // Already running

        // 1. Player Density Broadcast
        this.intervals.density = setInterval(async () => {
            const counts = await this._getPlayerDensity();
            io.to(this.adminRoom).emit('map:density_update', {
                timestamp: Date.now(),
                counts
            });
        }, this.densityUpdateInterval);

        // 2. NPC Positions Broadcast
        this.intervals.npc = setInterval(async () => {
            const npcs = await this._getNPCSnapshot();
            io.to(this.adminRoom).emit('map:npc_update', {
                timestamp: Date.now(),
                npcs
            });
        }, this.npcUpdateInterval);

        // 3. Elite Boss Broadcast
        this.intervals.boss = setInterval(async () => {
            const bosses = await this._getEliteBossSnapshot();
            io.to(this.adminRoom).emit('map:elite_boss_update', {
                timestamp: Date.now(),
                bosses
            });
        }, this.eliteBossUpdateInterval);
        
        console.log("[MAP_HANDLER] Global broadcast timers started.");
    }

    /**
     * Calculates player count per region.
     */
    async _getPlayerDensity() {
        try {
            const socketService = require('../services/socketService');
            const onlineUserIds = Array.from(socketService.userSockets.keys());
            
            if (onlineUserIds.length === 0) return {};

            const users = await prisma.user.findMany({
                where: { id: { in: onlineUserIds } },
                select: { currentRegion: true }
            });
            
            const densityMap = {};
            users.forEach(u => {
                const rId = u.currentRegion;
                if (rId) {
                    densityMap[rId] = (densityMap[rId] || 0) + 1;
                }
            });
            return densityMap;
        } catch (error) {
            console.error("[MAP_HANDLER] Failed to get player density:", error instanceof Error ? error.message : String(error));
            return {};
        }
    }

    async _getNPCSnapshot() {
        try {
            const behaviorService = require('../services/npc/NPCBehaviorService');
            const npcs = await prisma.nPCTemplate.findMany({
                where: {
                    OR: [
                        { isWanderer: true },
                        { schedules: { some: {} } }
                    ]
                },
                select: {
                    id: true,
                    name: true,
                    type: true,
                    // minimapIcon: true, // Field not in schema
                    faction: { select: { name: true, color: true } }
                }
            });

            const snapshot = [];
            for (const npc of npcs) {
                const presence = await behaviorService.resolveNPCPresence(npc.id);
                if (presence && presence.regionId) {
                    const region = await prisma.regionTemplate.findUnique({
                        where: { id: presence.regionId },
                        select: { gridX: true, gridY: true }
                    });
                    
                    if (region) {
                        snapshot.push({
                            npcId: npc.id,
                            name: npc.name,
                            type: npc.type,
                            regionId: presence.regionId,
                            status: presence.status,
                            icon: npc.minimapIcon || 'npc_default',
                            x: region.gridX,
                            y: region.gridY
                        });
                    }
                }
            }
            return snapshot;
        } catch (error) {
            console.error("[MAP_HANDLER] Failed to get NPC snapshot:", error instanceof Error ? error.message : String(error));
            return [];
        }
    }

    /**
     * Finds active Elite Bosses (roaming monsters).
     */
    async _getEliteBossSnapshot() {
        try {
            const bosses = await prisma.worldBossState.findMany({
                where: { isAlive: true },
                include: { 
                    monster: { select: { name: true } },
                    region: { select: { name: true, gridX: true, gridY: true } }
                }
            });

            return bosses.map(b => ({
                id: b.id,
                name: b.monster.name,
                regionId: b.regionId,
                status: 'ACTIVE',
                powerLevel: 'LEVEL ' + (b.monster.level || '??'),
                x: b.region.gridX,
                y: b.region.gridY
            }));
        } catch (error) {
            console.error("[MAP_HANDLER] Failed to get boss snapshot:", error instanceof Error ? error.message : String(error));
            return [];
        }
    }
}

module.exports = new MapRealtimeHandler();
