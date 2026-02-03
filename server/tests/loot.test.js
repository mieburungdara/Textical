const LootService = require('../src/services/lootService');
const prisma = require('../src/db');

// Mock prisma
jest.mock('../src/db', () => ({
    monsterTemplate: {
        findUnique: jest.fn(),
    },
    itemTemplate: {
        findUnique: jest.fn(),
    },
    heroEquipment: {
        findMany: jest.fn(),
    },
}));

describe('Loot System Tests', () => {
    
    test('Should generate loot for killed monsters', async () => {
        // Mock monster with loot
        prisma.monsterTemplate.findUnique.mockReturnValue({
            id: 1,
            name: "Orc",
            loot: [
                { itemId: 100, chance: 1.0 }, // 100% chance to drop item 100
            ],
        });

        // Mock item template
        prisma.itemTemplate.findUnique.mockReturnValue({
            id: 100,
            name: "Test Stone",
        });

        // Mock hero equipment
        prisma.heroEquipment.findMany.mockReturnValue([]);

        // Simulate 1 kill
        const loot = await LootService.generateMonsterLoot(1);
        
        expect(loot.length).toBeGreaterThan(0);
        expect(loot[0]).toHaveProperty('itemId', 100);
        expect(loot[0]).toHaveProperty('name', 'Test Stone');
    });

    test('Should return empty array if no monsters killed', async () => {
        // Mock monster not found
        prisma.monsterTemplate.findUnique.mockReturnValue(null);

        const loot = await LootService.generateMonsterLoot(0);
        expect(loot).toEqual([]);
    });
});