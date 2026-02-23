/**
 * VitalityCalculator
 * @deprecated Use EnergyCalculator from '../energy/EnergyCalculator.js' instead.
 * This file is kept for backward compatibility but uses the old User.vitality field names.
 * The new system uses User.energy, User.maxEnergy, and User.lastEnergyUpdate.
 * 
 * Pure logic for determining current vitality based on elapsed time and modifiers.
 */
class VitalityCalculator {
    constructor() {
        this.BASE_REGEN_SECONDS = 300; // 1 point per 5 minutes
        this.TAVERN_REGEN_MULTIPLIER = 10; // 10x faster in Tavern
        this.INN_TIER_MULTIPLIERS = {
            1: 1.5,
            2: 2.0,
            3: 3.0
        };
        this.RESTING_XP_GAIN_RATE = 1.5; // 1.5x XP when pool is active
    }

    calculate(user, eventMult = 1.0) {
        const now = new Date();
        const elapsedSeconds = Math.floor((now - new Date(user.lastVitalityUpdate)) / 1000);
        
        if (elapsedSeconds <= 0) return { currentVit: user.vitality, lastUpdate: user.lastVitalityUpdate };

        const premium = user.premiumTier || { vitalityRegenMult: 1.0, maxVitalityBonus: 0 };
        const maxCap = user.maxVitality + (premium.maxVitalityBonus || 0);

        if (user.vitality >= maxCap) return { currentVit: user.vitality, lastUpdate: now };

        let multiplier = premium.vitalityRegenMult || 1.0;
        
        // Add Inn Multiplier if present
        if (user.currentRegion?.hasInn && user.currentRegion?.innTier) {
            const innMult = this.INN_TIER_MULTIPLIERS[user.currentRegion.innTier] || 1.0;
            multiplier *= innMult;
        }

        if (user.isInTavern) {
            multiplier *= this.TAVERN_REGEN_MULTIPLIER;
            multiplier *= eventMult; // Festival/Event bonus applied in Tavern
        }

        const secondsPerPoint = this.BASE_REGEN_SECONDS / multiplier;
        const pointsGained = Math.floor(elapsedSeconds / secondsPerPoint);
        
        let currentVit = user.vitality;
        let lastUpdate = new Date(user.lastVitalityUpdate);

        if (pointsGained > 0) {
            currentVit = Math.min(maxCap, currentVit + pointsGained);
            const consumedSeconds = Math.floor(pointsGained * secondsPerPoint);
            lastUpdate = new Date(lastUpdate.getTime() + (consumedSeconds * 1000));
        }

        return { currentVit, lastUpdate };
    }
}

module.exports = new VitalityCalculator();
