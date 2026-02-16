const prisma = require('../db');

const energyService = require('./energyService');
const transactionManager = require('./economy/TransactionManager');
const resolver = require('../logic/economy/CurrencyResolver');
const { AppError, ErrorCodes } = require('../utils/AppError');

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
        const towns = await prisma.regionTemplate.findMany({ where: { zoneType: "TOWN" } });
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
            include: { 
                premiumTier: true,
                taskQueue: { where: { status: "RUNNING" } }
            }
        });

        if (user.taskQueue.length > 0) throw new AppError(ErrorCodes.TAVERN_BUSY, 'You are too busy to recruit right now.');
        if (!user.isInTavern) throw new AppError(ErrorCodes.TAVERN_NOT_IN_TAVERN, 'You must be inside the Tavern to recruit.');

        // 2. Fetch Mercenary
        const merc = await prisma.tavernMercenary.findUnique({
            where: { id: mercenaryId },
            include: { hero: true }
        });

        if (!merc) throw new AppError(ErrorCodes.TAVERN_MERCENARY_GONE, 'Mercenary is no longer available.');
        
        // 3. Verify user has enough funds (Silver-based)
        const userTotalSilver = resolver.getTotalSilver(user);
        if (userTotalSilver < BigInt(merc.recruitmentCost)) {
            throw new AppError(ErrorCodes.TAVERN_INSUFFICIENT_FUNDS, 
                `Insufficient funds. Cost: ${merc.recruitmentCost} silver, have: ${userTotalSilver}`,
                { context: { required: merc.recruitmentCost.toString(), available: userTotalSilver.toString() } }
            );
        }

        // 4. Atomic Recruitment using TransactionManager
        await transactionManager.removeCurrency(prisma, userId, merc.recruitmentCost, "RECRUITMENT", merc.heroId, "TAVERN_MERCENARY");

        // 5. Transfer Ownership
        await prisma.hero.update({
            where: { id: merc.heroId },
            data: { userId: userId }
        });

        // 6. Remove from Tavern Listing
        await prisma.tavernMercenary.delete({
            where: { id: mercenaryId }
        });

        return { success: true, heroId: merc.heroId, name: merc.hero.name };
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

    /**
     * Fast Travel between Royal Cities via Tavern/Inn Network.
     */
    async fastTravel(userId, targetRegionId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { region: true }
        });

        if (!user.isInTavern) throw new AppError(ErrorCodes.TAVERN_NOT_IN_TAVERN, 'You must be inside a Tavern or Inn to arrange Fast Travel.');

        // 1. Verify Origin is Royal/Capital
        // Assuming 'ROYAL' zoneType or 'ROYAL_CITY' visualType. 
        // Summary said zoneType ROYAL is added.
        if (user.region.zoneType !== 'ROYAL') {
            throw new AppError(ErrorCodes.TAVERN_FAST_TRAVEL_WRONG_ZONE, 'Fast Travel is only available from Royal Cities.');
        }

        // 2. Verify Target is Royal
        const target = await prisma.regionTemplate.findUnique({ where: { id: targetRegionId } });
        if (!target || target.zoneType !== 'ROYAL') {
            throw new AppError(ErrorCodes.TAVERN_FAST_TRAVEL_WRONG_ZONE, 'You can only Fast Travel to other Royal Cities.');
        }

        if (user.currentRegion === targetRegionId) {
            throw new AppError(ErrorCodes.TRAVEL_ALREADY_THERE, 'You are already here.');
        }

        // 3. Cooldown Check (Using settings JSON to avoid schema migration)
        const settings = user.settings ? JSON.parse(user.settings) : {};
        const lastTravel = settings.lastFastTravelAt ? new Date(settings.lastFastTravelAt) : null;
        const now = new Date();
        const COOLDOWN_MINUTES = 60;
        
        if (lastTravel) {
            const diffMinutes = (now - lastTravel) / 1000 / 60;
            if (diffMinutes < COOLDOWN_MINUTES) {
                const remaining = Math.ceil(COOLDOWN_MINUTES - diffMinutes);
                throw new AppError(ErrorCodes.TAVERN_FAST_TRAVEL_COOLDOWN, 
                    `Fast Travel is on cooldown. Next caravan departs in ${remaining} minutes.`,
                    { context: { remainingMinutes: remaining } }
                );
            }
        }

        // 4. Cost Calculation (Distance based or Flat?)
        const COST = 5000; // Flat fee for Royal Network
        const userSilver = resolver.getTotalSilver(user);
        
        if (userSilver < BigInt(COST)) {
            throw new AppError(ErrorCodes.TAVERN_INSUFFICIENT_FUNDS, 
                `Insufficient funds. Ticket costs ${COST} silver.`,
                { context: { required: COST, available: userSilver.toString() } }
            );
        }

        // 5. Execute
        await transactionManager.removeCurrency(prisma, userId, COST, "FAST_TRAVEL", null, "TAVERN");
        
        settings.lastFastTravelAt = now.toISOString();

        await prisma.user.update({
            where: { id: userId },
            data: {
                currentRegion: targetRegionId,
                settings: JSON.stringify(settings),
                isInTavern: false, // Eject on arrival
                tavernEntryAt: null
            }
        });

        return { success: true, newRegion: targetRegionId };
    }
}

module.exports = new TavernService();
