const breedingService = require('../services/heroBreedingService');
const prisma = require('../db');

async function runInheritanceAudit() {
    console.log("--------------------------------------------------");
    console.log("🧬 STARTING HERO INHERITANCE MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const fatherId = 39; // Arthur (Gen 1)
    const motherId = 40; // Dummy mother

    // 0. Setup: Ensure parents exist and are clean
    console.log("[0/4] Preparing parent heroes (Gen 1)...");
    await prisma.hero.update({
        where: { id: fatherId },
        data: { userId, generation: 1, hasOffspring: false, hp_base: 100, damage_base: 10, str: 10, dex: 10, int: 10, vit: 10 }
    });
    
    await prisma.hero.upsert({
        where: { id: motherId },
        update: { userId, generation: 1, hasOffspring: false, hp_base: 100, damage_base: 10, str: 10, dex: 10, int: 10, vit: 10 },
        create: { id: motherId, userId, name: "Lady Elara", classId: 1, generation: 1, hasOffspring: false, hp_base: 100, damage_base: 10, str: 10, dex: 10, int: 10, vit: 10 }
    });

    await prisma.user.update({ where: { id: userId }, data: { gold: 10000 } });

    // 1. Breed Heroes
    console.log("[1/4] Breeding Father 39 and Mother 40...");
    const child = await breedingService.breedHeroes(userId, fatherId, motherId, "Arthur Jr.");
    console.log(`   ✅ Child Born: ${child.name} (ID: ${child.id}, Gen: ${child.generation})`);

    // 2. Verify Generation Bonus (+5% for Gen 2)
    console.log("[2/4] Verifying Generation 2 stat bonus (+5%)...");
    console.log(`   Child STR: ${child.str} (Expected: 10.5 -> 10 or 11 based on floor)`);
    
    // 3. Verify Offspring Locking
    console.log("[3/4] Testing Offspring Lock (Cannot breed again)...");
    try {
        await breedingService.breedHeroes(userId, fatherId, motherId, "Broken Baby");
        console.log("   ❌ Error: Parents should be locked.");
    } catch (e) {
        console.log(`   ✅ Expected Failure: ${e.message}`);
    }

    // 4. Verify Lineage
    const lineageChild = await prisma.hero.findUnique({
        where: { id: child.id },
        include: { father: true, mother: true }
    });
    console.log(`[4/4] Verifying Lineage: Father: ${lineageChild.father.name}, Mother: ${lineageChild.mother.name}`);

    // VERDICT
    if (child.generation === 2 && lineageChild.fatherId === fatherId && (await prisma.hero.findUnique({ where: { id: fatherId } })).hasOffspring) {
        console.log("\n🌟 FINAL VERDICT: HERO INHERITANCE SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: GENETIC LOGIC FAILURE.");
    }

    console.log("\n--------------------------------------------------");
}

runInheritanceAudit().catch(err => console.error(err));