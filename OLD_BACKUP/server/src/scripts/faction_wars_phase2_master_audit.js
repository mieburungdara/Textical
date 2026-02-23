const warPointService = require('../services/faction/WarPointService');
const npcService = require('../services/npcService');
const influenceResolver = require('../logic/faction/InfluenceResolver');
const prisma = require('../db');

async function runPhase2Audit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING ADVANCED FACTION WARS PHASE 2 AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const regionId = 1;
    const empireId = 1;

    // 0. Setup: Ensure User 1 is in Empire
    console.log("[0/4] Preparing environment...");
    await prisma.user.update({ where: { id: userId }, data: { factionId: empireId, currentRegion: regionId } });
    await prisma.regionalInfluence.deleteMany({ where: { regionId } });

    // 1. Test Domination Buff (High Influence)
    console.log("[1/4] Adding 6000 Influence (Domination)...");
    await warPointService.addInfluence(userId, regionId, 6000);
    
    const dominant = await warPointService.getDominantFaction(regionId);
    const influence = (await warPointService.getRegionInfluence(regionId))[0].points;
    const buffs = influenceResolver.resolveDominationBuffs(influence);

    console.log(`   Dominant: ${dominant.name}, Points: ${influence}`);
    console.log(`   Buffs: ATK +${buffs.attack_damage * 100}%%, DEF +${buffs.defense * 100}%`);

    // 2. Test Reinforcement Trigger (Low Influence)
    console.log("[2/4] Dropping Influence to 500 (Siege State)...");
    await prisma.regionalInfluence.update({
        where: { factionId_regionId: { factionId: empireId, regionId } },
        data: { points: 500 }
    });

    const isSiege = influenceResolver.isSiegeState(500);
    console.log(`   Is Siege State: ${isSiege ? 'YES' : 'NO'} (Expected: YES)`);

    // 3. Verify NPC Spawning
    console.log("[3/4] Verifying automated reinforcement discovery...");
    const npcs = await npcService.getAvailableNPCs(regionId, userId, 12);
    const reinforcements = npcs.filter(n => n.instanceId.startsWith('reinforce'));
    
    console.log(`   Reinforcements Found: ${reinforcements.length} (Expected: 1+)`);
    if (reinforcements[0]) {
        console.log(`   Spawned: ${reinforcements[0].name} (${reinforcements[0].type})`);
    }

    // VERDICT
    const dominationPass = buffs.attack_damage === 0.15;
    const reinforcementPass = reinforcements.length > 0;

    if (dominationPass && reinforcementPass) {
        console.log("\n🌟 FINAL VERDICT: FACTION WARS PHASE 2 PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: PHASE 2 LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runPhase2Audit().catch(err => console.error(err));
