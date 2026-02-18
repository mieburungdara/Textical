const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL EQUIPMENT RECIPES ---");

  const recipes = [
    // --- WEAPONS (8000s) ---
    { 
        id: 8001, name: "Iron Broadsword Recipe", craftTimeSeconds: 60, resultItemId: 7001,
        ingredients: [ { itemId: 2703, quantity: 3 }, { itemId: 2901, quantity: 1 } ] // 3x Iron Bar + 1x Oak Plank
    },
    { 
        id: 8101, name: "Oak Recurve Bow Recipe", craftTimeSeconds: 60, resultItemId: 7101,
        ingredients: [ { itemId: 2901, quantity: 3 }, { itemId: 3201, quantity: 1 } ] // 3x Oak Plank + 1x Green Thread
    },
    { 
        id: 8201, name: "Birch Wand Recipe", craftTimeSeconds: 60, resultItemId: 7201,
        ingredients: [ { itemId: 2902, quantity: 2 }, { itemId: 4301, quantity: 1 } ] // 2x Birch Plank + 1x Green Extract
    },

    // --- ARMOR (8300s+) ---
    { 
        id: 8301, name: "Iron Plate Recipe", craftTimeSeconds: 90, resultItemId: 7301,
        ingredients: [ { itemId: 2703, quantity: 5 }, { itemId: 3102, quantity: 1 } ] // 5x Iron Bar + 1x Boar Leather
    },
    { 
        id: 8401, name: "Boar-Hide Tunic Recipe", craftTimeSeconds: 90, resultItemId: 7401,
        ingredients: [ { itemId: 3102, quantity: 4 }, { itemId: 3201, quantity: 1 } ] // 4x Boar Leather + 1x Green Thread
    },
    { 
        id: 8501, name: "Green-Thread Robe Recipe", craftTimeSeconds: 90, resultItemId: 7501,
        ingredients: [ { itemId: 3201, quantity: 5 } ] // 5x Green Thread
    },

    // LEGENDARY SAMPLES
    { 
        id: 8313, name: "Adamantite Cuirass Recipe", craftTimeSeconds: 300, resultItemId: 7313,
        ingredients: [ { itemId: 2721, quantity: 10 }, { itemId: 3121, quantity: 2 } ] // 10x Adamantite Bar + 2x Dragon Plate
    }
  ];

  for (const r of recipes) {
    console.log(`   Syncing Recipe: ${r.name}...`);
    
    await prisma.recipeTemplate.upsert({
        where: { id: r.id },
        update: { name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: r.craftTimeSeconds, description: `Forge a ${r.name.replace(' Recipe', '')}` },
        create: { id: r.id, name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: r.craftTimeSeconds, description: `Forge a ${r.name.replace(' Recipe', '')}` }
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

  console.log("✅ Equipment Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
