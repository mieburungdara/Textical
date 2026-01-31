const npcService = require('../services/npcService');
const factionWar = require('../services/faction/FactionWarService');
const prisma = require('../db');

async function runHostilityAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING NPC FACTION HOSTILITY MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39;
    const empireId = 1;
    const rebelId = 2;
    const npcId = 10; 
    const townId = 1;

    // 0. Setup: Player in Empire, NPC in Rebels, mapped to Town
    console.log("[0/5] Preparing factions and NPC mapping...");
    await prisma.faction.upsert({ where: { id: empireId }, update: {}, create: { id: empireId, name: "Empire", description: "Emp" } });
    await prisma.faction.upsert({ where: { id: rebelId }, update: {}, create: { id: rebelId, name: "Rebels", description: "Reb" } });

    await prisma.user.update({ where: { id: userId }, data: { factionId: empireId, gold: 5000, currentRegion: townId } });
    
    // Explicitly set type to TRADER initially
    await prisma.nPCTemplate.update({ where: { id: npcId }, data: { factionId: rebelId, type: "TRADER", travelCost: 100 } });

    // Map NPC to Town
    await prisma.regionNPC.upsert({
        where: { regionId_npcId: { regionId: townId, npcId } },
        update: {},
        create: { regionId: townId, npcId }
    });

    // 1. Test PEACE Status
    console.log("[1/5] Status: PEACE. Testing normal interaction...");
    await factionWar.setRelation(empireId, rebelId, "PEACE");
    
    // We use getAvailableNPCs which uses discovery
    const npcsPeace = await npcService.getAvailableNPCs(townId, userId, 12);
    const zevPeace = npcsPeace.find(n => n.templateId === npcId);
    
    if (!zevPeace) throw new Error("NPC not discovered in region 1 during Peace.");
    console.log(`   Options: [${zevPeace.interactionOptions.join(', ')}] (Expected: TRADE)`);

    // 2. Test WAR Status (Dialogue & Trade)
    console.log("[2/5] Status: WAR. Testing hostility...");
    await factionWar.setRelation(empireId, rebelId, "WAR");
    await prisma.nPCTemplate.update({ where: { id: npcId }, data: { type: "TRADER" } });
    const npcsWar = await npcService.getAvailableNPCs(townId, userId, 12);
    const zevWar = npcsWar.find(n => n.templateId === npcId);

    console.log(`   Hostile Dialogue: "${zevWar.description}"`);
    console.log(`   Options: [${zevWar.interactionOptions.join(', ')}] (Expected: Empty)`);

    // 3. Test Trade Refusal
    console.log("[3/5] Testing Trade refusal during war...");
    try {
        await npcService.interactWithNPC(userId, heroId, npcId, "PURCHASE", {itemId: 1}, 12);
        console.log("   ❌ Error: NPC should have refused trade.");
    } catch (e) {
        console.log(`   ✅ Success: ${e.message}`);
    }

    // 4. Test Neutral Exception (Teleporter at 2x price)
    console.log("[4/5] Testing Neutral Exception (Teleporter Surcharge)...");
    await prisma.nPCTemplate.update({
        where: { id: npcId },
        data: { type: "TELEPORTER", travelCost: 100 },
    });
    await prisma.nPCTeleportRoute.upsert({
        where: { npcId_targetRegionId: { npcId, targetRegionId: 2 } },
        update: {},
        create: { npcId, targetRegionId: 2 }
    });

    const userBefore = await prisma.user.findUnique({ where: { id: userId } });
    await npcService.interactWithNPC(userId, heroId, npcId, "TELEPORT", { destinationId: 2 }, 12);
    const userAfter = await prisma.user.findUnique({ where: { id: userId } });

    console.log(`   Gold Paid: ${userBefore.gold - userAfter.gold} (Expected: 200)`);

    // 5. Test Combat Trigger (Guards)
    console.log("[5/5] Testing Guard Combat Trigger...");
    await prisma.nPCTemplate.update({ where: { id: npcId }, data: { type: "GUARD" } });
    const combatRes = await npcService.interactWithNPC(userId, heroId, npcId, "TRADE", {}, 12);
    console.log(`   Interaction Result: ${combatRes.type} (Expected: COMBAT_TRIGGERED)`);

    // VERDICT
    const peacePass = zevPeace.interactionOptions.includes("TRADE");
    const warPass = zevWar.interactionOptions.length === 0 && zevWar.description.includes("ENEMY");
    const pricePass = (userBefore.gold - userAfter.gold) === 200;
    const combatPass = combatRes.type === "COMBAT_TRIGGERED";

    if (peacePass && warPass && pricePass && combatPass) {
        console.log("\n🌟 FINAL VERDICT: NPC FACTION HOSTILITY PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: HOSTILITY LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runHostilityAudit().catch(err => console.error(err));