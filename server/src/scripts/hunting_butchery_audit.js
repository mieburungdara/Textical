const lootService = require('../services/lootService');
const prisma = require('../db');

async function runAudit() {
    console.log("--------------------------------------------------");
    console.log("🏹 STARTING HUNTING & BUTCHERY MULTIPLIER AUDIT");
    console.log("--------------------------------------------------\n");

    const heroId = 999;
    const userId = 1;
    const wolfId = 6003; // Forest Wolf (60% Pelt, 50% Haunch)

    const SIMULATIONS = 1000;

    async function simulateKills(scenarioName, toolTemplateId = null) {
        console.log(`📡 Simulating ${SIMULATIONS} kills: ${scenarioName}...`);
        
        // Setup tool
        await prisma.heroEquipment.deleteMany({ where: { heroId } });
        if (toolTemplateId) {
            const toolInstance = await prisma.inventoryItem.upsert({
                where: { userId_templateId: { userId, templateId: toolTemplateId } },
                update: { quantity: 1 },
                create: { userId, templateId: toolTemplateId, quantity: 1 }
            });
            await prisma.heroEquipment.create({
                data: { heroId, slotKey: "MAIN_HAND", itemInstanceId: toolInstance.id }
            });
        }

        let totalPelts = 0;
        let totalMeat = 0;

        for (let i = 0; i < SIMULATIONS; i++) {
            const loot = await lootService.generateMonsterLoot(wolfId, heroId);
            const pelt = loot.find(l => l.itemId === 2603);
            const meat = loot.find(l => l.itemId === 3703);
            
            if (pelt) totalPelts++;
            if (meat) totalMeat++;
        }

        console.log(`   Pelts dropped: ${totalPelts} (${(totalPelts/SIMULATIONS*100).toFixed(1)}%)`);
        console.log(`   Meat dropped: ${totalMeat} (${(totalMeat/SIMULATIONS*100).toFixed(1)}%)`);
        return { pelts: totalPelts, meat: totalMeat };
    }

    // 1. Bare Hands (Base: 60% Pelt, 50% Meat)
    const res1 = await simulateKills("Bare Hands");

    // 2. Iron Skinner's Knife (1.2x chance multiplier for Leather)
    // Base 60% * 1.2 = 72%
    const res2 = await simulateKills("Iron Skinner's Knife (+20% Pelt Chance)", 3902);

    // 3. Iron Butcher's Cleaver (1.2x chance multiplier for Meat)
    // Base 50% * 1.2 = 60%
    const res3 = await simulateKills("Iron Butcher's Cleaver (+20% Meat Chance)", 4102);

    console.log("\n📊 ANALYSIS:");
    const peltDiff = res2.pelts - res1.pelts;
    const meatDiff = res3.meat - res1.meat;

    console.log(`   Pelt Yield Increase: +${peltDiff} (${(peltDiff/SIMULATIONS*100).toFixed(1)}%)`);
    console.log(`   Meat Yield Increase: +${meatDiff} (${(meatDiff/SIMULATIONS*100).toFixed(1)}%)`);

    if (peltDiff > 50 && meatDiff > 50) {
        console.log("\n🌟 FINAL VERDICT: HUNTING & BUTCHERY SYSTEM PERFECTLY BALANCED.");
    } else {
        console.log("\n❌ FINAL VERDICT: MULTIPLIER IMPACT TOO LOW OR MISMATCHED.");
    }

    console.log("\n--------------------------------------------------");
}

runAudit().catch(err => console.error(err));
