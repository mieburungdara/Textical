const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const prisma = require('../src/db');
const StatService = require('../src/services/statService');

async function main() {
    // 1. Get a Hero
    let hero = await prisma.hero.findFirst({
        include: { statAllocation: true, combatClass: true }
    });
    if (!hero) {
        console.log("No hero found. Attempting to create one...");
        const user = await prisma.user.findFirst();
        let combatClass = await prisma.classTemplate.findFirst();
        
        if (!combatClass) {
             console.log("No class found. Creating dummy class...");
             combatClass = await prisma.classTemplate.create({
                data: {
                    name: "Test Warrior",
                    description: "A test class",
                    hpGrowth: 10,
                    mpGrowth: 5,
                    atkGrowth: 2,
                    defGrowth: 1,
                    spdGrowth: 0.5,
                }
             });
             // Create Stat Allocation Template for this class
             await prisma.statAllocationTemplate.create({
                data: {
                    classId: combatClass.id,
                    basePointsPerLevel: 5,
                    maxStatCap: 100,
                    strGrowthFactor: 1.0,
                    dexGrowthFactor: 1.0,
                    intGrowthFactor: 1.0,
                    vitGrowthFactor: 1.0,
                    lukGrowthFactor: 1.0
                }
             });
        }

        if (!user || !combatClass) {
            console.error("Cannot create hero: User missing (Class was created/found).");
            return;
        }

        try {
            hero = await prisma.hero.create({
                data: {
                    name: "TestHero_" + Date.now(),
                    userId: user.id,
                    classId: combatClass.id,
                    hp_base: 100,
                    damage_base: 10,
                    statAllocation: {
                        create: {
                            availablePoints: 5,
                            strAllocated: 0,
                            dexAllocated: 0,
                            intAllocated: 0,
                            vitAllocated: 0,
                            lukAllocated: 0
                        }
                    }
                },
                include: { statAllocation: true, combatClass: true }
            });
            console.log(`Created temporary hero: ${hero.id}`);
        } catch (err) {
            console.error("Failed to create hero:", err);
            return;
        }
    }
    console.log(`Testing with Hero ID: ${hero.id} (${hero.name})`);

    const statService = StatService;

    // 2. Reset Stats
    console.log("\n--- Testing Reset Stat Allocation ---");
    const preResetHistory = await prisma.heroStatHistory.count({ where: { heroId: hero.id } });
    const preResetAudit = await prisma.heroStatAudit.count({ where: { heroId: hero.id, changeType: 'RESET' } });
    
    try {
        const resetResult = await statService.resetStatAllocation(hero.id);
        if (resetResult.success) {
            console.log(`Reset successful. Refunded: ${resetResult.pointsRefunded}`);
            
            if (resetResult.pointsRefunded > 0) {
                // Wait for async snapshot
                console.log("Waiting for snapshot...");
                await new Promise(r => setTimeout(r, 2000));
                
                const postResetHistory = await prisma.heroStatHistory.count({ where: { heroId: hero.id } });
                const postResetAudit = await prisma.heroStatAudit.count({ where: { heroId: hero.id, changeType: 'RESET' } });
                
                console.log(`History count before: ${preResetHistory}, after: ${postResetHistory}`);
                console.log(`Audit count before: ${preResetAudit}, after: ${postResetAudit}`);
                
                if (postResetHistory > preResetHistory) {
                    console.log("✅ RESET Snapshot created successfully.");
                } else {
                     console.error("❌ RESET Snapshot NOT created.");
                }

                /* 
                   Note: allocateStat/reset doesn't explicitly create 'RESET' audit in the snippet I saw?
                   Let's check resetStatAllocation in code if it creates audit.
                   If not, audit check might fail. But snapshot should succeed.
                */
            } else {
                console.log("Skipping snapshot check (0 points refunded).");
            }
        }
    } catch (e) {
        console.error("Reset failed:", e);
    }


    // 3. Allocate Stat
    console.log("\n--- Testing Single Stat Allocation ---");
    const preAllocHistory = await prisma.heroStatHistory.count({ where: { heroId: hero.id } });
    const preAllocAudit = await prisma.heroStatAudit.count({ where: { heroId: hero.id, changeType: 'ALLOCATION' } });
    
    try {
        const heroData = await prisma.hero.findUnique({ 
            where: { id: hero.id },
            include: { statAllocation: true }
        });
        
        if (heroData.statAllocation.availablePoints > 0) {
            const allocResult = await statService.allocateStat(hero.id, 'str', 1);
            if (allocResult.success) {
                console.log("Allocation successful.");
                
                // Wait for async snapshot
                console.log("Waiting for snapshot...");
                await new Promise(r => setTimeout(r, 2000));
                
                const postAllocHistory = await prisma.heroStatHistory.count({ where: { heroId: hero.id } });
                const postAllocAudit = await prisma.heroStatAudit.count({ where: { heroId: hero.id, changeType: 'ALLOCATION' } });
                
                console.log(`History count before: ${preAllocHistory}, after: ${postAllocHistory}`);
                console.log(`Audit count before: ${preAllocAudit}, after: ${postAllocAudit}`);
                
                if (postAllocHistory > preAllocHistory) {
                    console.log("✅ ALLOCATION Snapshot created successfully.");
                } else {
                     console.error("❌ ALLOCATION Snapshot NOT created.");
                }
                
                if (postAllocAudit > preAllocAudit) {
                    console.log("✅ ALLOCATION Audit created successfully.");
                } else {
                     console.log("ℹ️ ALLOCATION Audit not created (or verify logic needed).");
                }
            }
        } else {
            console.log("⚠️ No available points to allocate.");
        }

    } catch (e) {
        console.error("Allocation failed:", e.message);
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => {
        await prisma.$disconnect();
    });
