require('dotenv').config();
const statService = require('../src/services/statService');
const prisma = require('../src/db');

async function testAllocation() {
    console.log('--- Testing Stat Allocation Service ---');
    
    // Find or create test hero
    let hero = await prisma.hero.findFirst({ where: { name: 'TestHero_Allocation' } });
    if (!hero) {
        hero = await prisma.hero.create({
            data: {
                name: 'TestHero_Allocation',
                classId: 1, // Warrior
                userId: 1,
                unitLevel: 10, // Level 10 -> 50 points available
                str: 10, dex: 10, int: 10, vit: 10, luk: 5
            }
        });
        // Initialize allocation
        await prisma.heroStatAllocation.create({
            data: {
                heroId: hero.id,
                availablePoints: 50,
                totalSpent: 0
            }
        });
        console.log(`Created TestHero_Allocation (ID: ${hero.id})`);
    } else {
        console.log(`Using existing TestHero_Allocation (ID: ${hero.id})`);
        
        // Reset to clean state
        await statService.resetStatAllocation(hero.id);
        // Ensure 50 points
        await prisma.heroStatAllocation.update({
            where: { heroId: hero.id },
            data: { availablePoints: 50, totalSpent: 0, strAllocated: 0, dexAllocated: 0 }
        });
    }

    try {
        // 1. Get Capabilities
        console.log('\n--- 1. Get Capabilities ---');
        const capabilities = await statService.getStatCapabilities(hero.id);
        console.log('Available Points:', capabilities.availablePoints);
        console.log('STR Cap:', capabilities.attributes.str.cap);
        
        if (capabilities.availablePoints !== 50) console.error('❌ Expected 50 available points');
        else console.log('✅ Available Points correct');

        // 2. Batch Allocation (Valid)
        console.log('\n--- 2. Batch Allocation (Valid) ---');
        const batchResult = await statService.batchAllocateStats(hero.id, { str: 10, dex: 5 });
        console.log('Allocated:', batchResult.allocation);
        if (batchResult.allocation.strAllocated === 10 && batchResult.allocation.dexAllocated === 5) {
            console.log('✅ Batch allocation successful');
        } else {
            console.error('❌ Batch allocation mismatch');
        }

        // 3. Exceed Cap (Invalid)
        console.log('\n--- 3. Exceed Cap (Invalid) ---');
        // Hack: set cap via limit mock if possible? No, reliance on class template. 
        // Warrior STR cap is high. Let's try allocating 1000 points (exceeds available).
        try {
            await statService.allocateStat(hero.id, 'str', 100);
            console.error('❌ Should have thrown Insufficient Points error');
        } catch (e) {
            console.log('✅ Correctly threw error:', e.message);
        }

        // 4. Reset
        console.log('\n--- 4. Reset ---');
        const resetResult = await statService.resetStatAllocation(hero.id);
        console.log('Refunded:', resetResult.pointsRefunded);
        
        if (resetResult.pointsRefunded === 15) { // 10 + 5
            console.log('✅ Reset successful, refunded correct amount');
        } else {
            console.error(`❌ Reset failed. Expected 15 refund, got ${resetResult.pointsRefunded}`);
        }

    } catch (error) {
        console.error('Test Failed:', error);
    } finally {
        await prisma.$disconnect();
        console.log('--- Test Completed ---');
        process.exit(0);
    }
}

testAllocation();
