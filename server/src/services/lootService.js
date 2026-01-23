const itemRepository = require('../repositories/itemRepository');

class LootService {
    /**
     * Generates a list of items based on defeated monster IDs.
     * @param {Array<string>} monsterIds 
     */
    generateLoot(monsterIds) {
        const loot = [];
        
        monsterIds.forEach(id => {
            // Logic: Every kill has a 20% chance to drop a random stone
            if (Math.random() < 0.2) {
                // FIX: Use itemRepository
                const possibleStones = itemRepository.getAllByTag("crafting");
                if (possibleStones.length > 0) {
                    const chosen = possibleStones[Math.floor(Math.random() * possibleStones.length)];
                    loot.push(chosen);
                }
            }
        });
        
        return loot;
    }
}

module.exports = new LootService();