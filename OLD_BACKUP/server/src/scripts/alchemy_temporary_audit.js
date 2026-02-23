const consumableService = require('../services/consumableService');
const statService = require('../services/statService');
const prisma = require('../db');

async function runTempAlchemyAudit() {
    console.log("--------------------------------------------------");
    console.log("🧪 STARTING TEMPORARY ALCHEMY VERIFICATION AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 999;
    const elixirId = 4421; // Elixir of Eternal Might (+50 STR for 60m)

    // 1. Setup Hero & Elixir
    console.log("[1/4] Setting up hero (Base STR: 10) and elixir...");
    await prisma.hero.upsert({
        where: { id: heroId },
        update: { str: 10, userId: userId },
        create: { id: heroId, userId: userId, name: "AlchTester", classId: 1001, str: 10 }
    });

    await prisma.inventoryItem.upsert({
        where: { userId_templateId: { userId, templateId: elixirId } },
        update: { quantity: 5 },
        create: { userId, templateId: elixirId, quantity: 5 }
    });

    // 2. Baseline Check
    const baseline = await statService.calculateHeroStats(heroId);
    console.log(`   Baseline STR: ${baseline.attributes.str}`);

    // 3. Consume & Verify
    console.log("[2/4] Consuming Elixir of Eternal Might...");
    await consumableService.consumeItem(userId, heroId, elixirId);

    const buffed = await statService.calculateHeroStats(heroId);
    console.log(`   Buffed STR: ${buffed.attributes.str} (Expected: 60)`);

    const updatedHero = await prisma.hero.findUnique({ where: { id: heroId } });
    console.log(`   Hero Base STR in DB: ${updatedHero.str} (Expected: 10 - NO PERMANENT CHANGE)`);

    // 4. Duration Check
    console.log("[3/4] Checking buff duration...");
    const buff = await prisma.heroBuff.findFirst({
        where: { heroId, itemId: elixirId }
    });
    const durationMins = (buff.expiresAt - buff.createdAt) / 1000 / 60;
    console.log(`   Buff duration: ${durationMins} minutes (Expected: 60)`);

    // 5. Result
    if (buffed.attributes.str === 60 && updatedHero.str === 10 && Math.round(durationMins) === 60) {
        console.log("\n🌟 FINAL VERDICT: ALCHEMY FIX SUCCESSFUL. ALL ELIXIRS ARE TEMPORARY.");
    } else {
        console.log("\n❌ FINAL VERDICT: LOGIC FAILURE. STILL PERMANENT OR MISMATCHED.");
    }

    // Cleanup
    await prisma.heroBuff.deleteMany({ where: { heroId } });

    console.log("\n--------------------------------------------------");
}

runTempAlchemyAudit().catch(err => console.error(err));
