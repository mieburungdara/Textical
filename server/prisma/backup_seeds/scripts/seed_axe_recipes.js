const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL AXE RECIPES ---");

  const recipes = [
    { 
        id: 5101, name: "Flint Axe Recipe", craftTimeSeconds: 10, resultItemId: 2501,
        ingredients: [ { itemId: 2201, quantity: 3 }, { itemId: 2200, quantity: 2 } ] // 3 Granite + 2 Oak Wood
    },
    { 
        id: 5102, name: "Iron Axe Recipe", craftTimeSeconds: 20, resultItemId: 2502,
        ingredients: [ { itemId: 2203, quantity: 3 }, { itemId: 2401, quantity: 2 } ] // 3 Iron Ore + 2 Oak Wood
    },
    { 
        id: 5103, name: "Steel Axe Recipe", craftTimeSeconds: 30, resultItemId: 2503,
        ingredients: [ { itemId: 2203, quantity: 3 }, { itemId: 2205, quantity: 1 }, { itemId: 2403, quantity: 2 } ] // 3 Iron + 1 Coal + 2 Birch
    },
    { 
        id: 5104, name: "Mithril Axe Recipe", craftTimeSeconds: 60, resultItemId: 2504,
        ingredients: [ { itemId: 2214, quantity: 3 }, { itemId: 2411, quantity: 2 } ] // 3 Mithril + 2 Yew Wood
    },
    { 
        id: 5105, name: "Adamantite Axe Recipe", craftTimeSeconds: 120, resultItemId: 2505,
        ingredients: [ { itemId: 2221, quantity: 3 }, { itemId: 2413, quantity: 2 } ] // 3 Adamantite + 2 Ironwood
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

  console.log("✅ Axe Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
