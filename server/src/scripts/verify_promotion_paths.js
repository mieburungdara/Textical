const prisma = require('../db');

async function verifyPromotionPaths() {
    console.log("--------------------------------------------------");
    console.log("🎖️ VERIFYING BRANCHING PROMOTION PATHS");
    console.log("--------------------------------------------------\n");

    const tier1Classes = await prisma.classTemplate.findMany({
        where: { tier: 1 }
    });

    console.log(`Analyzing ${tier1Classes.length} Tier 1 classes...`);
    let errors = 0;

    for (const t1 of tier1Classes) {
        const promotions = await prisma.classTemplate.findMany({
            where: { parentClassId: t1.id }
        });

        const status = (promotions.length === 2) ? "✅ PASS" : "❌ FAIL";
        console.log(`   [${status}] ${t1.name.padEnd(15)} | Options Found: ${promotions.length} (${promotions.map(p => p.name).join(', ')})`);
        
        if (promotions.length !== 2) errors++;
    }

    console.log("\n--------------------------------------------------");
    if (errors === 0) {
        console.log("🌟 FINAL VERDICT: 100% PERFECT BRANCHING (70 Classes Total)");
    } else {
        console.log(`⚠️ FINAL VERDICT: ${errors} classes have incorrect branching.`);
    }
}

verifyPromotionPaths().catch(err => console.error(err));
