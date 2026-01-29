const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING LEATHER CRAFTING RECIPES ---");

  // Need result item templates first
  const resultItems = [
    { id: 3001, name: "Leather Boots", category: "EQUIPMENT", rarity: "COMMON", baseValue: 50, description: "Basic leather footwear." },
    { id: 3002, name: "Wolf-Fur Cloak", category: "EQUIPMENT", rarity: "UNCOMMON", baseValue: 200, description: "Warm cloak made from wolf pelts." },
    { id: 3003, name: "Serpent-Scale Tunic", category: "EQUIPMENT", rarity: "RARE", baseValue: 1200, description: "Lightweight and flexible scale armor." },
    { id: 3004, name: "Wyvern Wing-Cloak", category: "EQUIPMENT", rarity: "EPIC", baseValue: 5000, description: "Cloak that makes the wearer feel light as air." },
    { id: 3005, name: "Dragon-Scale Mantle", category: "EQUIPMENT", rarity: "LEGENDARY", baseValue: 25000, description: "The ultimate protection against the elements." }
  ];

  for (const item of resultItems) {
    await prisma.itemTemplate.upsert({
        where: { id: item.id },
        update: item,
        create: item
    });
  }

  const recipes = [
    { 
        id: 5201, name: "Leather Boots Recipe", craftTimeSeconds: 15, resultItemId: 3001,
        ingredients: [ { itemId: 2601, quantity: 4 } ] // 4 Ragged Hide
    },
    { 
        id: 5202, name: "Wolf-Fur Cloak Recipe", craftTimeSeconds: 30, resultItemId: 3002,
        ingredients: [ { itemId: 2603, quantity: 3 }, { itemId: 2401, quantity: 1 } ] // 3 Wolf Pelt + 1 Oak Wood
    },
    { 
        id: 5203, name: "Serpent-Scale Tunic Recipe", craftTimeSeconds: 60, resultItemId: 3003,
        ingredients: [ { itemId: 2604, quantity: 5 }, { itemId: 2403, quantity: 2 } ] // 5 Serpent Scale + 2 Birch Wood
    },
    { 
        id: 5204, name: "Wyvern Wing-Cloak Recipe", craftTimeSeconds: 120, resultItemId: 3004,
        ingredients: [ { itemId: 2616, quantity: 3 }, { itemId: 2412, quantity: 1 } ] // 3 Wyvern Leather + 1 Elder Wood
    },
    { 
        id: 5205, name: "Dragon-Scale Mantle Recipe", craftTimeSeconds: 300, resultItemId: 3005,
        ingredients: [ { itemId: 2621, quantity: 5 }, { itemId: 2425, quantity: 1 } ] // 5 Dragon Scale + 1 World-Tree Branch
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

  console.log("✅ Leather Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
