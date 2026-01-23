const userRepository = require('../repositories/userRepository');
const math = require('mathjs');

class EconomyService {
    /**
     * Base-100 Progression
     * 100 Copper   = 1 Silver
     * 100 Silver   = 1 Gold
     * 100 Gold     = 1 Platinum
     * 100 Platinum = 1 Mithril
     */
    static CONVERSION_RATE = 100;

    static TIERS = ['copper', 'silver', 'gold', 'platinum', 'mithril'];

    /**
     * Converts a specific amount from one tier to another.
     * @param {Int} userId 
     * @param {String} fromTier - e.g., 'gold'
     * @param {String} toTier - e.g., 'copper'
     * @param {Int} amount 
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
        // Clean up other relations for prisma update
        ['listings', 'guild', 'achievements', 'recipes', 'activeQuests'].forEach(k => delete updatedData[k]);

        // Calculate distance
        const diff = toIdx - fromIdx;
        const multiplier = math.pow(EconomyService.CONVERSION_RATE, Math.abs(diff));

        if (diff > 0) {
            // Converting UP (e.g., Copper to Silver)
            if (amount < multiplier) throw new Error(`Minimum ${multiplier} ${fromTier} required to get 1 ${toTier}.`);
            const gained = math.floor(math.divide(amount, multiplier));
            const used = math.multiply(gained, multiplier);
            
            updatedData[fromTier] = math.subtract(user[fromTier], used);
            updatedData[toTier] = math.add(user[toTier], gained);
        } else {
            // Converting DOWN (e.g., Gold to Silver)
            const gained = math.multiply(amount, multiplier);
            
            updatedData[fromTier] = math.subtract(user[fromTier], amount);
            updatedData[toTier] = math.add(user[toTier], gained);
        }

        return await userRepository.update(userId, updatedData);
    }

    /**
     * Utility to check if a user can afford a total cost in Copper equivalent.
     * Useful for complex pricing.
     */
    async canAffordInCopper(user, totalCopperCost) {
        const userTotal = this.getTotalValueInCopper(user);
        return userTotal >= totalCopperCost;
    }

    getTotalValueInCopper(user) {
        let total = math.bignumber(user.copper);
        total = math.add(total, math.multiply(user.silver, 100));
        total = math.add(total, math.multiply(user.gold, 10000));
        total = math.add(total, math.multiply(user.platinum, 1000000));
        total = math.add(total, math.multiply(user.mithril, 100000000));
        return total;
    }
}

module.exports = new EconomyService();