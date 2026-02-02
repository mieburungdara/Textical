const service = require('../services/economy/TaxationService');
const factionService = require('../services/faction/FactionWarService');
const prisma = require('../db');

async function runTaxationAudit() {
    console.log("--------------------------------------------------");
    console.log("⚖️ STARTING TAXATION SERVICE AUDIT");
    console.log("--------------------------------------------------\n");

    const regionId = 1;
    const empireId = 1;
    const rebelId = 2;

    // 1. Setup: No War
    console.log("[1/2] Testing Peace State (Expected: 10%)...");
    await factionService.setRelation(empireId, rebelId, "PEACE");
    await service.updateAllRegionalTaxes();
    
    const regionPeace = await prisma.regionTemplate.findUnique({ where: { id: regionId } });
    console.log(`   Region ${regionId} Tax Rate: ${regionPeace.regionalTaxRate * 100}%`);

    // 2. Setup: War
    console.log("\n[2/2] Testing War State (Expected: 15%)...");
    await factionService.setRelation(empireId, rebelId, "WAR");
    await service.updateAllRegionalTaxes();

    const regionWar = await prisma.regionTemplate.findUnique({ where: { id: regionId } });
    console.log(`   Region ${regionId} Tax Rate: ${regionWar.regionalTaxRate * 100}%`);

    // VERDICT
    if (regionPeace.regionalTaxRate === 0.10 && regionWar.regionalTaxRate === 0.15) {
        console.log("\n🌟 FINAL VERDICT: TAXATION SERVICE PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SERVICE UPDATE FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runTaxationAudit().catch(err => console.error(err));
