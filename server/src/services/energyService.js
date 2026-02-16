const BaseService = require('./BaseService');
const energyCalculator = require('./energy/EnergyCalculator');
const tavernTracker = require('./energy/TavernTracker');
const tavernEventService = require('./TavernEventService');
const infamyService = require('./InfamyService');
const { AppError, ErrorCodes } = require('../utils/AppError');

/**
 * EnergyService (v2.0 - Modular Orchestrator)
 * Centralizes Energy management by composing specialized logic handlers.
 * Renamed from VitalityService to avoid confusion with Hero.vitality (core stat).
 */
class EnergyService extends BaseService {
    
    async syncUserEnergy(userId) {
        const user = await this.db.user.findUnique({
            where: { id: userId },
            include: { 
                premiumTier: true
            }
        });

        if (!user) throw new AppError(ErrorCodes.USER_NOT_FOUND, 'User not found');

        // 1. Process Tavern State
        const tavernState = tavernTracker.process(user);

        // 2. Process Energy Regen (respecting possibly updated Tavern status)
        const eventMult = await tavernEventService.getRegionMultiplier(user.currentRegion);
        const updatedUserForCalc = { ...user, isInTavern: tavernState.inTavern };
        const { currentEnergy, lastUpdate } = energyCalculator.calculate(updatedUserForCalc, eventMult);

        return await this.db.user.update({
            where: { id: userId },
            data: {
                energy: currentEnergy,
                lastEnergyUpdate: lastUpdate,
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

    async consumeEnergy(userId, amount) {
        const user = await this.syncUserEnergy(userId);
        if (user.energy < amount) {
            throw new AppError(ErrorCodes.ENERGY_INSUFFICIENT, 
                `Insufficient Energy. Need ${amount}, have ${user.energy}`, 
                { context: { required: amount, available: user.energy } }
            );
        }

        return await this.db.user.update({
            where: { id: userId },
            data: { energy: user.energy - amount }
        });
    }

    async enterTavern(userId) {
        const user = await this.syncUserEnergy(userId);
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
        const user = await this.syncUserEnergy(userId);
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

module.exports = new EnergyService();
