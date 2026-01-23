const userRepository = require('../repositories/userRepository');
const math = require('mathjs');

class EconomyService {
    static COPPER_PER_GOLD = 100;

    /**
     * Converts Gold to Copper
     */
    async convertGoldToCopper(userId, goldAmount) {
        const user = await userRepository.findById(userId);
        if (user.gold < goldAmount) throw new Error("Insufficient Gold.");

        const copperGained = math.multiply(goldAmount, EconomyService.COPPER_PER_GOLD);
        
        return await userRepository.update(userId, {
            gold: math.subtract(user.gold, goldAmount),
            copper: math.add(user.copper, copperGained)
        });
    }

    /**
     * Converts Copper to Gold (The "Banker" logic)
     */
    async convertCopperToGold(userId, copperAmount) {
        if (copperAmount < EconomyService.COPPER_PER_GOLD) {
            throw new Error(`Minimum conversion is ${EconomyService.COPPER_PER_GOLD} Copper.`);
        }

        const user = await userRepository.findById(userId);
        if (user.copper < copperAmount) throw new Error("Insufficient Copper.");

        const goldGained = math.floor(math.divide(copperAmount, EconomyService.COPPER_PER_GOLD));
        const copperRemaining = math.mod(copperAmount, EconomyService.COPPER_PER_GOLD);
        const actualCopperUsed = math.subtract(copperAmount, copperRemaining);

        return await userRepository.update(userId, {
            gold: math.add(user.gold, goldGained),
            copper: math.subtract(user.copper, actualCopperUsed)
        });
    }
}

module.exports = new EconomyService();
