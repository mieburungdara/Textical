const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const vitalityService = require('./vitalityService');

/**
 * TavernService
 * Manages the "Living Tavern" mechanics.
 * Spawns/Despawns mercenaries and handles user recruitment.
 */
class TavernService {
    constructor() {
        this.SPAWN_CHANCE = 0.3; // 30% chance to spawn per tick
        this.MIN_STAY_MINUTES = 10;
        this.MAX_STAY_MINUTES = 60;
        this.BASE_RECRUIT_COST = 500;
    }

    /**
     * Periodically called by the heartbeat.
     * Spawns new mercenaries and removes expired ones.
     */
    async tick() {
        await this._cleanupExpired();
        if (Math.random() < this.SPAWN_CHANCE) {
            await this._spawnRandomMercenary();
        }
    }

    async _cleanupExpired() {
        const now = new Date();
        const expired = await prisma.tavernMercenary.findMany({
            where: { expiresAt: { lte: now } }
        });

        for (const merc of expired) {
            console.log(`[TAVERN] Mercenary ${merc.heroId} has left the tavern.`);
            // In a full production env, we might soft-delete or move hero to a "Wild" pool
            await prisma.tavernMercenary.delete({ where: { id: merc.id } });
            await prisma.hero.delete({ where: { id: merc.heroId } });
        }
    }

    async _spawnRandomMercenary() {
        // 1. Pick a random Town
        const towns = await prisma.regionTemplate.findMany({ where: { type: "TOWN" } });
        if (towns.length === 0) return;
        const region = towns[Math.floor(Math.random() * towns.length)];

        // 2. Generate Hero Data
        const stayMinutes = Math.floor(Math.random() * (this.MAX_STAY_MINUTES - this.MIN_STAY_MINUTES + 1)) + this.MIN_STAY_MINUTES;
        const expiresAt = new Date(Date.now() + (stayMinutes * 60 * 1000));

        // Create the "Wild" Hero
        const hero = await prisma.hero.create({
            data: {
                name: `Mercenary ${Math.floor(Math.random() * 9999)}`,
                classId: 1001, // Default Novice for now
                vitality: 100,
                userId: null // UNOWNED
            }
        });

        await prisma.tavernMercenary.create({
            data: {
                heroId: hero.id,
                regionId: region.id,
                recruitmentCost: this.BASE_RECRUIT_COST,
                expiresAt: expiresAt
            }
        });

        console.log(`[TAVERN] ${hero.name} arrived at ${region.name}. Staying for ${stayMinutes} mins.`);
    }

    /**
     * User hires a mercenary.
     */
    async recruitMercenary(userId, mercenaryId) {
        // 1. Enforce Tavern Fatigue (VitalityService handles the Visa check)
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { premiumTier: true }
        });

        if (!user.isInTavern) throw new Error("You must be inside the Tavern to recruit.");

        // 2. Fetch Mercenary
        const merc = await prisma.tavernMercenary.findUnique({
            where: { id: mercenaryId },
            include: { hero: true }
        });

        if (!merc) throw new Error("Mercenary is no longer available.");
        if (user.gold < merc.recruitmentCost) throw new Error("Insufficient gold for recruitment.");

        // 3. Atomic Recruitment
        return await prisma.$transaction([
            // Deduct Gold
            prisma.user.update({
                where: { id: userId },
                data: { gold: user.gold - merc.recruitmentCost }
            }),
            // Transfer Ownership
            prisma.hero.update({
                where: { id: merc.heroId },
                data: { userId: userId }
            }),
            // Remove from Tavern Listing
            prisma.tavernMercenary.delete({
                where: { id: mercenaryId }
            }),
            // Log Transaction
            prisma.transactionLedger.create({
                data: {
                    userId,
                    type: "RECRUITMENT",
                    currencyTier: "GOLD",
                    amountDelta: -merc.recruitmentCost,
                    newBalance: user.gold - merc.recruitmentCost,
                    metadata: JSON.stringify({ heroId: merc.heroId })
                }
            })
        ]);
    }

    /**
     * Get list of mercenaries in the user's current region.
     */
    async getAvailableMercenaries(userId) {
        const user = await prisma.user.findUnique({ where: { id: userId } });
        if (!user.isInTavern) return []; // Cannot see list if not inside

        return await prisma.tavernMercenary.findMany({
            where: { regionId: user.currentRegion },
            include: { hero: { include: { combatClass: true } } }
        });
    }
}

module.exports = new TavernService();