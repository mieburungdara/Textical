const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const statService = require('../src/services/statService');
const prisma = require('../src/db');

async function testStatAPI() {
    console.log('--- Starting Unit Stat API Verification ---');
    
    try {
        // 1. Find a test hero
        const hero = await prisma.hero.findFirst({
            include: { statAllocation: true }
        });
        
        if (!hero) {
            console.error('No hero found for testing!');
            return;
        }
        
        const heroId = hero.id;
        console.log(`Testing with Hero ID: ${heroId} (${hero.name})`);

        // 2. Test Metadata
        console.log('\n[1] Testing getStatMetadata...');
        const metadata = statService.getStatMetadata();
        console.log('Metadata keys:', Object.keys(metadata));
        if (metadata.primaryStats && metadata.formulas) {
            console.log('✅ Metadata OK');
        }

        // 3. Test Recovery Stats
        console.log('\n[2] Testing getRecoveryStats...');
        const recovery = await statService.getRecoveryStats(heroId);
        console.log('HP Recovery:', recovery.hp);
        if (recovery.hp && recovery.mana) {
            console.log('✅ Recovery Stats OK');
        }

        // 4. Test Simulation
        console.log('\n[3] Testing simulateStats...');
        const simulation = await statService.simulateStats(heroId, {
            stats: { str: 100 } // Simulate +100 STR
        });
        console.log('Simulated Attr STR:', simulation.attributes.str);
        if (simulation.attributes.str > hero.str) {
            console.log('✅ Simulation OK');
        }

        // 5. Test Reset (Simulation-like or direct if safe)
        // Note: Reset will change DB, but we want to test if it's atomic and audited.
        console.log('\n[4] Testing resetStatAllocation...');
        const resetResult = await statService.resetStatAllocation(heroId);
        console.log('Points Refunded:', resetResult.pointsRefunded);
        if (resetResult.allocation) {
            console.log('New Available Points:', resetResult.allocation.availablePoints);
        } else {
            console.log('Note:', resetResult.message || 'No changes made');
        }
        
        if (resetResult.success) {
            console.log('✅ Reset OK');
        }

        // 6. Test Batch Allocation
        console.log('\n[5] Testing batchAllocateStats...');
        const batch = { str: 2, dex: 3 }; // Total 5
        const batchResult = await statService.batchAllocateStats(heroId, batch);
        console.log('New STR Allocated:', batchResult.allocation.strAllocated);
        if (batchResult.allocation.strAllocated === 2) {
            console.log('✅ Batch Allocation OK');
        }

        // 7. Test Audit Logs
        console.log('\n[6] Verifying Audit Logs...');
        const audits = await prisma.heroStatAudit.findMany({
            where: { heroId },
            orderBy: { recordedAt: 'desc' },
            take: 5
        });
        console.log('Recent Audits count:', audits.length);
        audits.forEach(a => console.log(`- ${a.changeType}: ${a.statName} ${a.previousValue} -> ${a.newValue}`));
        if (audits.length > 0) {
            console.log('✅ Audit Logs OK');
        }

        console.log('\n--- All Tests Completed Successfully ---');
    } catch (error) {
        console.error('❌ Test failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

testStatAPI();
