const craftingService = require('../services/craftingService');
const inventoryService = require('../services/inventoryService');
const statService = require('../services/statService');
const affixResolver = require('../logic/crafting/AffixResolver');
const prisma = require('../db');

async function runMasterAffixAudit() {
    console.log("--------------------------------------------------");
    console.log("💎 STARTING MAGICAL AFFIXES MASTER AUDIT");
    console.log("--------------------------------------------------\n");

    const userId = 1;
    const heroId = 39;
    const recipeId = 1; // Bronze Sword Recipe
    const swordTemplateId = 7001;
    const fireEssenceId = 3001;

    // 0. Setup
    console.log("[0/4] Preparing environment...");
    const heroes = await prisma.hero.findMany({ where: { userId } });
    for (const h of heroes) await prisma.heroEquipment.deleteMany({ where: { heroId: h.id } });
    await prisma.itemInstanceTrait.deleteMany({ where: { itemInstance: { userId } } });
    await prisma.inventoryItem.deleteMany({ where: { userId } });
    await prisma.taskQueue.deleteMany({ where: { userId } });

    await inventoryService.addItem(userId, fireEssenceId, 1);
    await prisma.user.update({ where: { id: userId }, data: { energy: 100, currentRegion: 1 } });

    // 1. Craft with Affix
    console.log("[1/4] Crafting Bronze Sword with Fire Essence...");
    const task = await craftingService.startCrafting(userId, recipeId, fireEssenceId);
    await craftingService.completeCrafting(userId, task.id);

    const craftedItem = await prisma.inventoryItem.findFirst({
        where: { userId, templateId: swordTemplateId },
        include: { instanceTraits: { include: { trait: true } } }
    });

    // 2. Verify Visual Suffix
    const traitId = craftedItem.instanceTraits[0].traitId;
    const suffix = affixResolver.getSuffix(traitId);
    const displayName = `${craftedItem.templateId === 7001 ? 'Bronze Sword' : ''} ${suffix}`;
    console.log(`   Crafted Item: ${displayName}`);
    console.log(`   Affix Found: ${craftedItem.instanceTraits[0].trait.name}`);

    // 3. Equip and Check Stats
    console.log("[3/4] Equipping and checking stats...");
    await prisma.heroEquipment.create({
        data: { heroId, slotKey: "MAIN_HAND", itemInstanceId: craftedItem.id }
    });

    const naturalStats = await statService.calculateHeroStats(heroId); // Without equipment (oh wait I just equipped it)
    // Let's do it properly
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    const statsBase = await statService.calculateHeroStats(heroId);
    
    await prisma.heroEquipment.create({
        data: { heroId, slotKey: "MAIN_HAND", itemInstanceId: craftedItem.id }
    });
    const statsMagical = await statService.calculateHeroStats(heroId);

    const diff = statsMagical.attack_damage - statsBase.attack_damage;
    console.log(`   Stat Difference: ${diff} (Expected: 20 -> 15 Template + 5 Affix)`);

    // VERDICT
    const suffixPass = suffix === "of Embers";
    const statPass = diff === 20;

    if (suffixPass && statPass) {
        console.log("\n🌟 FINAL VERDICT: MAGICAL AFFIX SYSTEM PERFECT.");
    } else {
        console.log("\n❌ FINAL VERDICT: SYSTEM FAILURE.");
    }

    // Cleanup
    await prisma.heroEquipment.deleteMany({ where: { heroId } });
    await prisma.itemInstanceTrait.deleteMany({ where: { itemInstanceId: craftedItem.id } });
    await prisma.inventoryItem.delete({ where: { id: craftedItem.id } });

    console.log("\n--------------------------------------------------");
}

runMasterAffixAudit().catch(err => console.error(err));
