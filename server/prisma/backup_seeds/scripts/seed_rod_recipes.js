const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL FISHING ROD RECIPES ---");

  const recipes = [
    { 
        id: 5901, name: "Wooden Rod Recipe", craftTimeSeconds: 15, resultItemId: 3501,
        ingredients: [ { itemId: 2901, quantity: 2 }, { itemId: 3201, quantity: 1 } ] // 2 Oak Plank + 1 Green Thread
    },
    { 
        id: 5902, name: "Iron Rod Recipe", craftTimeSeconds: 25, resultItemId: 3502,
        ingredients: [ { itemId: 2901, quantity: 2 }, { itemId: 2703, quantity: 1 }, { itemId: 3201, quantity: 1 } ] // 2 Oak Plank + 1 Iron Bar + 1 Green Thread
    },
    { 
        id: 5903, name: "Steel Rod Recipe", craftTimeSeconds: 40, resultItemId: 3503,
        ingredients: [ { itemId: 2903, quantity: 2 }, { itemId: 2703, quantity: 1 }, { itemId: 3202, quantity: 1 } ] // 2 Birch Plank + 1 Iron Bar + 1 Blue Mana-Thread
    },
    { 
        id: 5904, name: "Mithril Rod Recipe", craftTimeSeconds: 80, resultItemId: 3504,
        ingredients: [ { itemId: 2911, quantity: 2 }, { itemId: 2714, quantity: 1 }, { itemId: 3217, quantity: 1 } ] // 2 Yew Plank + 1 Mithril Bar + 1 Lunar Silk
    },
    { 
        id: 5905, name: "Adamantite Rod Recipe", craftTimeSeconds: 180, resultItemId: 3505,
        ingredients: [ { itemId: 2913, quantity: 2 }, { itemId: 2721, quantity: 1 }, { itemId: 3225, quantity: 1 } ] // 2 Ironwood Plank + 1 Adamantite Bar + 1 World-Tree Raiment
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

  console.log("✅ Fishing Rod Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
