const marketService = require('../services/marketService');
const gatheringService = require('../services/gatheringService');
const territoryService = require('../services/territoryConquestService');
const prisma = require('../db');

async function runTaxationAudit() {
    console.log("--------------------------------------------------");
    console.log("💰 STARTING REGIONAL TAXATION MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const buyerId = 2;
    const regionId = 1;
    const guildId = 1;
    const swordTemplateId = 7001;

    // 0. Setup: Clean Slate & Ensure Faction/Guild
    console.log("[0/5] Preparing guild territory and tax rates (10%)...");
    
    await prisma.inventoryItem.deleteMany({ where: { userId: { in: [userId, buyerId] } } });
    await prisma.marketOrder.deleteMany({ where: { creatorId: { in: [userId, buyerId] } } });

    await prisma.guildTemplate.upsert({
        where: { id: 1 },
        update: {},
        create: { id: 1, name: "Standard Guild" }
    });

    await prisma.guild.upsert({
        where: { id: guildId },
        update: { treasury: 0, marketTaxRate: 0.10, gatheringTaxRate: 0.10 },
        create: { id: guildId, name: "Tax Lords", templateId: 1, treasury: 0, marketTaxRate: 0.10, gatheringTaxRate: 0.10 }
    });

    await prisma.regionTemplate.update({ where: { id: regionId }, data: { visualType: "TOWN" } });
    await prisma.$transaction(async (tx) => {
        await territoryService.captureTerritory(tx, guildId, regionId);
    });

    await prisma.user.update({ where: { id: userId }, data: { gold: 1000, currentRegion: regionId } });
    await prisma.user.update({ where: { id: buyerId }, data: { gold: 5000, currentRegion: regionId } });

    // 1. Test Listing Surcharge
    console.log("[1/5] Testing Market Listing Surcharge...");
    const sword = await prisma.inventoryItem.create({
        data: { userId, templateId: swordTemplateId, quantity: 1 }
    });

    // Price 1000. 
    // Base fee (5%) = 50. Guild fee (10%) = 100. Total = 150.
    await marketService.createSellOrder(userId, sword.id, 1, 1000);
    
    const guildAfterListing = await prisma.guild.findUnique({ where: { id: guildId } });
    const sellerAfterListing = await prisma.user.findUnique({ where: { id: userId } });
    
    console.log(`   Seller Paid: ${1000 - sellerAfterListing.gold} (Expected: 150)`);
    console.log(`   Guild Treasury: ${guildAfterListing.treasury} (Expected: 100)`);

    // 2. Test Purchase Revenue
    console.log("[2/5] Testing Market Purchase Revenue...");
    // Sale 1000.
    // Base Tax (10%) = 100. Guild Tax (10%) = 100. Total Tax = 200.
    // Seller Net = 800. Guild should get another +100.
    await marketService.createBuyOrder(buyerId, swordTemplateId, 1, 1000);

    const guildAfterSale = await prisma.guild.findUnique({ where: { id: guildId } });
    const sellerAfterSale = await prisma.user.findUnique({ where: { id: userId } });
    
    console.log(`   Seller Gold: ${sellerAfterSale.gold} (Expected: 850 + 800 = 1650)`);
    console.log(`   Guild Treasury: ${guildAfterSale.treasury} (Expected: 100 + 100 = 200)`);

    // 3. Test Gathering Tithe
    console.log("[3/5] Testing Gathering Tithe...");
    const ironOreId = 2201; // Base Value 10
    // Ensure template exists
    await prisma.itemTemplate.upsert({
        where: { id: ironOreId },
        update: { baseValue: 10 },
        create: { id: ironOreId, name: "Iron Ore", description: "Ore", baseValue: 10, category: "MATERIAL" }
    });

    const task = await prisma.taskQueue.create({
        data: { userId, type: "GATHERING", targetItemId: ironOreId, status: "RUNNING", finishesAt: new Date() }
    });

    // Complete. Value 10 * 1 qty. Guild 10% = 1.
    await gatheringService.completeGathering(userId, task.id);
    
    const guildFinal = await prisma.guild.findUnique({ where: { id: guildId } });
    console.log(`   Final Guild Treasury: ${guildFinal.treasury} (Expected: 201)`);

    // VERDICT
    if (guildFinal.treasury === 201 && sellerAfterSale.gold === 1650) {
        console.log("\n🌟 FINAL VERDICT: REGIONAL TAXATION SYSTEM PERFECT.");
    } else {
        console.log(`\n❌ FINAL VERDICT: TAXATION LOGIC FAILURE. Guild: ${guildFinal.treasury}, Seller: ${sellerAfterSale.gold}`);
    }

    console.log("\n--------------------------------------------------");
}

runTaxationAudit().catch(err => console.error(err));
