const prisma = require('../db'); // SHARED INSTANCE

/**
 * VitalityService
 * Handles the Global User Vitality pool, regeneration logic, 
 * and the 24-minute Daily Tavern Limit.
 */
class VitalityService {
    constructor() {
        this.BASE_REGEN_SECONDS = 300; // 1 point per 5 minutes
        this.TAVERN_REGEN_MULTIPLIER = 10; // 10x faster in Tavern
        this.DAILY_TAVERN_LIMIT_SECONDS = 1440; // 24 Minutes
    }

    /**
     * Calculates the current vitality of a user without modifying the DB.
     * @param {Object} user User object with premiumTier included
     */
    calculateCurrentVitality(user) {
        const now = new Date();
        const elapsedSeconds = Math.floor((now - new Date(user.lastVitalityUpdate)) / 1000);
        
        if (elapsedSeconds <= 0) return user.vitality;

        const premium = user.premiumTier || { vitalityRegenMult: 1.0, maxVitalityBonus: 0 };
        const maxCap = user.maxVitality + (premium.maxVitalityBonus || 0);

        if (user.vitality >= maxCap) return user.vitality;

        let multiplier = premium.vitalityRegenMult || 1.0;
        if (user.isInTavern) multiplier *= this.TAVERN_REGEN_MULTIPLIER;

        const pointsGained = (elapsedSeconds / this.BASE_REGEN_SECONDS) * multiplier;
        return Math.floor(Math.min(maxCap, user.vitality + pointsGained));
    }

    /**
     * Synchronizes calculated vitality to the database and handles Tavern reset.
     */
    async syncUserVitality(userId) {
        const user = await prisma.user.findUnique({
            where: { id: userId },
            include: { premiumTier: true }
        });

        if (!user) throw new Error("User not found");

        const now = new Date();
        const premium = user.premiumTier || { vitalityRegenMult: 1.0, maxVitalityBonus: 0 };
        const totalTavernLimit = this.DAILY_TAVERN_LIMIT_SECONDS + (premium.queueSlots || 0);
        const maxCap = user.maxVitality + (premium.maxVitalityBonus || 0);

        // 1. Handle Daily Tavern Reset
        let dailySeconds = user.tavernTimeSecondsToday;
        let lastReset = user.lastTavernResetAt;
        if ((now - new Date(lastReset)) > 86400000) {
            dailySeconds = 0;
            lastReset = now;
        }

        // 2. Real-time Tavern Tracking
        let inTavern = user.isInTavern;
        let entryAt = user.tavernEntryAt;
        if (inTavern && entryAt) {
            const duration = Math.floor((now - new Date(entryAt)) / 1000);
            dailySeconds += duration;
            entryAt = now;
            if (dailySeconds >= totalTavernLimit) {
                inTavern = false;
                entryAt = null;
            }
        }

        // 3. Robust Regeneration (Preserving Fractional Progress)
        const elapsedSeconds = Math.floor((now - new Date(user.lastVitalityUpdate)) / 1000);
        let currentVit = user.vitality;
        let lastUpdate = new Date(user.lastVitalityUpdate);

        if (elapsedSeconds > 0 && currentVit < maxCap) {
            let multiplier = premium.vitalityRegenMult || 1.0;
            if (user.isInTavern) multiplier *= this.TAVERN_REGEN_MULTIPLIER;

            const secondsPerPoint = this.BASE_REGEN_SECONDS / multiplier;
            const pointsGained = Math.floor(elapsedSeconds / secondsPerPoint);
            
            if (pointsGained > 0) {
                currentVit = Math.min(maxCap, currentVit + pointsGained);
                // Advance the clock ONLY by the time consumed for full points
                const consumedSeconds = Math.floor(pointsGained * secondsPerPoint);
                lastUpdate = new Date(lastUpdate.getTime() + (consumedSeconds * 1000));
            }
        }

        return await prisma.user.update({
            where: { id: userId },
            data: {
                vitality: currentVit,
                lastVitalityUpdate: lastUpdate,
                tavernTimeSecondsToday: dailySeconds,
                lastTavernResetAt: lastReset,
                isInTavern: inTavern,
                tavernEntryAt: entryAt
            },
            include: { premiumTier: true }
        });
    }

    /**
     * Consumes vitality for an action.
     */
    async consumeVitality(userId, amount) {
        const user = await this.syncUserVitality(userId);
        
        if (user.vitality < amount) {
            throw new Error(`Insufficient Vitality. Need ${amount}, have ${user.vitality}`);
        }

        return await prisma.user.update({
            where: { id: userId },
            data: {
                vitality: user.vitality - amount
            }
        });
    }

    /**
     * Handles entering the Tavern.
     */
    async enterTavern(userId) {
        const user = await this.syncUserVitality(userId);
        const premium = user.premiumTier;
        const totalLimit = this.DAILY_TAVERN_LIMIT_SECONDS + premium.queueSlots; // Use queueSlots or similar if bonusTavernSeconds is missing

        if (user.tavernTimeSecondsToday >= totalLimit) {
            throw new Error("Tavern daily limit reached (24 minutes). You are too exhausted to enter.");
        }

        if (user.isInTavern) return user;

        return await prisma.user.update({
            where: { id: userId },
            data: {
                isInTavern: true,
                tavernEntryAt: new Date()
            }
        });
    }

    /**
     * Handles exiting the Tavern.
     */
    async exitTavern(userId) {
        const user = await this.syncUserVitality(userId);
        if (!user.isInTavern) return user;

        return await prisma.user.update({
            where: { id: userId },
            data: {
                isInTavern: false,
                tavernEntryAt: null
            }
        });
    }
}

module.exports = new VitalityService();