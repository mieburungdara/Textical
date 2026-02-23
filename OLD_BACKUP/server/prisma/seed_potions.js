/**
 * Seed: Potions
 * Creates health potions, mana potions, and other consumables
 * Run with: node prisma/seed_potions.js
 */

const prisma = require('../src/db');

const POTIONS = [
    // Health Potions
    {
        name: "Small Health Potion",
        description: "Restores 50 HP. A basic healing draught.",
        category: "CONSUMABLE",
        rarity: "COMMON",
        baseValue: 10,
        stats: JSON.stringify({ hp_restore: 50 })
    },
    {
        name: "Medium Health Potion",
        description: "Restores 150 HP. A standard healing potion.",
        category: "CONSUMABLE",
        rarity: "UNCOMMON",
        baseValue: 50,
        stats: JSON.stringify({ hp_restore: 150 })
    },
    {
        name: "Large Health Potion",
        description: "Restores 500 HP. A potent healing draught.",
        category: "CONSUMABLE",
        rarity: "RARE",
        baseValue: 200,
        stats: JSON.stringify({ hp_restore: 500 })
    },
    {
        name: "Greater Health Potion",
        description: "Restores 1000 HP. A powerful elixir of life.",
        category: "CONSUMABLE",
        rarity: "EPIC",
        baseValue: 500,
        stats: JSON.stringify({ hp_restore: 1000 })
    },
    // Mana Potions
    {
        name: "Small Mana Potion",
        description: "Restores 25 MP. A basic mana draught.",
        category: "CONSUMABLE",
        rarity: "COMMON",
        baseValue: 15,
        stats: JSON.stringify({ mp_restore: 25 })
    },
    {
        name: "Medium Mana Potion",
        description: "Restores 75 MP. A standard mana potion.",
        category: "CONSUMABLE",
        rarity: "UNCOMMON",
        baseValue: 75,
        stats: JSON.stringify({ mp_restore: 75 })
    },
    {
        name: "Large Mana Potion",
        description: "Restores 250 MP. A potent mana elixir.",
        category: "CONSUMABLE",
        rarity: "RARE",
        baseValue: 300,
        stats: JSON.stringify({ mp_restore: 250 })
    },
    // Stamina/Energy Potions
    {
        name: "Stamina Potion",
        description: "Restores 30 Energy. Quick energy boost.",
        category: "CONSUMABLE",
        rarity: "COMMON",
        baseValue: 20,
        stats: JSON.stringify({ energy_restore: 30 })
    },
    // Antidotes
    {
        name: "Antidote",
        description: "Cures poison effects. Essential for adventurers.",
        category: "CONSUMABLE",
        rarity: "COMMON",
        baseValue: 25,
        stats: JSON.stringify({ cures_poison: true })
    },
    // Strength Buffs
    {
        name: "Strength Elixir",
        description: "Increases strength by 10 for 5 minutes.",
        category: "CONSUMABLE",
        rarity: "UNCOMMON",
        baseValue: 100,
        stats: JSON.stringify({ buff_str: 10, buff_duration: 300 })
    },
    {
        name: "Speed Elixir",
        description: "Increases movement speed by 20% for 3 minutes.",
        category: "CONSUMABLE",
        rarity: "UNCOMMON",
        baseValue: 150,
        stats: JSON.stringify({ buff_speed: 0.2, buff_duration: 180 })
    }
];

const START_ID = 5001; // Starting ID for potions

async function main() {
    console.log('🧪 Seeding Potions...\n');

    for (let i = 0; i < POTIONS.length; i++) {
        const potion = POTIONS[i];
        const itemId = START_ID + i;

        await prisma.itemTemplate.upsert({
            where: { id: itemId },
            update: {
                name: potion.name,
                description: potion.description,
                category: potion.category,
                rarity: potion.rarity,
                baseValue: potion.baseValue,
                maxStack: 99,
                isQuestItem: false
            },
            create: {
                id: itemId,
                name: potion.name,
                description: potion.description,
                category: potion.category,
                rarity: potion.rarity,
                baseValue: potion.baseValue,
                maxStack: 99,
                isQuestItem: false
            }
        });

        console.log(`  ✅ Created: ${potion.name} (ID: ${itemId}) - ${potion.rarity}`);
    }

    console.log(`\n🎉 Successfully seeded ${POTIONS.length} potions!`);
    console.log(`   ID Range: ${START_ID} - ${START_ID + POTIONS.length - 1}`);
}

main()
    .catch((e) => {
        console.error('❌ Error seeding potions:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
