const formationService = require('./src/services/formationService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    console.log("--- TESTING TACTICAL GRID LOGIC (ROBUST) ---");
    
    const user = await prisma.user.findFirst({ include: { heroes: true, formationPresets: true } });
    if (!user || user.heroes.length === 0) {
        console.log("❌ ERROR: No user or heroes found. Run seed first.");
        process.exit(1);
    }
    const preset = user.formationPresets[0];
    const hero = user.heroes[0];

    // 1. Test Overlap Prevention
    console.log("1. Testing Overlap Prevention...");
    try {
        await formationService.updateFormation(user.id, preset.id, [
            { heroId: hero.id, gridX: 1, gridY: 1 },
            { heroId: hero.id, gridX: 1, gridY: 1 } // DUPLICATE
        ]);
        console.log("❌ FAILURE: Overlap allowed.");
    } catch (e) {
        console.log("✅ SUCCESS: Blocked overlapping hero positions.");
    }

    // 2. Test Dual-Wield Trait Aggregation
    console.log("2. Testing Dual-Wield Trait Aggregation...");
    
    // Clear old equipment first to avoid unique constraint errors
    await prisma.heroEquipment.deleteMany({ where: { heroId: hero.id } });

    const swordTemplate = await prisma.itemTemplate.findFirst({ where: { name: "Sword" } });
    const mainHandItem = await prisma.inventoryItem.create({ data: { userId: user.id, templateId: swordTemplate.id } });
    const offHandItem = await prisma.inventoryItem.create({ data: { userId: user.id, templateId: swordTemplate.id } });

    // Use individual creates for SQLite compatibility
    await prisma.heroEquipment.create({ data: { heroId: hero.id, slotKey: "MAIN_HAND", itemInstanceId: mainHandItem.id } });
    await prisma.heroEquipment.create({ data: { heroId: hero.id, slotKey: "OFF_HAND", itemInstanceId: offHandItem.id } });

    const profile = await formationService.getHeroCombatProfile(hero.id);
    console.log("Aggregated Traits Count:", profile.activeTraits.length);

    const mainHandTrait = profile.activeTraits.find(t => t.sourceSlot === "MAIN_HAND");
    const offHandTrait = profile.activeTraits.find(t => t.sourceSlot === "OFF_HAND");

    if (mainHandTrait && offHandTrait) {
        console.log("✅ SUCCESS: Both Hand traits aggregated successfully.");
    } else {
        console.log("❌ FAILURE: Trait aggregation incomplete.");
    }

    process.exit();
}

test();