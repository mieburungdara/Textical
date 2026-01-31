const conquestService = require('../services/territoryConquestService');
const treasuryService = require('../services/guild/GuildTreasuryService');
const prisma = require('../db');

async function runConquestMasterAudit() {
    console.log("--------------------------------------------------");
    console.log("⚔️ STARTING GUILD TERRITORY MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const guildId = 1;
    const regionId = 1;

    // 0. Setup: Guild with some gold
    console.log("[0/4] Preparing guild and capturing region...");
    await prisma.guildTemplate.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: "Standard" } });
    await prisma.guild.upsert({
        where: { id: guildId },
        update: { treasury: 1500 }, // Enough for 1 upkeep
        create: { id: guildId, name: "Legion", templateId: 1, treasury: 1500 }
    });

    await prisma.$transaction(async (tx) => {
        await conquestService.captureTerritory(tx, guildId, regionId);
    });

    // 1. First Upkeep (Success)
    console.log("[1/4] Processing first upkeep (Costs 1000)...");
    await treasuryService.processDailyUpkeep();
    
    const guildAfter1 = await prisma.guild.findUnique({ where: { id: guildId } });
    const territoryAfter1 = await prisma.territory.findUnique({ where: { regionId } });
    
    console.log(`   Treasury: ${guildAfter1.treasury} (Expected: 500)`);
    console.log(`   Territory Active: ${!!territoryAfter1} (Expected: YES)`);

    // 2. Second Upkeep (Failure)
    console.log("[2/4] Processing second upkeep (Insufficient funds)...");
    await treasuryService.processDailyUpkeep();
    
    const guildAfter2 = await prisma.guild.findUnique({ where: { id: guildId } });
    const territoryAfter2 = await prisma.territory.findUnique({ where: { regionId } });
    
    console.log(`   Treasury: ${guildAfter2.treasury} (Expected: 500 - No deduction on fail)`);
    console.log(`   Territory Active: ${!!territoryAfter2} (Expected: NO)`);

    // 3. Final Verification
    console.log("[3/4] Final data integrity check...");

    // VERDICT
    if (guildAfter1.treasury === 500 && territoryAfter1 && !territoryAfter2) {
        console.log("\n🌟 FINAL VERDICT: GUILD TERRITORY & UPKEEP PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: CONQUEST LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runConquestMasterAudit().catch(err => console.error(err));
