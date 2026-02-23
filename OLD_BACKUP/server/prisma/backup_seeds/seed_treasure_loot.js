/**
 * Treasure Loot Table Seeder
 * Seeds the TreasureLootTable with drop configurations
 */

const prisma = require('../src/db');

async function main() {
    console.log('Seeding treasure loot tables...');

    // Common treasure loot - basic items, low gold
    const commonLoot = [
        // Gold (always drops)
        { rarity: 'COMMON', lootType: 'GOLD', goldMin: 100, goldMax: 500, goldWeight: 100 },
        
        // Common items (various drops)
        { rarity: 'COMMON', lootType: 'ITEM', itemTemplateId: 1, quantityMin: 1, quantityMax: 3, itemWeight: 30, dropChance: 0.3 },
        { rarity: 'COMMON', lootType: 'ITEM', itemTemplateId: 2, quantityMin: 1, quantityMax: 2, itemWeight: 25, dropChance: 0.25 },
        { rarity: 'COMMON', lootType: 'ITEM', itemTemplateId: 3, quantityMin: 2, quantityMax: 5, itemWeight: 20, dropChance: 0.2 },
        { rarity: 'COMMON', lootType: 'ITEM', itemTemplateId: 4, quantityMin: 1, quantityMax: 1, itemWeight: 15, dropChance: 0.15 },
    ];

    // Uncommon treasure loot - better items, medium gold
    const uncommonLoot = [
        { rarity: 'UNCOMMON', lootType: 'GOLD', goldMin: 500, goldMax: 2000, goldWeight: 100 },
        
        // Uncommon items
        { rarity: 'UNCOMMON', lootType: 'ITEM', itemTemplateId: 5, quantityMin: 1, quantityMax: 2, itemWeight: 30, dropChance: 0.4 },
        { rarity: 'UNCOMMON', lootType: 'ITEM', itemTemplateId: 6, quantityMin: 1, quantityMax: 3, itemWeight: 25, dropChance: 0.35 },
        { rarity: 'UNCOMMON', lootType: 'ITEM', itemTemplateId: 7, quantityMin: 2, quantityMax: 4, itemWeight: 20, dropChance: 0.3 },
        { rarity: 'UNCOMMON', lootType: 'ITEM', itemTemplateId: 8, quantityMin: 1, quantityMax: 2, itemWeight: 15, dropChance: 0.25 },
    ];

    // Rare treasure loot - good items, high gold, chance for Epic
    const rareLoot = [
        { rarity: 'RARE', lootType: 'GOLD', goldMin: 2000, goldMax: 10000, goldWeight: 100 },
        
        // Rare items
        { rarity: 'RARE', lootType: 'ITEM', itemTemplateId: 9, quantityMin: 1, quantityMax: 2, itemWeight: 30, dropChance: 0.5, isEpicItem: false, itemRarity: 'RARE' },
        { rarity: 'RARE', lootType: 'ITEM', itemTemplateId: 10, quantityMin: 1, quantityMax: 3, itemWeight: 25, dropChance: 0.45, isEpicItem: false, itemRarity: 'RARE' },
        { rarity: 'RARE', lootType: 'ITEM', itemTemplateId: 11, quantityMin: 2, quantityMax: 4, itemWeight: 20, dropChance: 0.4, isEpicItem: false, itemRarity: 'RARE' },
        { rarity: 'RARE', lootType: 'ITEM', itemTemplateId: 12, quantityMin: 1, quantityMax: 2, itemWeight: 15, dropChance: 0.35, isEpicItem: true, itemRarity: 'EPIC' },
    ];

    // Legendary treasure loot - best items, very high gold, guaranteed Epic/Legendary
    const legendaryLoot = [
        { rarity: 'LEGENDARY', lootType: 'GOLD', goldMin: 10000, goldMax: 50000, goldWeight: 100 },
        
        // Epic items
        { rarity: 'LEGENDARY', lootType: 'ITEM', itemTemplateId: 13, quantityMin: 1, quantityMax: 2, itemWeight: 25, dropChance: 0.7, isEpicItem: true, itemRarity: 'EPIC' },
        { rarity: 'LEGENDARY', lootType: 'ITEM', itemTemplateId: 14, quantityMin: 1, quantityMax: 3, itemWeight: 20, dropChance: 0.6, isEpicItem: true, itemRarity: 'EPIC' },
        { rarity: 'LEGENDARY', lootType: 'ITEM', itemTemplateId: 15, quantityMin: 2, quantityMax: 4, itemWeight: 15, dropChance: 0.5, isEpicItem: true, itemRarity: 'EPIC' },
        
        // Legendary items
        { rarity: 'LEGENDARY', lootType: 'ITEM', itemTemplateId: 16, quantityMin: 1, quantityMax: 1, itemWeight: 10, dropChance: 0.3, isLegendaryItem: true, itemRarity: 'LEGENDARY' },
        { rarity: 'LEGENDARY', lootType: 'ITEM', itemTemplateId: 17, quantityMin: 1, quantityMax: 1, itemWeight: 8, dropChance: 0.25, isLegendaryItem: true, itemRarity: 'LEGENDARY' },
        { rarity: 'LEGENDARY', lootType: 'ITEM', itemTemplateId: 18, quantityMin: 1, quantityMax: 1, itemWeight: 5, dropChance: 0.2, isLegendaryItem: true, itemRarity: 'LEGENDARY' },
    ];

    const allLoot = [...commonLoot, ...uncommonLoot, ...rareLoot, ...legendaryLoot];

    for (const loot of allLoot) {
        await prisma.treasureLootTable.upsert({
            where: {
                rarity_lootType_itemTemplateId: {
                    rarity: loot.rarity,
                    lootType: loot.lootType,
                    itemTemplateId: loot.itemTemplateId || 0
                }
            },
            update: loot,
            create: loot
        });
    }

    console.log(`Seeded ${allLoot.length} treasure loot entries`);
    console.log('Treasure loot tables seeded successfully!');
}

main()
    .catch((e) => {
        console.error('Error seeding treasure loot tables:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
