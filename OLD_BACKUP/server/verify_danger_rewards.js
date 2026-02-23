const prisma = require('./src/db');
const rewardProcessor = require('./src/services/battle/RewardProcessor');

async function verifyDangerRewards() {
    console.log("--- 📊 VERIFYING DANGER LEVEL REWARDS 📊 ---");

    // 1. Setup Test Data
    const user = await prisma.user.findFirst({
        include: { region: true }
    });

    if (!user) {
        console.error("No user found for testing.");
        return;
    }

    const monsterTemplate = {
        loot: [
            { itemId: 1, chance: 0.1 } // 10% base chance
        ]
    };

    const battleResult = {
        winner: 0, // Player wins
        rewards: { exp: 1000, gold: 100 },
        initialUnits: [
            { teamId: 0, isDead: false, data: { db_id: 1 } }
        ],
        killed_monsters: []
    };

    // --- TEST 1: Level 1 Region (GREEN) ---
    await prisma.regionTemplate.update({
        where: { id: user.currentRegion },
        data: { dangerLevel: 1, zoneType: 'GREEN' }
    });

    console.log(`\n[Test 1] Level 1 Region (1.0x XP, 1.0x Gold)`);
    let result = await rewardProcessor.process(user.id, battleResult, monsterTemplate, 1, 12);
    // Note: RewardProcessor might interact with real heroes, so this is a simplified logic check
    // In a real test we'd mock the database calls inside RewardProcessor
    console.log(`- Base XP: 1000, Result XP (Hero result 0): ${result.heroResults[0] ? result.heroResults[0].xpGained : 'N/A'}`);
    
    // --- TEST 2: Level 6 Region (BLACK) ---
    await prisma.regionTemplate.update({
        where: { id: user.currentRegion },
        data: { dangerLevel: 6, zoneType: 'BLACK' }
    });

    console.log(`\n[Test 2] Level 6 Region (1.75x XP, 1.5x Gold)`);
    result = await rewardProcessor.process(user.id, battleResult, monsterTemplate, 1, 12);
    console.log(`- Base XP: 1000, Expected: 1750, Result XP: ${result.heroResults[0] ? result.heroResults[0].xpGained : 'N/A'}`);

    console.log("\n--- ✅ VERIFICATION SCRIPT EXECUTED ✅ ---");
}

verifyDangerRewards()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
