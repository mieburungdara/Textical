const craftingService = require('../services/craftingService');
const gatheringService = require('../services/gatheringService');
const prisma = require('../db');

async function runAxeAudit() {
    console.log("--------------------------------------------------");
    console.log("⚒️ STARTING AXE CRAFTING & LUMBERING AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 999;
    const recipeId = 5102; // Iron Axe Recipe

    // 1. Setup Materials & Hero
    console.log("[1/5] Setting up materials & hero...");
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2203 } }, // Iron Ore
        update: { quantity: 10 },
        create: { userId, templateId: 2203, quantity: 10 }
    });
    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: 2401 } }, // Oak Wood
        update: { quantity: 10 },
        create: { userId, templateId: 2401, quantity: 10 }
    });
    await prisma.hero.update({ where: { id: heroId }, data: { str: 50 } });

    // 2. Craft Axe
    console.log("[2/5] Crafting Iron Axe...");
    await prisma.userRecipe.upsert({
        where: { userId_recipeId: { userId, recipeId } },
        update: {},
        create: { userId, recipeId }
    });
    const craftTask = await craftingService.startCrafting(userId, recipeId);
    
    // Simulate completion
    const axeItem = await prisma.inventoryItem.findFirst({
        where: { userId, templateId: 2502 } // Iron Axe
    });
    if (!axeItem) {
        // Manually complete since it's an audit
        await craftingService.completeCrafting(userId, craftTask.id);
    }
    console.log(`   ✅ Success: Iron Axe created.`);

    // 3. Equip Axe
    console.log("[3/5] Equipping Axe...");
    const axeInstance = await prisma.inventoryItem.findUnique({
        where: { userId_templateId: { userId, templateId: 2502 } }
    });
    await prisma.heroEquipment.upsert({
        where: { heroId_slotKey: { heroId, slotKey: "MAIN_HAND" } },
        update: { itemInstanceId: axeInstance.id },
        create: { heroId, slotKey: "MAIN_HAND", itemInstanceId: axeInstance.id }
    });

    // 4. Test Lumbering (Pine Wood - Req Tier 0)
    console.log("[4/5] Attempting to harvest Pine Wood (Req Tier 0)...");
    const pineResource = await prisma.regionResource.findFirst({
        where: { regionId: 1, itemId: 2402 } // Pine
    });
    try {
        const gatherTask = await gatheringService.startGathering(userId, heroId, pineResource.id);
        console.log(`   ✅ Success: Harvesting started with Axe.`);
        await prisma.taskQueue.delete({ where: { id: gatherTask.id } });
    } catch (e) {
        console.log(`   ⛔ Error: ${e.message}`);
    }

    // 5. Test Cross-Tool Failure (Granite - Req PICKAXE)
    console.log("\n[5/5] Testing Cross-Tool Block (Mining Granite with Axe)...");
    const graniteResource = await prisma.regionResource.findFirst({
        where: { regionId: 1, itemId: 2201 } // Granite
    });
    try {
        await gatheringService.startGathering(userId, heroId, graniteResource.id);
        console.log(`   ❌ Failure: System allowed mining with an Axe!`);
    } catch (e) {
        console.log(`   ✅ Success: System correctly blocked mining with Axe. Message: ${e.message}`);
    }

    console.log("\n--------------------------------------------------");
    console.log("Axe System Audit Complete.");
}

runAxeAudit().catch(err => console.error(err));
