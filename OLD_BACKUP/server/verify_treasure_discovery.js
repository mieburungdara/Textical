const { UnitClass, UnitRace } = require('@prisma/client');
const prisma = require('./src/db');
const treasureDiscovery = require('./src/services/world/TreasureDiscoveryService');

async function verifyTreasureDiscovery() {
    console.log("--- Verifying Treasure Discovery System ---\n");

    try {
        // 1. Ensure ClassTemplate exists
        let warriorClass = await prisma.classTemplate.findUnique({ where: { id: 1 } });
        if (!warriorClass) {
            console.log("⚠️ Warrior Class not found. Creating dummy class...");
            warriorClass = await prisma.classTemplate.create({
                data: {
                    id: 1,
                    name: "Warrior",
                    description: "Melee fighter"
                }
            });
        }

        // 2. Create test treasure in a region
        console.log("=== SETUP: Creating Test Treasure ===");
        const testRegion = await prisma.regionTemplate.findFirst({
            where: { zoneType: 'GREEN' }
        });

        if (!testRegion) {
            console.error("❌ No GREEN region found for testing.");
            return;
        }

        const treasure = await prisma.hiddenTreasure.create({
            data: {
                regionId: testRegion.id,
                treasureType: 'HERB',
                baseChance: 0.80, // 80% for easy testing
                cooldownDays: 7
            }
        });

        console.log(`✅ Created test treasure in Region ${testRegion.name} (ID: ${treasure.id})`);

        // 3. Get test user with heroes
        let testUser = await prisma.user.findFirst({
            include: { heroes: true }
        });

        if (!testUser) {
            console.log("⚠️ No user found. Creating dummy user...");
            testUser = await prisma.user.create({
                data: {
                    username: `TreasureHunter_${Date.now()}`,
                    password: 'password123',
                    currentRegion: 1, // Default region
                    heroes: {
                        create: {
                            name: 'Indy',
                            race: UnitRace.HUMAN,
                            classLevel: 1,
                            classId: warriorClass.id // Link to ClassTemplate
                        }
                    }
                },
                include: { heroes: true }
            });
        }

        console.log(`\n=== TEST 1: Discovery Without Traits Bonus ===`);
        console.log(`User: ${testUser.username} (ID: ${testUser.id})`);
        console.log(`Heroes: ${testUser.heroes.length}`);
        
        let discovered = false;
        for (let i = 0; i < 5; i++) {
            console.log(`\n--- Attempt ${i + 1} ---`);
            const result = await treasureDiscovery.attemptDiscovery(testUser.id, testRegion.id);
            console.log(`Result:`, result.message);

            if (result.discovered) {
                console.log(`✅ SUCCESS: Treasure discovered!`);
                console.log(`Reward:`, result.reward);

                // Verify cooldown
                const updatedTreasure = await prisma.hiddenTreasure.findUnique({
                    where: { id: treasure.id }
                });
                console.log(`Respawn At: ${updatedTreasure.respawnAt?.toISOString()}`);
                console.log(`Is Active: ${updatedTreasure.isActive}`);
                
                discovered = true;
                break;
            }
        }
        
        if (!discovered) {
            console.log(`⚠️ Not discovered after 5 attempts (Bad RNG).`);
        }

        // 4. Test respawn process
        console.log(`\n=== TEST 2: Respawn Process ===`);
        const respawnCount = await treasureDiscovery.processRespawns();
        console.log(`Respawned ${respawnCount} treasures.`);

        // Cleanup
        await prisma.hiddenTreasure.delete({ where: { id: treasure.id } });
        // Optional: Clean dummy class/user if we created them, but keeping them might be useful for future tests
        console.log(`\n✅ Test completed. Treasure cleaned up.`);

    } catch (error) {
        console.error("❌ ERROR DURING VERIFICATION:", error);
    } finally {
        // Do NOT disconnect the shared prisma instance if it's used elsewhere, but for a script it is fine to just exit.
        // But since we require('./src/db'), we shouldn't manually disconnect it unless we want to close the connection pool.
        // await prisma.$disconnect(); 
    }
}

verifyTreasureDiscovery();
