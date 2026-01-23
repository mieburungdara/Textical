const ItemDatabase = require('./itemDatabase');

class LootFactory {
    /**
     * Generates a list of items based on defeated monster IDs.
     * @param {Array<string>} monsterIds 
     */
    static generateLoot(monsterIds) {
        const loot = [];
        
        monsterIds.forEach(id => {
            // Logic: Every kill has a 20% chance to drop a random stone
            if (Math.random() < 0.2) {
                const possibleStones = ItemDatabase.getAllByTag("crafting");
                if (possibleStones.length > 0) {
                    const chosen = possibleStones[Math.floor(Math.random() * possibleStones.length)];
                    loot.push(chosen);
                }
            }
        });
        
        return loot;
    }
}

module.exports = LootFactory;
