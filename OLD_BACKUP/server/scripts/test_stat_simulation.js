require('dotenv').config();
const statService = require('../src/services/statService');

const LOG_TAG = '[StatSimulationTest]';

async function testStatSimulation() {
    console.log(`${LOG_TAG} Starting Stat Simulation Service Tests...`);
    
    // 1. Setup Test Hero
    const prisma = statService.db;
    let hero = await prisma.hero.findFirst();
    
    if (!hero) {
        console.error(`${LOG_TAG} No hero found to test.`);
        process.exit(1);
    }
    
    const heroId = hero.id;
    console.log(`${LOG_TAG} Using Hero ID: ${heroId}`);

    try {
        // 2. Test Simulate Stats (Add 10 STR to avoid hitting cap of 100)
        console.log(`\n${LOG_TAG} Testing simulateStats (Adding 10 STR)...`);
        const baseStats = await statService.calculateStatsWithBreakdown(heroId);
        const addedValue = 10;
        const simulated = await statService.simulateStats(heroId, {
            stats: { str: addedValue }
        });
        
        const baseStr = baseStats.attributes?.str || 0;
        const simStr = simulated.attributes?.str || 0;
        
        console.log(`Base STR: ${baseStr}, Simulated STR: ${simStr}`);
        
        if (simStr !== baseStr + addedValue) {
            throw new Error(`Simulation failed: STR did not increase by ${addedValue}`);
        }
        console.log('✅ simulateStats passed');

        // 3. Test Compare Stats (Mock Equipment)
        console.log(`\n${LOG_TAG} Testing compareStats...`);
        // Mock a simple equipment change (empty object for now just to test flow)
        // Or better, let's mock a hypothetical item if we knew the structure.
        // But passing empty equipment array in preview should show difference if current hero has equipment.
        // If hero has no equipment, it might show nothing.
        
        const comparison = await statService.compareStats(heroId, []);
        // If hero has equipment, preview (empty) will have lower stats.
        // If hero has no equipment, should be same.
        
        console.log('Comparison Result Keys:', Object.keys(comparison));
        console.log('Differences:', JSON.stringify(comparison.differences, null, 2));
        
        if (!comparison.current || !comparison.preview || !comparison.differences) {
            throw new Error('Comparison structure invalid');
        }
        console.log('✅ compareStats passed');

    } catch (error) {
        console.error(`${LOG_TAG} Test Failed:`, error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
    
    console.log(`\n${LOG_TAG} All Tests Completed Successfully.`);
    process.exit(0);
}

testStatSimulation();
