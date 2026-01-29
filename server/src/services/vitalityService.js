const BaseService = require('./BaseService'); // FIXED PATH
const vitalityCalculator = require('./vitality/VitalityCalculator');
const tavernTracker = require('./vitality/TavernTracker');

/**
 * VitalityService (v2.0 - Modular Orchestrator)
 * Centralizes Vitality management by composing specialized logic handlers.
 */
class VitalityService extends BaseService {
    
    async syncUserVitality(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { premiumTier: true }
        });

        if (!user) throw new Error("User not found");

        // 1. Process Tavern State
        const tavernState = tavernTracker.process(user);

        // 2. Process Vitality Regen (respecting possibly updated Tavern status)
        const updatedUserForCalc = { ...user, isInTavern: tavernState.inTavern };
        const { currentVit, lastUpdate } = vitalityCalculator.calculate(updatedUserForCalc);

        return await this.db.user.update({
            where: { id: userId },
            data: {
                vitality: currentVit,
                lastVitalityUpdate: lastUpdate,
                tavernTimeSecondsToday: tavernState.dailySeconds,
                lastTavernResetAt: tavernState.lastReset,
                isInTavern: tavernState.inTavern,
                tavernEntryAt: tavernState.entryAt
            },
            include: { premiumTier: true }
        });
    }

    async consumeVitality(userId, amount) {
        const user = await this.syncUserVitality(userId);
        if (user.vitality < amount) {
            throw new Error(`Insufficient Vitality. Need ${amount}, have ${user.vitality}`);
        }

        return await this.db.user.update({
            where: { id: userId },
            data: { vitality: user.vitality - amount }
        });
    }

    async enterTavern(userId) {
        const user = await this.syncUserVitality(userId);
        const tavernState = tavernTracker.process(user);

        if (tavernState.dailySeconds >= tavernState.totalLimit) {
            throw new Error("Tavern daily limit reached. You are too exhausted to enter.");
        }

        if (user.isInTavern) return user;

        return await this.db.user.update({
            where: { id: userId },
            data: {
                isInTavern: true,
                tavernEntryAt: new Date()
            }
        });
    }

    async exitTavern(userId) {
        const user = await this.syncUserVitality(userId);
        if (!user.isInTavern) return user;

        return await this.db.user.update({
            where: { id: userId },
            data: {
                isInTavern: false,
                tavernEntryAt: null
            }
        });
    }
}

module.exports = new VitalityService();