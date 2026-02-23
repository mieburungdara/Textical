const rewardProcessor = require('../services/battle/RewardProcessor');
const siegeService = require('../services/guild/SiegeService');
const prisma = require('../db');

async function runSiegeImpactAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING SIEGE BATTLE IMPACT AUDIT");
    console.log("--------------------------------------------------\n");

    const attackerId = 1; // Guild 1
    const victimId = 2; // Guild 2
    const regionId = 1;

    // 0. Setup: Ensure active siege
    console.log("[0/2] Preparing active siege...");
    await prisma.regionTemplate.upsert({
        where: { id: regionId },
        update: { visualType: "TOWN" },
        create: { id: regionId, name: "Siege Town", visualType: "TOWN", description: "Target" }
    });
    const territory = await prisma.territory.upsert({
        where: { regionId },
        update: { guildId: 2, siegeStatus: "PEACE", fortification: 1000 },
        create: { regionId, guildId: 2, siegeStatus: "PEACE", fortification: 1000 }
    });
    
    await prisma.user.update({ where: { id: attackerId }, data: { currentRegion: regionId, guildId: 1 } });
    await prisma.user.update({ where: { id: victimId }, data: { currentRegion: regionId, guildId: 2 } });
    
    // Explicitly check membership link
    await prisma.guild.update({
        where: { id: 1 },
        data: { 
            treasury: 1000000,
            members: { connect: { id: attackerId } } 
        }
    });
    await prisma.siegeLog.deleteMany({ where: { siege: { territoryId: territory.id } } });
    await prisma.siege.deleteMany({ where: { territoryId: territory.id } });
    
    const siege = await siegeService.declareSiege(1, regionId);
    const activeTerritoryId = siege.territoryId;
    await prisma.territory.update({ where: { id: activeTerritoryId }, data: { siegeStatus: "UNDER_SIEGE" } });

    // 1. Simulate Battle Victory
    console.log("\n[1/2] Simulating Attacker victory in sieged region...");
    const battleResult = {
        winner: 0,
        victimUserId: victimId,
        initialUnits: [
            { teamId: 0, data: { db_id: 39 }, isDead: false },
            { teamId: 1, data: { db_id: 10 }, isDead: true }
        ],
        rewards: { exp: 10, gold: 0 }
    };

    await rewardProcessor.process(attackerId, battleResult, { loot: [] }, 1);

    // 2. Verify Fortification Loss
    const updatedTerritory = await prisma.territory.findUnique({ where: { id: activeTerritoryId } });
    console.log(`   Fortification: ${updatedTerritory.fortification} (Expected: 900)`);

    // VERDICT
    if (updatedTerritory.fortification === 900) {
        console.log("\n🌟 FINAL VERDICT: SIEGE IMPACT PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: IMPACT FAILURE.");
    }

    console.log("--------------------------------------------------");
}

runSiegeImpactAudit().catch(err => console.error(err));
