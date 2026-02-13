
const BaseService = require('./BaseService');
const socketRouter = require('./socketRouter'); // For broadcasting updates

/**
 * BossManager
 * Manages the lifecycle and persistence of World Bosses.
 */
class BossManager extends BaseService {
    constructor() {
        super();
    }

    /**
     * Initializes World Boss states on server start.
     * Ensures every World Boss (Monster defined as WORLD_BOSS) has a tracking record.
     */
    async init() {
        this.log("Initializing World Boss Manager...", "BossManager");
        await this.ensureBossStates();
    }

    /**
     * Scans for WORLD_BOSS rank monsters and ensures they have a WorldBossState record.
     * If a record is missing, it creates one (defaulting to Alive).
     */
    async ensureBossStates() {
        // 1. Find all monsters with rank 'WORLD_BOSS'
        // We need to look at RegionMonster to know where they belong, 
        // as WorldBossState requires a regionId.
        // But a monster definition might be reused? 
        // For World Bosses, usually 1 Template = 1 Unique Boss in 1 Region.
        
        // Let's find all RegionMonsters where the monster is rank WORLD_BOSS
        const worldBossSpawns = await this.db.regionMonster.findMany({
            where: {
                monster: {
                    rank: 'WORLD_BOSS'
                }
            },
            include: { monster: true }
        });

        for (const spawn of worldBossSpawns) {
            const existingState = await this.db.worldBossState.findUnique({
                where: { monsterId: spawn.monsterId }
            });

            if (!existingState) {
                this.log(`Creating initial state for World Boss: ${spawn.monster.name} in Region ${spawn.regionId}`, "BossManager");
                await this.db.worldBossState.create({
                    data: {
                        monsterId: spawn.monsterId,
                        regionId: spawn.regionId,
                        isAlive: true,
                        currentHp: spawn.monster.hp_base, // Initialize with base HP
                    }
                });
            } else {
                // Determine if we need to update region if it changed in RegionMonster?
                // For now, assume it's stable.
                if (existingState.isAlive) {
                    this.log(`World Boss ${spawn.monster.name} is ALIVE.`, "BossManager");
                } else {
                    this.log(`World Boss ${spawn.monster.name} is DEAD (Slain by ${existingState.killedByUserName || 'Unknown'}).`, "BossManager");
                }
            }
        }
    }

    /**
     * Get the status of a specific World Boss.
     */
    async getBossStatus(monsterId) {
        return await this.db.worldBossState.findUnique({
            where: { monsterId },
            include: { 
                killedByUser: {
                    select: { username: true } 
                }
            }
        });
    }

    /**
     * Handle the event of a World Boss death.
     * @param {number} monsterId 
     * @param {number} regionId 
     * @param {number} killerUserId 
     */
    async handleBossDeath(monsterId, regionId, killerUserId) {
        // Verify it is a World Boss
        const state = await this.db.worldBossState.findUnique({ where: { monsterId } });
        if (!state) return; // Not a tracked world boss

        if (!state.isAlive) {
            this.log(`Anomaly: Boss ${monsterId} killed but was already dead?`, "BossManager");
            return;
        }

        const user = await this.db.user.findUnique({ where: { id: killerUserId } });
        const killerName = user ? user.username : "Unknown Hero";

        // Update State -> PERMA DEATH (No Respawn)
        await this.db.worldBossState.update({
            where: { monsterId },
            data: {
                isAlive: false,
                currentHp: 0,
                killedAt: new Date(),
                killedByUserId: killerUserId,
                killedByUserName: killerName
            }
        });

        this.log(`WORLD BOSS SLAIN! Monster ${monsterId} killed by ${killerName}.`, "BossManager");

        // Broadcast Global Announcement
        // Using socketRouter to broadcast if available, or just log for now if direct access isn't clean.
        // Assuming we can define a broadcast method in socketRouter or import the socket instance.
        // For now, let's assume we can trigger a system message via ChatService or similar if needed.
    }
}

module.exports = new BossManager();
