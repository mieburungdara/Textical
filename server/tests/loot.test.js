const LootFactory = require('../src/logic/lootFactory');
const ItemDatabase = require('../src/logic/itemDatabase');

describe('Loot System Tests', () => {
    
    test('Should generate loot for killed monsters', () => {
        // Mock ItemDatabase to always return a dummy item
        ItemDatabase.getAllByTag = jest.fn().mockReturnValue([{ id: "test_stone", name: "Test Stone" }]);

        // Simulate 100 kills to guarantee at least one drop (due to RNG)
        const monsterIds = Array(100).fill("mob_orc");
        
        const loot = LootFactory.generateLoot(monsterIds);
        
        expect(loot.length).toBeGreaterThan(0);
        expect(loot[0]).toHaveProperty('id', 'test_stone');
    });

    test('Should return empty array if no monsters killed', () => {
        const loot = LootFactory.generateLoot([]);
        expect(loot).toEqual([]);
    });
});
