const consumableService = require('../services/consumableService');
const statService = require('../services/statService');
const prisma = require('../db');

async function runCulinaryAudit() {
    console.log("--------------------------------------------------");
    console.log("🍳 STARTING ADVANCED CULINARY FULL-CYCLE AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 999;
    const dishId = 4201; // Roasted Boar Shank (+2 STR)

    // 1. Setup Hero & Food
    console.log("[1/4] Setting up hero and food item...");
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { str: 10, userId: userId },
        create: { id: heroId, userId: userId, name: "GourmetHero", classId: 1001, str: 10 }
    });

    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: dishId } },
        update: { quantity: 5 },
        create: { userId, templateId: dishId, quantity: 5 }
    });

    // 2. Check Baseline STR
    const baseline = await statService.calculateHeroStats(heroId);
    console.log(`   Baseline STR: ${baseline.attributes.str}`);

    // 3. Consume Food
    console.log("[2/4] Consuming Roasted Boar Shank...");
    await consumableService.consumeItem(userId, heroId, dishId);
    
    const inv = await prisma.inventoryItem.findUnique({ where: { userId_templateId: { userId, templateId: dishId } } });
    console.log(`   Food remaining in inventory: ${inv.quantity} (Expected: 4)`);

    // 4. Check Buffed STR
    console.log("[3/4] Verifying stat buff application...");
    const buffed = await statService.calculateHeroStats(heroId);
    console.log(`   Buffed STR: ${buffed.attributes.str} (Expected: 12)`);

    // 5. Cleanup & Result
    if (inv.quantity === 4 && buffed.attributes.str === 12) {
        console.log("\n🌟 FINAL VERDICT: CULINARY BUFF SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE.");
    }

    // Clear buff for next runs
    await prisma.heroBuff.deleteMany({ where: { heroId } });

    console.log("\n--------------------------------------------------");
}

runCulinaryAudit().catch(err => console.error(err));
