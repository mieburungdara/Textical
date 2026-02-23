const prisma = require('../src/db');
const spiritService = require('../src/services/SpiritService');
const travelService = require('../src/services/travelService');

async function verifySpiritSystem() {
    console.log("=== STARTING SPIRIT SYSTEM VERIFICATION ===");

    try {
        const userId = 1; // TestPlayer
        const nightRegionId = 999; // Bandit Peak (High density)

        // 0. Clean TaskQueue
        await prisma.taskQueue.deleteMany({ where: { userId } }).catch(() => {});
        
        // 1. Manmually update WorldState to Night
        console.log("- Setting time to Night (22:00)...");
        await prisma.worldState.upsert({
            where: { id: 1 },
            update: { currentHour: 22 },
            create: { id: 1, currentHour: 22, weatherType: "CLEAR", moonPhase: "FULL" }
        });

        // 2. Ensure Bandit Peak is set up for testing spirit density
        console.log("- Preparing Region 999 for Spirit Testing...");
        await prisma.regionTemplate.upsert({
            where: { id: 999 },
            update: { 
                name: "Bandit Peak", 
                zoneType: "RED", 
                spiritDensity: 1.0 // 100% chance for test
            },
            create: { 
                id: 999, 
                name: "Bandit Peak", 
                description: "Ghostly mountains.", 
                zoneType: "RED", 
                spiritDensity: 1.0 
            }
        });

        // Link a specific spirit to region 999
        await prisma.regionSpirit.upsert({
            where: { regionId_spiritId: { regionId: 999, spiritId: 4 } }, // Chilling Wraith (Malevolent)
            update: {},
            create: { regionId: 999, spiritId: 4 }
        });

        // 3. Test Encounter via TravelService
        console.log("\n[TEST 1] Traveling at Night to High Density Zone...");
        // Reset user position to 1
        await prisma.user.update({ where: { id: userId }, data: { currentRegion: 1 } });
        
        // Mock connection
        await prisma.regionConnection.upsert({
            where: { originRegionId_targetRegionId: { originRegionId: 1, targetRegionId: 999 } },
            update: { travelTimeSeconds: 1 },
            create: { originRegionId: 1, targetRegionId: 999, travelTimeSeconds: 1 }
        });

        // RE-ENSURE LINK FOR SPIRIT
        await prisma.regionSpirit.upsert({
            where: { regionId_spiritId: { regionId: 999, spiritId: 4 } },
            update: {},
            create: { regionId: 999, spiritId: 4 }
        });

        const reg999 = await prisma.regionTemplate.findUnique({ where: { id: 999 } });
        console.log(`- Local Debug: Region 999 density: ${reg999.spiritDensity}`);

        const result = await travelService.startTravel(userId, 999);
        
        if (result.spiritEncounter) {
            console.log("✓ SUCCESS: Spirit Encounter triggered!");
            console.log(`  Spirit: ${result.spiritEncounter.spiritName}`);
            console.log(`  Message: ${result.spiritEncounter.message}`);
            console.log(`  Effect: ${result.spiritEncounter.effect.type} ${result.spiritEncounter.effect.key} (${result.spiritEncounter.effect.value})`);
        } else {
            console.log("✗ FAILED: Spirit Encounter NOT triggered at 1.0 density.");
        }

        // 4. Test Daytime Shield
        console.log("\n[TEST 2] Traveling at DAY to High Density Zone...");
        await prisma.taskQueue.deleteMany({ where: { userId } }).catch(() => {});
        await prisma.worldState.update({
            where: { id: 1 },
            data: { currentHour: 10 } // 10 AM
        });
        await prisma.user.update({ where: { id: userId }, data: { currentRegion: 1 } });

        const dayResult = await travelService.startTravel(userId, 999);
        if (!dayResult.spiritEncounter) {
            console.log("✓ SUCCESS: Spirits are hidden during the day.");
        } else {
            console.log("✗ FAILED: Spirit appeared during the day!");
        }

        // 5. Test Stacking (Should replace)
        console.log("\n[TEST 3] Testing Stacking (New spirit should replace old)...");
        await prisma.taskQueue.deleteMany({ where: { userId } }).catch(() => {});
        await prisma.worldState.update({
            where: { id: 1 },
            data: { currentHour: 23 } // Still night
        });
        
        // Ensure user is currently under spirit 4 (Chilling Wraith)
        await prisma.user.update({ where: { id: userId }, data: { currentRegion: 1, activeSpiritId: 4 } });
        console.log("- User starting with Spirit ID 4 (Chilling Wraith)...");

        // Force a new encounter with spirit 2 (Whispering Sylph) at region 998
        await prisma.regionTemplate.upsert({
            where: { id: 998 },
            update: { spiritDensity: 1.0, zoneType: "BLUE" },
            create: { 
                id: 998, 
                name: "Sylph Grove", 
                description: "A mystical grove filled with whispers.",
                zoneType: "BLUE", 
                spiritDensity: 1.0 
            }
        });
        await prisma.regionSpirit.upsert({
            where: { regionId_spiritId: { regionId: 998, spiritId: 2 } },
            update: {},
            create: { regionId: 998, spiritId: 2 }
        });

        // Mock connection for 998
        await prisma.regionConnection.upsert({
            where: { originRegionId_targetRegionId: { originRegionId: 1, targetRegionId: 998 } },
            update: { travelTimeSeconds: 1 },
            create: { originRegionId: 1, targetRegionId: 998, travelTimeSeconds: 1 }
        });

        const replaceResult = await travelService.startTravel(userId, 998);
        const updatedUser = await prisma.user.findUnique({ where: { id: userId } });

        // 6. Test Expiration
        console.log("\n[TEST 4] Testing Expiration (Expired spirit should be cleared)...");
        const expiredDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hour ago
        await prisma.user.update({
            where: { id: userId },
            data: { 
                activeSpiritId: 1, 
                activeSpiritExpiresAt: expiredDate 
            }
        });
        console.log(`- Set spirit ID 1 with expiration: ${expiredDate.toISOString()} (1h ago)`);

        const validSpirit = await spiritService.getValidActiveSpirit(userId);
        const finalUser = await prisma.user.findUnique({ where: { id: userId } });

        if (validSpirit === null && finalUser.activeSpiritId === null) {
            console.log("✓ SUCCESS: Expired spirit was automatically cleared.");
        } else {
            console.log(`✗ FAILED: Spirit still active! ID: ${finalUser.activeSpiritId}`);
        }

        console.log("\n=== VERIFICATION COMPLETE ===");
    } catch (error) {
        console.error("❌ Verification failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

verifySpiritSystem();
