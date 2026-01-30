const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING LEATHER TANNING RECIPES (2 HIDE -> 1 LEATHER) ---");

  // Raw Hides start at 2601. Tanned Leathers start at 3101.
  
  const recipes = [];
  for (let i = 0; i < 25; i++) {
    const rawId = 2601 + i;
    const tannedId = 3101 + i;
    const recipeId = 5601 + i;
    
    const raw = await prisma.itemTemplate.findUnique({ where: { id: rawId } });
    if (!raw) continue;

    const tanned = await prisma.itemTemplate.findUnique({ where: { id: tannedId } });
    if (!tanned) continue;

    recipes.push({
        id: recipeId,
        name: `Tan ${tanned.name}`,
        description: `Refine 2x ${raw.name} into 1x ${tanned.name}.`,
        resultItemId: tannedId,
        craftTimeSeconds: 15,
        ingredients: [ { itemId: rawId, quantity: 2 } ]
    });
  }

  for (const r of recipes) {
    console.log(`   Syncing Tanning: ${r.name}...`);
    
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

  console.log("✅ 25 Leather Tanning Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
