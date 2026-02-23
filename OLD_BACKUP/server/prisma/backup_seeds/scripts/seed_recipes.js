const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL MATERIALS & RECIPES (PICKAXE) ---");

  // 1. Seed Oak Wood (ID 2200)
  await prisma.itemTemplate.upsert({
    where: { id: 2200 },
    update: { name: "Oak Wood", category: "MATERIAL", description: "Standard wood used for handles and basic tools." },
    create: { id: 2200, name: "Oak Wood", category: "MATERIAL", description: "Standard wood used for handles and basic tools.", baseValue: 2, rarity: "COMMON" }
  });

  const recipes = [
    { 
        id: 5001, name: "Wooden Pickaxe Recipe", craftTimeSeconds: 10, resultItemId: 2301,
        ingredients: [ { itemId: 2200, quantity: 5 } ] // 5 Oak Wood
    },
    { 
        id: 5002, name: "Iron Pickaxe Recipe", craftTimeSeconds: 20, resultItemId: 2302,
        ingredients: [ { itemId: 2203, quantity: 3 }, { itemId: 2200, quantity: 2 } ] // 3 Iron Ore + 2 Wood
    },
    { 
        id: 5003, name: "Steel Pickaxe Recipe", craftTimeSeconds: 30, resultItemId: 2303,
        ingredients: [ { itemId: 2203, quantity: 3 }, { itemId: 2205, quantity: 1 } ] // 3 Iron + 1 Coal
    },
    { 
        id: 5004, name: "Mithril Pickaxe Recipe", craftTimeSeconds: 60, resultItemId: 2304,
        ingredients: [ { itemId: 2214, quantity: 3 }, { itemId: 2206, quantity: 1 } ] // 3 Mithril + 1 Silver
    },
    { 
        id: 5005, name: "Adamantite Pickaxe Recipe", craftTimeSeconds: 120, resultItemId: 2305,
        ingredients: [ { itemId: 2221, quantity: 3 }, { itemId: 2215, quantity: 1 } ] // 3 Adamantite + 1 Titanium
    }
  ];

  for (const r of recipes) {
    console.log(`   Syncing Recipe: ${r.name}...`);
    
    // Create Template
    await prisma.recipeTemplate.upsert({
        where: { id: r.id },
        update: { name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: r.craftTimeSeconds, description: `Craft a ${r.name.replace(' Recipe', '')}` },
        create: { id: r.id, name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: r.craftTimeSeconds, description: `Craft a ${r.name.replace(' Recipe', '')}` }
    });

    // Sync Ingredients
    // Clean old ingredients for this recipe to ensure fresh state
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

  console.log("✅ Pickaxe Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
