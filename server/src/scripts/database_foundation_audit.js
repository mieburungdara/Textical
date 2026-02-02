const prisma = require('../db');

async function runFoundationAudit() {
    console.log("--------------------------------------------------");
    console.log("📦 STARTING DATABASE FOUNDATION MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const errors = [];

    // 1. Check User Fields
    console.log("[1/5] Checking User safety & logistics fields...");
    const user = await prisma.user.findFirst();
    if (user) {
        if (user.pvpFlagged === undefined) errors.push("User.pvpFlagged missing");
        if (user.isKnockedOut === undefined) errors.push("User.isKnockedOut missing");
        console.log(`   OK: pvpFlagged=${user.pvpFlagged}, isKnockedOut=${user.isKnockedOut}`);
    }

    // 2. Check Hero isMain
    console.log("[2/5] Checking Hero.isMain field...");
    const hero = await prisma.hero.findFirst();
    if (hero) {
        if (hero.isMain === undefined) errors.push("Hero.isMain missing");
        console.log(`   OK: isMain=${hero.isMain}`);
    }

    // 3. Check Inventory Durability
    console.log("[3/5] Checking InventoryItem durability fields...");
    const item = await prisma.inventoryItem.findFirst();
    if (item) {
        if (item.currentDurability === undefined) errors.push("InventoryItem.currentDurability missing");
        if (item.maxDurability === undefined) errors.push("InventoryItem.maxDurability missing");
        console.log(`   OK: currentDurability=${item.currentDurability}/${item.maxDurability}`);
    }

    // 4. Check Region ZoneType
    console.log("[4/5] Checking RegionTemplate.zoneType field...");
    const region = await prisma.regionTemplate.findFirst({ where: { id: 1 } });
    if (region) {
        if (region.zoneType === undefined) errors.push("RegionTemplate.zoneType missing");
        console.log(`   OK: zoneType=${region.zoneType}`);
    }

    // 5. Check New Models (Wagon)
    console.log("[5/5] Checking Wagon and WagonItem models...");
    try {
        await prisma.wagon.count();
        await prisma.wagonItem.count();
        console.log("   OK: Wagon models are queryable.");
    } catch (e) {
        errors.push("Wagon models missing or not synchronized.");
    }

    // VERDICT
    if (errors.length === 0) {
        console.log("\n🌟 FINAL VERDICT: DATABASE FOUNDATION PERFECT.");
    } else {
        console.log(`\n❌ FINAL VERDICT: AUDIT FAILURE. Errors:\n- ${errors.join('\n- ')}`);
    }

    console.log("\n--------------------------------------------------");
}

runFoundationAudit().catch(err => console.error(err));
