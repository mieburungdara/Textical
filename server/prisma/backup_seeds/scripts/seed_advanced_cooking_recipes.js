const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING ADVANCED CULINARY RECIPES ---");

  // Ingredients: Prepared Meats (3801+), Prepared Fish (3401+), Refined Cloths (3201+)
  // Result Dishes: 4201+
  
  const recipes = [
    { id: 6301, name: "Roasted Boar Shank Recipe", resultItemId: 4201, ingredients: [ { itemId: 3802, quantity: 2 }, { itemId: 3201, quantity: 1 } ] }, // 2x Boar Steak + 1 Green Thread (binding)
    { id: 6302, name: "Mana-Lily Soup Recipe", resultItemId: 4202, ingredients: [ { itemId: 3202, quantity: 2 }, { itemId: 3405, quantity: 1 } ] }, // 2x Mana-Thread + 1 Sardine Oil
    { id: 6303, name: "Swift-Sardine Sticks Recipe", resultItemId: 4203, ingredients: [ { itemId: 3401, quantity: 2 }, { itemId: 3204, quantity: 1 } ] }, // 2x Fish Fillet + 1 Swift-String
    { id: 6304, name: "Herbal Tea Recipe", resultItemId: 4204, ingredients: [ { itemId: 3201, quantity: 2 }, { itemId: 3405, quantity: 1 } ] },
    { id: 6305, name: "Fisherman's Pie Recipe", resultItemId: 4205, ingredients: [ { itemId: 3402, quantity: 2 }, { itemId: 3801, quantity: 1 } ] },

    { id: 6306, name: "Bear Steak au Poivre Recipe", resultItemId: 4206, ingredients: [ { itemId: 3806, quantity: 2 }, { itemId: 3201, quantity: 1 } ] },
    { id: 6307, name: "Gator Gumbo Recipe", resultItemId: 4207, ingredients: [ { itemId: 3807, quantity: 2 }, { itemId: 3404, quantity: 1 } ] },
    { id: 6308, name: "Silverleaf Salad Recipe", resultItemId: 4208, ingredients: [ { itemId: 3207, quantity: 2 }, { itemId: 3405, quantity: 1 } ] },
    { id: 6309, name: "Lobster Thermidor Recipe", resultItemId: 4209, ingredients: [ { itemId: 3408, quantity: 2 }, { itemId: 3802, quantity: 1 } ] },
    { id: 6310, name: "Root Vegetable Roast Recipe", resultItemId: 4210, ingredients: [ { itemId: 3206, quantity: 2 }, { itemId: 3405, quantity: 1 } ] },

    // TIER 3+
    { id: 6311, name: "Shadow-Panther Sashimi Recipe", resultItemId: 4211, ingredients: [ { itemId: 3812, quantity: 2 }, { itemId: 3215, quantity: 1 } ] },
    { id: 6312, name: "Mandrake Risotto Recipe", resultItemId: 4212, ingredients: [ { itemId: 3211, quantity: 2 }, { itemId: 3412, quantity: 1 } ] },
    { id: 6313, name: "Electric Ray Tempura Recipe", resultItemId: 4213, ingredients: [ { itemId: 3413, quantity: 2 }, { itemId: 3214, quantity: 1 } ] },
    { id: 6314, name: "Blood-Rose Tartare Recipe", resultItemId: 4214, ingredients: [ { itemId: 3218, quantity: 2 }, { itemId: 3812, quantity: 1 } ] },
    { id: 6315, name: "Salamander Satay Recipe", resultItemId: 4215, ingredients: [ { itemId: 3811, quantity: 2 }, { itemId: 3414, quantity: 1 } ] },

    // EPIC
    { id: 6316, name: "Wyvern Wing Buffet Recipe", resultItemId: 4216, ingredients: [ { itemId: 3816, quantity: 2 }, { itemId: 3219, quantity: 1 } ] },
    { id: 6317, name: "Solar-Sunflower Cake Recipe", resultItemId: 4217, ingredients: [ { itemId: 3216, quantity: 2 }, { itemId: 3416, quantity: 1 } ] },
    { id: 6318, name: "Ghost-Shark Sushi Recipe", resultItemId: 4218, ingredients: [ { itemId: 3420, quantity: 2 }, { itemId: 3220, quantity: 1 } ] },
    { id: 6319, name: "Hydra-Regen Soup Recipe", resultItemId: 4219, ingredients: [ { itemId: 3819, quantity: 2 }, { itemId: 3419, quantity: 1 } ] },
    { id: 6320, name: "Moon-Lily Elixir-Dish Recipe", resultItemId: 4220, ingredients: [ { itemId: 3217, quantity: 2 }, { itemId: 3411, quantity: 1 } ] },

    // LEGENDARY
    { id: 6321, name: "Dragon-Heart Roast Recipe", resultItemId: 4221, ingredients: [ { itemId: 3821, quantity: 2 }, { itemId: 2721, quantity: 1 } ] }, // Skewered with Adamantite
    { id: 6322, name: "Eternal Phoenix Flambé Recipe", resultItemId: 4222, ingredients: [ { itemId: 3822, quantity: 2 }, { itemId: 3225, quantity: 1 } ] },
    { id: 6323, name: "Abyssal Kraken Carpaccio Recipe", resultItemId: 4223, ingredients: [ { itemId: 3823, quantity: 2 }, { itemId: 3224, quantity: 1 } ] },
    { id: 6324, name: "Star-Dust Consommé Recipe", resultItemId: 4224, ingredients: [ { itemId: 3225, quantity: 2 }, { itemId: 3423, quantity: 1 } ] },
    { id: 6325, name: "World-Tree Ambrosia Recipe", resultItemId: 4225, ingredients: [ { itemId: 3225, quantity: 1 }, { itemId: 3825, quantity: 1 }, { itemId: 3425, quantity: 1 } ] }
  ];

  for (const r of recipes) {
    console.log(`   Syncing Recipe: ${r.name}...`);
    
    await prisma.recipeTemplate.upsert({
        where: { id: r.id },
        update: { name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: 30, description: `Cook a ${r.name.replace(' Recipe', '')}` },
        create: { id: r.id, name: r.name, resultItemId: r.resultItemId, craftTimeSeconds: 30, description: `Cook a ${r.name.replace(' Recipe', '')}` }
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

  console.log("✅ 25 Advanced Culinary Recipes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
