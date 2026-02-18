const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL HUNTING TOOL RECIPES ---");

  const recipes = [
    // SKINNER'S KNIVES (IDs 6101-6105)
    { 
        id: 6101, name: "Flint Skinner's Knife Recipe", craftTimeSeconds: 15, resultItemId: 3901,
        ingredients: [ { itemId: 2701, quantity: 2 }, { itemId: 2901, quantity: 1 } ] // 2 Granite + 1 Oak Plank
    },
    { 
        id: 6102, name: "Iron Skinner's Knife Recipe", craftTimeSeconds: 25, resultItemId: 3902,
        ingredients: [ { itemId: 2703, quantity: 2 }, { itemId: 3102, quantity: 1 } ] // 2 Iron Bar + 1 Boar Leather
    },
    { 
        id: 6103, name: "Steel Skinner's Knife Recipe", craftTimeSeconds: 40, resultItemId: 3903,
        ingredients: [ { itemId: 2703, quantity: 2 }, { itemId: 3106, quantity: 1 } ] // 2 Iron Bar + 1 Bear Leather
    },
    { 
        id: 6104, name: "Mithril Skinner's Knife Recipe", craftTimeSeconds: 80, resultItemId: 3904,
        ingredients: [ { itemId: 2714, quantity: 2 }, { itemId: 3114, quantity: 1 } ] // 2 Mithril Bar + 1 Gryphon Leather
    },
    { 
        id: 6105, name: "Adamantite Skinner's Knife Recipe", craftTimeSeconds: 180, resultItemId: 3905,
        ingredients: [ { itemId: 2721, quantity: 2 }, { itemId: 3121, quantity: 1 } ] // 2 Adamantite Bar + 1 Dragon Plate
    },

    // BUTCHER'S CLEAVERS (IDs 6201-6205)
    { 
        id: 6201, name: "Flint Butcher's Cleaver Recipe", craftTimeSeconds: 15, resultItemId: 4101,
        ingredients: [ { itemId: 2701, quantity: 3 }, { itemId: 2901, quantity: 1 } ] // 3 Granite + 1 Oak Plank
    },
    { 
        id: 6202, name: "Iron Butcher's Cleaver Recipe", craftTimeSeconds: 25, resultItemId: 4102,
        ingredients: [ { itemId: 2703, quantity: 3 }, { itemId: 3102, quantity: 1 } ] // 3 Iron Bar + 1 Boar Leather
    },
    { 
        id: 6203, name: "Steel Butcher's Cleaver Recipe", craftTimeSeconds: 40, resultItemId: 4103,
        ingredients: [ { itemId: 2703, quantity: 3 }, { itemId: 3106, quantity: 1 } ] // 3 Iron Bar + 1 Bear Leather
    },
    { 
        id: 6204, name: "Mithril Butcher's Cleaver Recipe", craftTimeSeconds: 80, resultItemId: 4104,
        ingredients: [ { itemId: 2714, quantity: 3 }, { itemId: 3114, quantity: 1 } ] // 3 Mithril Bar + 1 Gryphon Leather
    },
    { 
        id: 6205, name: "Adamantite Butcher's Cleaver Recipe", craftTimeSeconds: 180, resultItemId: 4105,
        ingredients: [ { itemId: 2721, quantity: 3 }, { itemId: 3121, quantity: 1 } ] // 3 Adamantite Bar + 1 Dragon Plate
    }
  ];

  for (const r of recipes) {
    console.log(`   Syncing Recipe: ${r.name}...`);
    
    await prisma.recipeTemplate.upsert({
        where: { id: r.id },
        update: { name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: r.craftTimeSeconds, description: `Craft a ${r.name.replace(' Recipe', '')}` },
        create: { id: r.id, name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: r.craftTimeSeconds, description: `Craft a ${r.name.replace(' Recipe', '')}` }
    });

    await prisma.recipeIngredient.deleteMany({ where: { recipeId: r.id } });
    
    for (const ing of r.ingredients) {
        await prisma.recipeIngredient.create({
            data: {
                recipeId: r.id,
                itemId: ing.itemId,
                quantity: ing.quantity
            }
        });
    }
  }

  console.log("✅ 10 Hunting Tool Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
