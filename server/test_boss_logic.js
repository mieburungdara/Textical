
const prisma = require('./src/db');
const bossManager = require('./src/services/BossManager');

async function runTests() {
    console.log("=== BOSS MANAGER VERIFICATION ===");
    
    // Randomized IDs to avoid conflicts
    const ID_BASE = 800000 + Math.floor(Math.random() * 100000);
    const REGION_ID = ID_BASE + 1;
    const MONSTER_ID = ID_BASE + 2;
    const USER_ID = ID_BASE + 3;

    try {
        console.log(`Using IDs: Region=${REGION_ID}, Monster=${MONSTER_ID}, User=${USER_ID}`);

        // 1. Setup Data
        await prisma.regionTemplate.create({
            data: { id: REGION_ID, name: 'Boss Lair', zoneType: 'BLACK', description: 'Darkness', zoneLevel: 50 }
        });

        // Ensure Category Exists
        await prisma.monsterCategory.upsert({
            where: { id: 1 },
            update: {},
            create: { id: 1, name: 'Test Beast' }
        });

        await prisma.monsterTemplate.create({
            data: { 
                id: MONSTER_ID, 
                name: 'The Eternal King', 
                rank: 'WORLD_BOSS', 
                hp_base: 10000, 
                damage_base: 100, 
                categoryId: 1 // Assuming 1 exists, usually 'Beast' or similar. Check seed logic if fails.
            }
        });

        // Link Monster to Region
        await prisma.regionMonster.create({
            data: { regionId: REGION_ID, monsterId: MONSTER_ID }
        });

        const user = await prisma.user.create({
            data: { id: USER_ID, username: `slayer_${ID_BASE}`, password: 'password', silver: 0 }
        });

        // 2. Test Initialization (Ensure State Creation)
        console.log("\nTest 1: Initialize BossManager (State Creation)");
        await bossManager.ensureBossStates();
        
        const state1 = await bossManager.getBossStatus(MONSTER_ID);
        if (state1 && state1.isAlive) {
            console.log("PASS: World Boss State created and is ALIVE.");
        } else {
            console.error("FAIL: State creation failed or not alive.");
            console.log(state1);
        }

        // 3. Test Boss Death (Perma-Death & Slayer Record)
        console.log("\nTest 2: Handle Boss Death");
        await bossManager.handleBossDeath(MONSTER_ID, REGION_ID, USER_ID);

        const state2 = await bossManager.getBossStatus(MONSTER_ID);
        if (state2 && !state2.isAlive && state2.killedByUserId === USER_ID) {
            console.log(`PASS: Boss is DEAD. Slayer: ${state2.killedByUserName} (ID: ${state2.killedByUserId})`);
            console.log(`Killed At: ${state2.killedAt}`);
        } else {
            console.error("FAIL: Boss death update failed.");
            console.log(state2);
        }

        // 4. Test Persistence (Re-Init should not revive)
        console.log("\nTest 3: Re-Check after ensureBossStates (Persistence)");
        await bossManager.ensureBossStates();
        const state3 = await bossManager.getBossStatus(MONSTER_ID);
        if (!state3.isAlive) {
            console.log("PASS: Boss remains DEAD after re-check.");
        } else {
            console.error("FAIL: Boss revived! (Should be perma-dead)");
        }

    } catch (e) {
        console.error("CRITICAL ERROR:", e);
    } finally {
        console.log("\nCleaning up...");
        try {
            await prisma.worldBossState.deleteMany({ where: { monsterId: MONSTER_ID } });
            await prisma.regionMonster.deleteMany({ where: { monsterId: MONSTER_ID } });
            await prisma.monsterTemplate.delete({ where: { id: MONSTER_ID } });
            await prisma.regionTemplate.delete({ where: { id: REGION_ID } });
            await prisma.user.delete({ where: { id: USER_ID } });
        } catch (cleanupErr) {
            console.log("Cleanup warning: " + cleanupErr.message);
        }
        await prisma.$disconnect();
    }
}

runTests();
