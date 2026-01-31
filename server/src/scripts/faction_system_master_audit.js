const factionService = require('../services/factionService');
const reputationService = require('../services/reputationService');
const statService = require('../services/statService');
const npcService = require('../services/npcService');
const prisma = require('../db');

async function runFactionAudit() {
    console.log("--------------------------------------------------");
    console.log("🛡️ STARTING FACTION SYSTEM MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39; // Arthur
    const factionId = 1; // The Empire
    const npcId = 10; // Sir Alistair

    // 0. Setup: Clean Slate
    console.log("[0/5] Preparing environment (Factions, Ranks, NPCs)...");
    await prisma.user.update({ where: { id: userId }, data: { factionId: null } });
    await prisma.userReputation.deleteMany({ where: { userId } });

    await prisma.faction.upsert({
        where: { id: factionId },
        update: {}, 
        create: { id: factionId, name: "The Empire", description: "Rule through order." }
    });

    // Rank 1: Recruit (0 Rep)
    await prisma.factionRank.upsert({
        where: { factionId_minReputation: { factionId, minReputation: 0 } },
        update: { name: "Imperial Recruit", statKey: "str", statValue: 0.05 },
        create: { factionId, name: "Imperial Recruit", minReputation: 0, statKey: "str", statValue: 0.05 }
    });

    // Rank 2: Knight (100 Rep)
    await prisma.factionRank.upsert({
        where: { factionId_minReputation: { factionId, minReputation: 100 } },
        update: { name: "Imperial Knight", statKey: "str", statValue: 0.15 },
        create: { factionId, name: "Imperial Knight", minReputation: 100, statKey: "str", statValue: 0.15 }
    });

    await prisma.nPCTemplate.update({ where: { id: npcId }, data: { factionId } });

    // 1. Join Faction
    console.log("[1/5] Joining 'The Empire'...");
    await factionService.joinFaction(userId, factionId);
    const rank1 = await factionService.calculateCurrentRank(userId);
    console.log(`   Initial Rank: ${rank1.name} (Expected: Imperial Recruit)`);

    // 2. Base Stats (With Recruit Bonus)
    const statsBefore = await statService.calculateHeroStats(heroId);
    console.log(`[2/5] Initial STR (with 5% bonus): ${statsBefore.attributes.str}`);

    // 3. Gain Reputation & Rank Up
    console.log("[3/5] Gaining 150 Reputation...");
    await reputationService.addReputation(userId, factionId, 150);
    const rank2 = await factionService.calculateCurrentRank(userId);
    console.log(`   New Rank: ${rank2.name} (Expected: Imperial Knight)`);

    const statsAfter = await statService.calculateHeroStats(heroId);
    console.log(`   New STR (with 15% bonus): ${statsAfter.attributes.str}`);

    // 4. Test NPC Interaction
    console.log("[4/5] Checking NPC dialogue (Sir Alistair)...");
    const npcs = await npcService.getAvailableNPCs(1, userId);
    const knight = npcs.find(n => n.templateId === npcId);
    console.log(`   NPC says: "${knight.description}"`);

    // 5. Final Verification
    console.log("[5/5] Finalizing audit...");

    // VERDICT
    const rankPass = rank2.minReputation === 100;
    const statPass = statsAfter.attributes.str > statsBefore.attributes.str;
    const dialoguePass = knight.description.includes("comrade");

    if (rankPass && statPass && dialoguePass) {
        console.log("\n🌟 FINAL VERDICT: FACTION SYSTEM FULLY OPERATIONAL.");
    } else {
        console.log("\n❌ FINAL VERDICT: FACTION LOGIC FAILURE.");
    }

    console.log("--------------------------------------------------");
}

runFactionAudit().catch(err => console.error(err));
