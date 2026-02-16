const factionWar = require('../services/faction/FactionWarService');
const marketService = require('../services/marketService');
const territoryService = require('../services/territoryConquestService');
const prisma = require('../db');

async function runFactionWarAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING FACTION WARS & TERRITORY MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const guildId = 1;
    const empireId = 1;
    const regionId = 1;
    const itemTemplateId = 7001;

    // 0. Setup: Guild Aligned to Empire, User in Empire
    console.log("[0/4] Preparing environment (Empire Alignment)...");
    await prisma.faction.upsert({ where: { id: empireId }, update: {}, create: { id: empireId, name: "The Empire", description: "Empire" } });
    
    await prisma.guild.update({
        where: { id: guildId },
        data: { factionId: empireId, marketTaxRate: 0.20 } // 20% Guild Tax
    });

    await prisma.user.update({
        where: { id: userId },
        data: { factionId: empireId, gold: 5000, currentRegion: regionId }
    });

    // Capture Territory for Guild 1 in Region 1
    await prisma.territory.upsert({
        where: { regionId },
        update: { guildId },
        create: { regionId, guildId }
    });

    // 1. Test Tax Discount
    console.log("[1/4] Testing Faction Ally Tax Discount (20% -> 10%)...");
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    const item = await prisma.inventoryItem.create({
        data: { userId, templateId: itemTemplateId, quantity: 1 }
    });

    // Listing Price 1000.
    // Base fee (5%) = 50.
    // Guild fee (20%) discounted by 50% = 10%. Fee = 100.
    // Total upfront = 150.
    const initialGold = (await prisma.user.findUnique({ where: { id: userId } })).gold;
    await marketService.createSellOrder(userId, item.id, 1, 1000);
    const finalGold = (await prisma.user.findUnique({ where: { id: userId } })).gold;

    console.log(`   Gold Paid: ${initialGold - finalGold} (Expected: 150)`);

    // 2. Test Siege Cost Discount
    console.log("[2/4] Testing Faction Siege Support...");
    // Manually set region culture
    await prisma.regionTemplate.update({ where: { id: regionId }, data: { factionId: empireId } });
    const costs = await territoryService.calculateSiegeCosts(guildId, regionId);
    console.log(`   Siege Energy Cost: ${costs.energy} (Expected: 40 - 20% off 50)`);

    // 3. Test Faction War NPC Reactivity
    console.log("[3/4] Testing War Status (Empire vs Rebels)...");
    const rebelId = 2;
    await prisma.faction.upsert({ where: { id: rebelId }, update: {}, create: { id: rebelId, name: "Rebels", description: "Rebels" } });
    await factionWar.setRelation(empireId, rebelId, "WAR");

    const relation = await factionWar.getRelation(empireId, rebelId);
    console.log(`   Relation Empire-Rebels: ${relation} (Expected: WAR)`);

    // VERDICT
    const taxPass = (initialGold - finalGold) === 150;
    const siegePass = costs.energy === 40;
    const warPass = relation === "WAR";

    if (taxPass && siegePass && warPass) {
        console.log("\n🌟 FINAL VERDICT: FACTION WARS & TERRITORY PERFECT.");
    } else {
        console.log(`\n❌ FINAL VERDICT: SYSTEM INTEGRATION FAILURE. Tax Paid: ${initialGold - finalGold}`);
    }

    console.log("\n--------------------------------------------------");
}

runFactionWarAudit().catch(err => console.error(err));