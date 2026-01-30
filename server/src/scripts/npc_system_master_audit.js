const npcService = require('../services/npcService');
const prisma = require('../db');

async function runNPCAudit() {
    console.log("--------------------------------------------------");
    console.log("👥 STARTING NPC & WORLD POPULATION MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39; // Arthur
    const kaelenId = 1;
    const zevId = 11;

    // 1. Test Discovery: Get NPCs in Region 1
    console.log("[1/4] Discovering NPCs in Region 1...");
    const npcs = await npcService.getAvailableNPCs(1);
    console.log(`   Found ${npcs.length} NPCs.`);
    npcs.forEach(n => console.log(`      - ${n.name}, ${n.title} (${n.type})`));

    // 2. Test Promotion: Master Kaelen
    console.log("[2/4] Simulating Job Promotion via Grandmaster Kaelen...");
    // Reset hero to warrior for audit
    await prisma.hero.update({ where: { id: heroId }, data: { classId: 1001, classLevel: 20 } });
    
    const promoHero = await npcService.interactWithNPC(userId, heroId, kaelenId, "PROMOTE", { targetClassId: 1101 });
    console.log(`   Promotion Success! New Class ID: ${promoHero.classId}`);

    // 3. Test Trade: Forced Wanderer Spawn
    console.log("[3/4] Forcing Zev the Wandering into Region 1...");
    await prisma.regionNPC.upsert({
        where: { regionId_npcId: { regionId: 1, npcId: zevId } },
        update: { isTemporary: true, expiresAt: new Date(Date.now() + 10000) },
        create: { regionId: 1, npcId: zevId, isTemporary: true, expiresAt: new Date(Date.now() + 10000) }
    });

    console.log("[4/4] Purchasing rare item from Zev...");
    const itemToBuy = 4425; // Elixir of the Gods
    await prisma.user.update({ where: { id: userId }, data: { gold: 100000, maxInventorySlots: 100 } });
    
    const tradeRes = await npcService.interactWithNPC(userId, heroId, zevId, "PURCHASE", { itemId: itemToBuy });
    console.log(`   Trade Result: ${tradeRes.message}`);

    // VERDICT
    if (promoHero.classId === 1101 && tradeRes.success) {
        console.log("\n🌟 FINAL VERDICT: NPC SYSTEM FULLY OPERATIONAL.");
    } else {
        console.log("\n❌ FINAL VERDICT: NPC INTERACTION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runNPCAudit().catch(err => console.error(err));
