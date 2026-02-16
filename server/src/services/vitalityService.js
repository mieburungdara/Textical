const BaseService = require('./BaseService'); // FIXED PATH
const vitalityCalculator = require('./vitality/VitalityCalculator');
const tavernTracker = require('./vitality/TavernTracker');
const tavernEventService = require('./TavernEventService');
const infamyService = require('./InfamyService');
const { AppError, ErrorCodes } = require('../utils/AppError');

/**
 * @deprecated Use energyService.js instead.
 * VitalityService (v2.0 - Modular Orchestrator)
 * Centralizes Vitality management by composing specialized logic handlers.
 * 
 * NOTE: This service is DEPRECATED. Use energyService.js which uses the new
 * User.energy field instead of the old User.vitality field.
 * Hero.vitality (core stat for HP) remains unchanged.
 */
class VitalityService extends BaseService {
    
    async syncUserVitality(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { 
                premiumTier: true
                // region: true // Not needed if we only need ID
            }
        });

        if (!user) throw new AppError(ErrorCodes.USER_NOT_FOUND, 'User not found');

        // 1. Process Tavern State
        const tavernState = tavernTracker.process(user);

        // 2. Process Vitality Regen (respecting possibly updated Tavern status)
        const eventMult = await tavernEventService.getRegionMultiplier(user.currentRegion);
        const updatedUserForCalc = { ...user, isInTavern: tavernState.inTavern };
        const { currentVit, lastUpdate } = vitalityCalculator.calculate(updatedUserForCalc, eventMult);

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
            include: { 
                premiumTier: true
            }
        });
    }

    async consumeVitality(userId, amount) {
        const user = await this.syncUserVitality(userId);
        if (user.vitality < amount) {
            throw new AppError(ErrorCodes.VITALITY_INSUFFICIENT, 
                `Insufficient Vitality. Need ${amount}, have ${user.vitality}`, 
                { context: { required: amount, available: user.vitality } }
            );
        }

        return await this.db.user.update({
            where: { id: userId },
            data: { vitality: user.vitality - amount }
        });
    }

    async enterTavern(userId) {
        const user = await this.syncUserVitality(userId);
        if (!user.currentRegion?.hasInn) {
            throw new AppError(ErrorCodes.TAVERN_NO_INN, 
                'This region does not have an Inn. You cannot enter the tavern here.');
        }

        // AAA: Infamy Check
        const access = await infamyService.canEnterInn(userId, user.currentRegionId);
        if (!access.allowed) {
            throw new AppError(ErrorCodes.AUTH_FORBIDDEN, access.reason);
        }

        const tavernState = tavernTracker.process(user);

        if (tavernState.dailySeconds >= tavernState.totalLimit) {
            throw new AppError(ErrorCodes.TAVERN_DAILY_LIMIT, 
                'Tavern daily limit reached. You are too exhausted to enter.');
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
