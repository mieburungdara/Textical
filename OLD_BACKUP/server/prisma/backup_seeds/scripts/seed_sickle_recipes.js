const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL HERBALISM SICKLE RECIPES ---");

  const recipes = [
    { 
        id: 6001, name: "Flint Sickle Recipe", craftTimeSeconds: 15, resultItemId: 3601,
        ingredients: [ { itemId: 2701, quantity: 2 }, { itemId: 2901, quantity: 1 } ] // 2 Granite Block + 1 Oak Plank
    },
    { 
        id: 6002, name: "Iron Sickle Recipe", craftTimeSeconds: 25, resultItemId: 3602,
        ingredients: [ { itemId: 2703, quantity: 2 }, { itemId: 2901, quantity: 1 }, { itemId: 3201, quantity: 1 } ] // 2 Iron Bar + 1 Oak Plank + 1 Green Thread
    },
    { 
        id: 6003, name: "Steel Sickle Recipe", craftTimeSeconds: 40, resultItemId: 3603,
        ingredients: [ { itemId: 2703, quantity: 2 }, { itemId: 2903, quantity: 1 }, { itemId: 3202, quantity: 1 } ] // 2 Iron Bar + 1 Birch Plank + 1 Blue Mana-Thread
    },
    { 
        id: 6004, name: "Mithril Sickle Recipe", craftTimeSeconds: 80, resultItemId: 3604,
        ingredients: [ { itemId: 2714, quantity: 2 }, { itemId: 2911, quantity: 1 }, { itemId: 3217, quantity: 1 } ] // 2 Mithril Bar + 1 Yew Plank + 1 Lunar Silk
    },
    { 
        id: 6005, name: "Adamantite Sickle Recipe", craftTimeSeconds: 180, resultItemId: 3605,
        ingredients: [ { itemId: 2721, quantity: 2 }, { itemId: 2913, quantity: 1 }, { itemId: 3225, quantity: 1 } ] // 2 Adamantite Bar + 1 Ironwood Plank + 1 World-Tree Raiment
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

  console.log("✅ Sickle Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
