const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

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
        const maxCap = user.maxVitality + premium.maxVitalityBonus;

        // Determine multiplier (Tavern vs World)
        let multiplier = premium.vitalityRegenMult;
        if (user.isInTavern) {
            multiplier *= this.TAVERN_REGEN_MULTIPLIER;
        }

        const pointsGained = (elapsedSeconds / this.BASE_REGEN_SECONDS) * multiplier;
        const finalVitality = Math.min(maxCap, user.vitality + pointsGained);

        return Math.floor(finalVitality);
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

        // 1. Handle Daily Tavern Reset
        const now = new Date();
        const resetElapsed = now - new Date(user.lastTavernResetAt);
        let dailySeconds = user.tavernTimeSecondsToday;
        let lastReset = user.lastTavernResetAt;

        if (resetElapsed > 86400000) { // 24 hours
            dailySeconds = 0;
            lastReset = now;
        }

        // 2. Calculate and Save Vitality
        const currentVit = this.calculateCurrentVitality(user);

        return await prisma.user.update({
            where: { id: userId },
            data: {
                vitality: currentVit,
                lastVitalityUpdate: now,
                tavernTimeSecondsToday: dailySeconds,
                lastTavernResetAt: lastReset
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
                vitality: user.vitality - amount,
                lastVitalityUpdate: new Date()
            }
        });
    }

    /**
     * Handles entering the Tavern.
     */
    async enterTavern(userId) {
        const user = await this.syncUserVitality(userId);
        const premium = user.premiumTier;
        const totalLimit = this.DAILY_TAVERN_LIMIT_SECONDS + premium.bonusTavernSeconds;

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
     * Handles exiting the Tavern with 1-minute minimum rounding logic.
     */
    async exitTavern(userId) {
        const user = await this.syncUserVitality(userId);
        if (!user.isInTavern || !user.tavernEntryAt) return user;

        const now = new Date();
        let durationSeconds = Math.floor((now - new Date(user.tavernEntryAt)) / 1000);
        
        // APPLY RULE: Minimum 1 minute stay (60 seconds)
        if (durationSeconds < 60) {
            durationSeconds = 60;
        }

        return await prisma.user.update({
            where: { id: userId },
            data: {
                isInTavern: false,
                tavernEntryAt: null,
                tavernTimeSecondsToday: user.tavernTimeSecondsToday + durationSeconds
            }
        });
    }
}

module.exports = new VitalityService();
