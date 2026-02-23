/**
 * EnergyCalculator
 * Pure logic for determining current energy based on elapsed time and modifiers.
 * Renamed from VitalityCalculator to avoid confusion with Hero.vitality (core stat).
 */
class EnergyCalculator {
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
        
        // Handle null/undefined lastEnergyUpdate - use current time as fallback
        const lastUpdateRaw = user.lastEnergyUpdate;
        const lastUpdateDate = lastUpdateRaw ? new Date(lastUpdateRaw) : now;
        
        // Validate the date is valid
        const isValidDate = !isNaN(lastUpdateDate.getTime());
        const effectiveLastUpdate = isValidDate ? lastUpdateDate : now;
        
        const elapsedSeconds = Math.floor((now - effectiveLastUpdate) / 1000);
        
        // Handle null/undefined energy and maxEnergy with safe defaults
        const safeEnergy = user.energy ?? 100;
        const safeMaxEnergy = user.maxEnergy ?? 100;
        
        if (elapsedSeconds <= 0) return { currentEnergy: safeEnergy, lastUpdate: effectiveLastUpdate };

        const premium = user.premiumTier || { energyRegenMult: 1.0, maxEnergyBonus: 0 };
        const maxCap = safeMaxEnergy + (premium.maxEnergyBonus || 0);

        if (safeEnergy >= maxCap) return { currentEnergy: safeEnergy, lastUpdate: now };

        let multiplier = premium.energyRegenMult || 1.0;
        
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
        
        let currentEnergy = safeEnergy;
        let lastUpdate = new Date(effectiveLastUpdate);

        if (pointsGained > 0) {
            currentEnergy = Math.min(maxCap, currentEnergy + pointsGained);
            const consumedSeconds = Math.floor(pointsGained * secondsPerPoint);
            lastUpdate = new Date(lastUpdate.getTime() + (consumedSeconds * 1000));
        }

        return { currentEnergy, lastUpdate };
    }
}

module.exports = new EnergyCalculator();
