/**
 * VitalityCalculator
 * Pure logic for determining current vitality based on elapsed time and modifiers.
 */
class VitalityCalculator {
    constructor() {
        this.BASE_REGEN_SECONDS = 300; // 1 point per 5 minutes
        this.TAVERN_REGEN_MULTIPLIER = 10; // 10x faster in Tavern
    }

    calculate(user) {
        const now = new Date();
        const elapsedSeconds = Math.floor((now - new Date(user.lastVitalityUpdate)) / 1000);
        
        if (elapsedSeconds <= 0) return { currentVit: user.vitality, lastUpdate: user.lastVitalityUpdate };

        const premium = user.premiumTier || { vitalityRegenMult: 1.0, maxVitalityBonus: 0 };
        const maxCap = user.maxVitality + (premium.maxVitalityBonus || 0);

        if (user.vitality >= maxCap) return { currentVit: user.vitality, lastUpdate: now };

        let multiplier = premium.vitalityRegenMult || 1.0;
        if (user.isInTavern) multiplier *= this.TAVERN_REGEN_MULTIPLIER;

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
