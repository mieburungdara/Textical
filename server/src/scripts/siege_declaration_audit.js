const siegeService = require('../services/guild/SiegeService');
const prisma = require('../db');

async function runSiegeDeclarationAudit() {
    console.log("--------------------------------------------------");
    console.log("🏰 STARTING SIEGE DECLARATION AUDIT");
    console.log("--------------------------------------------------\n");

    const attackerGuildId = 1;
    const regionId = 1;

    // 0. Setup: Ensure target territory exists and guild has silver
    console.log("[0/2] Preparing environment...");
    await prisma.regionTemplate.upsert({
        where: { id: regionId },
        update: { visualType: "TOWN" },
        create: { id: regionId, name: "Siege Town", description: "Target for siege", visualType: "TOWN" }
    });
    // Ensure Owner Guild exists
    await prisma.guild.upsert({
        where: { id: 2 },
        update: { name: "Defenders" },
        create: { id: 2, name: "Defenders", templateId: 1 }
    });
    await prisma.territory.upsert({
        where: { regionId },
        update: { siegeStatus: "PEACE", guildId: 2 },
        create: { regionId, guildId: 2, siegeStatus: "PEACE" }
    });
    await prisma.guild.update({
        where: { id: attackerGuildId },
        data: { treasury: 1000000 }
    });
    await prisma.siege.deleteMany({ where: { territory: { regionId } } });

    // 1. Declare Siege
    console.log("[1/2] Declaring siege (Cost: 500k Silver)...");
    const siege = await siegeService.declareSiege(attackerGuildId, regionId);
    
    const attacker = await prisma.guild.findUnique({ where: { id: attackerGuildId } });
    const territory = await prisma.territory.findUnique({ where: { regionId } });

    console.log(`   Siege ID: ${siege.id}`);
    console.log(`   Attacker Treasury: ${attacker.treasury} (Expected: 500,000)`);
    console.log(`   Territory Status: ${territory.siegeStatus} (Expected: UNDER_SIEGE)`);

    // VERDICT
    if (siege && attacker.treasury === 500000 && territory.siegeStatus === "UNDER_SIEGE") {
        console.log("\n🌟 FINAL VERDICT: SIEGE DECLARATION PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: DECLARATION FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runSiegeDeclarationAudit().catch(err => console.error(err));
