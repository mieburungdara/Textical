const prisma = require('../db');

async function runAudit() {
    console.log("==================================================");
    console.log("🛠️  TOOL LOOP AUDIT: RECIPE VS INVENTORY");
    console.log("==================================================");

    // 1. Identify Tool Recipes (Pickaxes & Axes)
    const toolRecipes = await prisma.recipeTemplate.findMany({
        where: {
            OR: [
                { name: { contains: "Pickaxe" } },
                { name: { contains: "Axe" } }
            ]
        },
        include: { ingredients: true }
    });

    if (toolRecipes.length === 0) {
        console.error("❌ No tool recipes found in database.");
        process.exit(1);
    }

    console.log(`✅ Found ${toolRecipes.length} tool recipes.`);

    // 2. Sample Check for Iron Pickaxe (Standard Upgrade Goal)
    const ironPickaxe = toolRecipes.find(r => r.name === "Iron Pickaxe");
    if (ironPickaxe) {
        console.log(`
📋 Recipe: ${ironPickaxe.name}`);
        ironPickaxe.ingredients.forEach(ing => {
            console.log(`   - Item ID ${ing.itemId}: Qty ${ing.quantity}`);
        });
    }

    console.log("\n==================================================");
    console.log("🌟 AUDIT COMPLETE");
    console.log("==================================================");
    process.exit(0);
}

runAudit().catch(e => {
    console.error(e);
    process.exit(1);
});
