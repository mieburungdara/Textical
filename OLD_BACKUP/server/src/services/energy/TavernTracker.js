/**
 * TavernTracker
 * Manages Tavern-specific logic: limits, entry/exit, and daily resets.
 * Used by EnergyService for energy regeneration in taverns.
 */
class TavernTracker {
    constructor() {
        this.DAILY_TAVERN_LIMIT_SECONDS = 1440; // 24 Minutes
    }

    process(user) {
        const now = new Date();
        const premium = user.premiumTier || { queueSlots: 0 };
        const totalTavernLimit = this.DAILY_TAVERN_LIMIT_SECONDS + (premium.queueSlots || 0);

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

        return { dailySeconds, lastReset, inTavern, entryAt, totalLimit: totalTavernLimit };
    }
}

module.exports = new TavernTracker();
