const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- MAPPING LEATHER & MEAT LOOT TO MONSTERS ---");

  const lootMappings = [
    // BEAST (Cat 1): Wolf Pelt, Boar Skin, Bear Fur, Panther Hide, Gryphon Leather
    // MEAT: Game Meat, Boar Shank, Wolf Haunch, Bear Tenderloin, Gryphon Breast
    { categoryId: 1, itemId: 2603, chance: 0.60 }, // Wolf Pelt
    { categoryId: 1, itemId: 3703, chance: 0.50 }, // Wolf Haunch (MEAT)
    { categoryId: 1, itemId: 3702, chance: 0.50 }, // Boar Shank (MEAT)
    { categoryId: 1, itemId: 3706, chance: 0.20 }, // Bear Tenderloin (MEAT)
    { categoryId: 1, itemId: 3714, chance: 0.05 }, // Gryphon Breast (MEAT)

    // REPTILE (Cat 2): Serpent Scale, Crocodile Leather, Salamander Skin
    // MEAT: Reptile Tail, Crocodile Tail, Salamander Tongue
    { categoryId: 2, itemId: 2604, chance: 0.60 }, // Serpent Scale
    { categoryId: 2, itemId: 3704, chance: 0.50 }, // Reptile Tail (MEAT)
    { categoryId: 2, itemId: 3707, chance: 0.30 }, // Crocodile Tail (MEAT)
    { categoryId: 2, itemId: 3711, chance: 0.10 }, // Salamander Tongue (MEAT)

    // DRAGON (Cat 4): Dragon Scale, Wyvern Leather
    // MEAT: Wyvern Wing-Meat, Dragon Heart-Steak
    { categoryId: 4, itemId: 2621, chance: 0.40 }, // Dragon Scale
    { categoryId: 4, itemId: 3721, chance: 0.30 }, // Dragon Heart-Steak (MEAT)
    { categoryId: 4, itemId: 3716, chance: 0.20 }, // Wyvern Wing-Meat (MEAT)

    // ORC/GOBLIN (Cat 7/2): NO MEAT.
    // We already have some leather mapped, we keep it but NO meat item IDs here.
  ];

  for (const mapping of lootMappings) {
    const monsters = await prisma.monsterTemplate.findMany({
        where: { categoryId: mapping.categoryId }
    });

    for (const m of monsters) {
        console.log(`   Syncing ${mapping.itemId} to ${m.name}...`);
        
        const existing = await prisma.monsterLootEntry.findFirst({
            where: { monsterId: m.id, itemId: mapping.itemId }
        });

        if (existing) {
            await prisma.monsterLootEntry.update({
                where: { id: existing.id },
                data: { chance: mapping.chance }
            });
        } else {
            await prisma.monsterLootEntry.create({
                data: { monsterId: m.id, itemId: mapping.itemId, chance: mapping.chance }
            });
        }
    }
  }

  console.log("✅ Leather & Meat Loot Mapping Complete.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
