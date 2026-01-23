const userRepository = require('../repositories/userRepository');
const math = require('mathjs');

class EconomyService {
    /**
     * AAA Base-1000 Progression (Ideal for Idle RPG scaling)
     * 1,000 Copper   = 1 Silver
     * 1,000 Silver   = 1 Gold
     * 1,000 Gold     = 1 Platinum
     * 1,000 Platinum = 1 Mithril
     */
    static CONVERSION_RATE = 1000;

    static TIERS = ['copper', 'silver', 'gold', 'platinum', 'mithril'];

    /**
     * Converts a specific amount from one tier to another using Base-1000 logic.
     */
    async convertCurrency(userId, fromTier, toTier, amount) {
        const fromIdx = EconomyService.TIERS.indexOf(fromTier.toLowerCase());
        const toIdx = EconomyService.TIERS.indexOf(toTier.toLowerCase());

        if (fromIdx === -1 || toIdx === -1) throw new Error("Invalid currency tier.");
        
        const user = await userRepository.findById(userId);
        if (user[fromTier] < amount) throw new Error(`Insufficient ${fromTier}.`);

        let updatedData = { ...user };
        delete updatedData.id;
        delete updatedData.heroes;
        delete updatedData.inventory;
        ['listings', 'guild', 'achievements', 'recipes', 'activeQuests'].forEach(k => delete updatedData[k]);

        const diff = toIdx - fromIdx;
        // multiplier = 1000 ^ distance
        const multiplier = math.pow(EconomyService.CONVERSION_RATE, Math.abs(diff));

        if (diff > 0) {
            // Converting UP (e.g., 1000 Copper -> 1 Silver)
            if (amount < multiplier) throw new Error(`Minimum ${multiplier} ${fromTier} required to get 1 ${toTier}.`);
            const gained = math.floor(math.divide(amount, multiplier));
            const used = math.multiply(gained, multiplier);
            
            updatedData[fromTier] = math.subtract(user[fromTier], used);
            updatedData[toTier] = math.add(user[toTier], gained);
        } else {
            // Converting DOWN (e.g., 1 Gold -> 1000 Silver)
            const gained = math.multiply(amount, multiplier);
            
            updatedData[fromTier] = math.subtract(user[fromTier], amount);
            updatedData[toTier] = math.add(user[toTier], gained);
        }

        return await userRepository.update(userId, updatedData);
    }

    /**
     * Calculates the absolute net worth of a user in Copper.
     * 1 Mithril = 1,000,000,000,000 Copper.
     */
    getTotalValueInCopper(user) {
        let total = math.bignumber(user.copper);
        total = math.add(total, math.multiply(user.silver, 1000));
        total = math.add(total, math.multiply(user.gold, 1000000));
        total = math.add(total, math.multiply(user.platinum, 1000000000));
        total = math.add(total, math.multiply(user.mithril, 1000000000000));
        return total;
    }
}

module.exports = new EconomyService();
