const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- MAPPING LEATHER LOOT TO MONSTER CATEGORIES (v2) ---");

  const lootMappings = [
    // BEAST (Cat 1): Wolf Pelt, Boar Skin, Bear Fur, Panther Hide, Gryphon Leather
    { categoryId: 1, itemId: 2603, chance: 0.60 }, // Wolf Pelt
    { categoryId: 1, itemId: 2602, chance: 0.50 }, // Boar Skin
    { categoryId: 1, itemId: 2606, chance: 0.20 }, // Bear Fur
    { categoryId: 1, itemId: 2612, chance: 0.05 }, // Shadow Panther
    { categoryId: 1, itemId: 2614, chance: 0.03 }, // Gryphon

    // REPTILE (Cat 2): Serpent Scale, Crocodile Leather, Salamander Skin, Hydra Skin
    { categoryId: 2, itemId: 2604, chance: 0.60 }, // Serpent Scale
    { categoryId: 2, itemId: 2607, chance: 0.30 }, // Crocodile Leather
    { categoryId: 2, itemId: 2611, chance: 0.10 }, // Salamander Skin
    { categoryId: 2, itemId: 2619, chance: 0.02 }, // Hydra Skin

    // SLIME (Cat 3): Venomous Hide, Ethereal Membrane
    { categoryId: 3, itemId: 2609, chance: 0.20 }, // Venomous Hide
    { categoryId: 3, itemId: 2618, chance: 0.02 }, // Ethereal Membrane

    // DRAGON (Cat 4): Dragon Scale, Phoenix Hide, Celestial Membrane, Wyvern Leather
    { categoryId: 4, itemId: 2621, chance: 0.40 }, // Dragon Scale
    { categoryId: 4, itemId: 2622, chance: 0.05 }, // Phoenix Hide
    { categoryId: 4, itemId: 2625, chance: 0.01 }, // Celestial Hide
    { categoryId: 4, itemId: 2616, chance: 0.15 }, // Wyvern Leather

    // INSECT (Cat 6): Bat Membrane (Cave Spiders often share drops), Iron-Shell Hide
    { categoryId: 6, itemId: 2605, chance: 0.40 }, // Bat Membrane (Spider webbing substitute)
    { categoryId: 6, itemId: 2617, chance: 0.05 }  // Iron-Shell
  ];

  for (const mapping of lootMappings) {
    const monsters = await prisma.monsterTemplate.findMany({
        where: { categoryId: mapping.categoryId }
    });

    for (const m of monsters) {
        console.log(`   Assigning ${mapping.itemId} to ${m.name} (${mapping.chance * 100}%)...`);
        
        // Find existing loot record
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

  console.log("✅ Leather Loot Mapping Complete.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });