const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING COOKING RECIPES (2 FISH -> 1 FILLET) ---");

  // Raw Fish start at 3301. Prepared Fish start at 3401.
  
  const recipes = [];
  for (let i = 0; i < 25; i++) {
    const rawId = 3301 + i;
    const refinedId = 3401 + i;
    const recipeId = 5801 + i;
    
    const raw = await prisma.itemTemplate.findUnique({ where: { id: rawId } });
    if (!raw) continue;

    const refined = await prisma.itemTemplate.findUnique({ where: { id: refinedId } });
    if (!refined) continue;

    recipes.push({
        id: recipeId,
        name: `Prepare ${refined.name}`,
        description: `Refine 2x ${raw.name} into 1x ${refined.name}.`,
        resultItemId: refinedId,
        craftTimeSeconds: 15,
        ingredients: [ { itemId: rawId, quantity: 2 } ]
    });
  }

  for (const r of recipes) {
    console.log(`   Syncing Cooking: ${r.name}...`);
    
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

  console.log("✅ 25 Cooking Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
