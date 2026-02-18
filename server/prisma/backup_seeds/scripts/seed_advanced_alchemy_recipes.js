const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING ADVANCED ALCHEMY RECIPES (EXTRACTION & BREWING) ---");

  // 1. Extraction Recipes (2 Herb -> 1 Extract) - Range 6401-6425
  for (let i = 0; i < 25; i++) {
    const herbId = 2801 + i;
    const extractId = 4301 + i;
    const recipeId = 6401 + i;

    const herb = await prisma.itemTemplate.findUnique({ where: { id: herbId } });
    if (!herb) continue;

    const extract = await prisma.itemTemplate.findUnique({ where: { id: extractId } });
    if (!extract) continue;

    await prisma.recipeTemplate.upsert({
        where: { id: recipeId },
        update: { name: `Extract ${extract.name}`, resultItemId: extractId, craftTimeSeconds: 20, description: `Concentrate 2x ${herb.name} into 1x ${extract.name}.` },
        create: { id: recipeId, name: `Extract ${extract.name}`, resultItemId: extractId, craftTimeSeconds: 20, description: `Concentrate 2x ${herb.name} into 1x ${extract.name}.` }
    });

    await prisma.recipeIngredient.deleteMany({ where: { recipeId: recipeId } });
    await prisma.recipeIngredient.create({ data: { recipeId, itemId: herbId, quantity: 2 } });
  }

  // 2. Brewing Recipes (Extracts + Materials -> Elixirs) - Range 6501-6525
  const brewing = [
    { id: 6501, name: "Vial of Mending Recipe", resultItemId: 4401, ingredients: [ { itemId: 4301, quantity: 2 }, { itemId: 3405, quantity: 1 } ] }, // 2x Green Extract + Sardine Oil
    { id: 6511, name: "Giant's Blood Elixir Recipe", resultItemId: 4411, ingredients: [ { itemId: 4318, quantity: 2 }, { itemId: 3806, quantity: 1 } ] }, // 2x Vital Crimson + Bear Meat
    
    // PERMANENT STAT RECIPES
    { id: 6521, name: "Elixir of Eternal Might Recipe", resultItemId: 4421, ingredients: [ { itemId: 4318, quantity: 5 }, { itemId: 3821, quantity: 1 }, { itemId: 2721, quantity: 1 } ] }, // 5x Vital Crimson + Dragon Meat + Adamantite
    { id: 6525, name: "Elixir of the Gods Recipe", resultItemId: 4425, ingredients: [ { itemId: 4325, quantity: 1 }, { itemId: 3825, quantity: 1 }, { itemId: 3425, quantity: 1 }, { itemId: 2725, quantity: 1 } ] } // World-Tree Essence + Turtle Meat + Turtle Shell + Abyssal Ingot
  ];

  for (const r of brewing) {
    await prisma.recipeTemplate.upsert({
        where: { id: r.id },
        update: { name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: 60, description: `Brew a ${r.name.replace(' Recipe', '')}` },
        create: { id: r.id, name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: 60, description: `Brew a ${r.name.replace(' Recipe', '')}` }
    });

    await prisma.recipeIngredient.deleteMany({ where: { recipeId: r.id } });
    for (const ing of r.ingredients) {
        await prisma.recipeIngredient.create({ data: { recipeId: r.id, itemId: ing.itemId, quantity: ing.quantity } });
    }
  }

  console.log("✅ 25 Extraction + 4 Sample Brewing Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
