const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING SMELTING RECIPES (2 ORE -> 1 BAR) ---");

  // Minerals start at 2201. Bars start at 2701.
  // We match them index-by-index for 25 items.
  
  const recipes = [];
  for (let i = 0; i < 25; i++) {
    const mineralId = 2201 + i;
    const barId = 2701 + i;
    const recipeId = 5401 + i;
    
    // Get mineral name to make recipe name
    const mineral = await prisma.itemTemplate.findUnique({ where: { id: mineralId } });
    if (!mineral) continue;

    const bar = await prisma.itemTemplate.findUnique({ where: { id: barId } });
    if (!bar) continue;

    recipes.push({
        id: recipeId,
        name: `Smelt ${bar.name}`,
        description: `Refine 2x ${mineral.name} into 1x ${bar.name}.`,
        resultItemId: barId,
        craftTimeSeconds: 15,
        ingredients: [ { itemId: mineralId, quantity: 2 } ]
    });
  }

  for (const r of recipes) {
    console.log(`   Syncing Smelting: ${r.name}...`);
    
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

  console.log("✅ 25 Smelting Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
