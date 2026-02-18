const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING ALCHEMY RECIPES (POTIONS & ELIXIRS) ---");

  // 1. Seed Result Items (Potions)
  const potions = [
    { id: 4001, name: "Minor Healing Salve", category: "CONSUMABLE", rarity: "COMMON", baseValue: 20, description: "Restores a small amount of HP." },
    { id: 4002, name: "Mana Potion", category: "CONSUMABLE", rarity: "UNCOMMON", baseValue: 80, description: "Restores mana for spellcasting." },
    { id: 4003, name: "Elixir of Strength", category: "CONSUMABLE", rarity: "RARE", baseValue: 500, description: "Temporarily increases physical power." },
    { id: 4004, name: "Flask of the Phoenix", category: "CONSUMABLE", rarity: "EPIC", baseValue: 2500, description: "Massive healing and fire resistance." },
    { id: 4005, name: "Brew of the World-Tree", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 15000, description: "Transcendent power and total restoration." }
  ];

  for (const p of potions) {
    await prisma.itemTemplate.upsert({
        where: { id: p.id },
        update: p,
        create: p
    });
  }

  // 2. Seed Recipes
  const recipes = [
    { 
        id: 5301, name: "Minor Healing Salve Recipe", craftTimeSeconds: 15, resultItemId: 4001,
        ingredients: [ { itemId: 2801, quantity: 3 } ] // 3 Green Herb
    },
    { 
        id: 5302, name: "Mana Potion Recipe", craftTimeSeconds: 30, resultItemId: 4002,
        ingredients: [ { itemId: 2802, quantity: 3 }, { itemId: 2605, quantity: 1 } ] // 3 Blue Blossom + 1 Bat Membrane
    },
    { 
        id: 5303, name: "Elixir of Strength Recipe", craftTimeSeconds: 60, resultItemId: 4003,
        ingredients: [ { itemId: 2803, quantity: 3 }, { itemId: 2602, quantity: 1 } ] // 3 Red Poppy + 1 Boar Skin
    },
    { 
        id: 5304, name: "Flask of the Phoenix Recipe", craftTimeSeconds: 120, resultItemId: 4004,
        ingredients: [ { itemId: 2812, quantity: 3 }, { itemId: 2622, quantity: 1 } ] // 3 Fireweed + 1 Phoenix Hide
    },
    { 
        id: 5305, name: "Brew of the World-Tree Recipe", craftTimeSeconds: 300, resultItemId: 4005,
        ingredients: [ { itemId: 2825, quantity: 1 }, { itemId: 2625, quantity: 1 }, { itemId: 2222, quantity: 1 } ] // World-Tree Bud + Celestial Hide + Ether-Ore
    }
  ];

  for (const r of recipes) {
    console.log(`   Syncing Recipe: ${r.name}...`);
    
    await prisma.recipeTemplate.upsert({
        where: { id: r.id },
        update: { name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: r.craftTimeSeconds, description: `Brew a ${r.name.replace(' Recipe', '')}` },
        create: { id: r.id, name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: r.craftTimeSeconds, description: `Brew a ${r.name.replace(' Recipe', '')}` }
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

  console.log("✅ Alchemy Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
