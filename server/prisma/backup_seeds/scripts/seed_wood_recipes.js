const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING WOOD PROCESSING RECIPES (2 WOOD -> 1 PLANK) ---");

  // Raw Wood starts at 2401. Planks start at 2901.
  
  const recipes = [];
  for (let i = 0; i < 25; i++) {
    const woodId = 2401 + i;
    const plankId = 2901 + i;
    const recipeId = 5501 + i;
    
    const wood = await prisma.itemTemplate.findUnique({ where: { id: woodId } });
    if (!wood) continue;

    const plank = await prisma.itemTemplate.findUnique({ where: { id: plankId } });
    if (!plank) continue;

    recipes.push({
        id: recipeId,
        name: `Process ${plank.name}`,
        description: `Refine 2x ${wood.name} into 1x ${plank.name}.`,
        resultItemId: plankId,
        craftTimeSeconds: 15,
        ingredients: [ { itemId: woodId, quantity: 2 } ]
    });
  }

  for (const r of recipes) {
    console.log(`   Syncing Processing: ${r.name}...`);
    
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

  console.log("✅ 25 Wood Processing Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
