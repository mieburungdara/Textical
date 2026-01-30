const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING WEAVING RECIPES (2 PLANT -> 1 CLOTH) ---");

  // Raw Plants start at 2801. Refined Cloths start at 3201.
  
  const recipes = [];
  for (let i = 0; i < 25; i++) {
    const rawId = 2801 + i;
    const refinedId = 3201 + i;
    const recipeId = 5701 + i;
    
    const raw = await prisma.itemTemplate.findUnique({ where: { id: rawId } });
    if (!raw) continue;

    const refined = await prisma.itemTemplate.findUnique({ where: { id: refinedId } });
    if (!refined) continue;

    recipes.push({
        id: recipeId,
        name: `Weave ${refined.name}`,
        description: `Process 2x ${raw.name} into 1x ${refined.name}.`,
        resultItemId: refinedId,
        craftTimeSeconds: 15,
        ingredients: [ { itemId: rawId, quantity: 2 } ]
    });
  }

  for (const r of recipes) {
    console.log(`   Syncing Weaving: ${r.name}...`);
    
    await prisma.recipeTemplate.upsert({
        where: { id: r.id },
        update: { name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: r.craftTimeSeconds, description: r.description },
        create: { id: r.id, name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: r.craftTimeSeconds, description: r.description }
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

  console.log("✅ 25 Weaving Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
