const rewardProcessor = require('../services/battle/RewardProcessor');
const siegeService = require('../services/guild/SiegeService');
const prisma = require('../db');

async function runMasterSiegeAudit() {
    console.log("--------------------------------------------------");
    console.log("🏰 STARTING GUILD SIEGE MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const attackerId = 1;
    const defenderId = 2;
    const regionId = 1;

    // 0. Setup
    console.log("[0/4] Preparing environment...");
    await prisma.regionTemplate.upsert({
        where: { id: regionId },
        update: { visualType: "TOWN" },
        create: { id: regionId, name: "Siege Town", visualType: "TOWN", description: "Target" }
    });
    
    // Guild 2 owns territory
    const territory = await prisma.territory.upsert({
        where: { regionId },
        update: { guildId: defenderId, siegeStatus: "PEACE", fortification: 200, maxFortification: 1000 },
        create: { regionId, guildId: defenderId, siegeStatus: "PEACE", fortification: 200, maxFortification: 1000 }
    });

    await prisma.user.update({ where: { id: attackerId }, data: { currentRegion: regionId, guildId: 1 } });
    await prisma.user.update({ where: { id: defenderId }, data: { currentRegion: regionId, guildId: 2 } });
    
    await prisma.guild.update({ where: { id: 1 }, data: { treasury: 1000000 } });
    await prisma.siegeLog.deleteMany({ where: { siege: { territoryId: territory.id } } });
    await prisma.siege.deleteMany({ where: { territoryId: territory.id } });

    // 1. Declare Siege
    console.log("[1/4] Declaring Siege...");
    await siegeService.declareSiege(attackerId, regionId);

    // 2. Battle 1 (Reduces to 100)
    console.log("[2/4] Attacker wins first battle...");
    const battleResult = {
        winner: 0,
        victimUserId: defenderId,
        initialUnits: [
            { teamId: 0, data: { db_id: 39 }, isDead: false },
            { teamId: 1, data: { db_id: 10 }, isDead: true }
        ],
        rewards: { exp: 10, gold: 0 }
    };
    await rewardProcessor.process(attackerId, battleResult, { loot: [] }, 1);

    const fortMid = (await prisma.territory.findUnique({ where: { id: territory.id } })).fortification;
    console.log(`   Fortification after 1st win: ${fortMid} (Expected: 100)`);

    // 3. Battle 2 (Reduces to 0 -> CONQUEST)
    console.log("[3/4] Attacker wins second battle (Final blow)...");
    await rewardProcessor.process(attackerId, battleResult, { loot: [] }, 1);

    const finalTerritory = await prisma.territory.findUnique({ where: { id: territory.id } });
    const finalSiege = await prisma.siege.findFirst({ where: { territoryId: territory.id }, orderBy: { id: 'desc' } });

    console.log(`   New Owner Guild ID: ${finalTerritory.guildId} (Expected: 1)`);
    console.log(`   Territory Status: ${finalTerritory.siegeStatus} (Expected: PEACE)`);
    console.log(`   Siege Status: ${finalSiege.status} (Expected: WON)`);

    // VERDICT
    if (finalTerritory.guildId === attackerId && finalTerritory.siegeStatus === "PEACE" && finalSiege.status === "WON") {
        console.log("\n🌟 FINAL VERDICT: GUILD SIEGE SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: CONQUEST FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runMasterSiegeAudit().catch(err => console.error(err));
