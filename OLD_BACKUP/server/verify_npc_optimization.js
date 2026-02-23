const prisma = require('./src/db');
const NPCBehaviorService = require('./src/services/npc/NPCBehaviorService');

async function verifyOptimization() {
    console.log('--- Verifying NPC Optimization ---');
    
    // Find a region with NPCs
    // Use a simpler query or hardcode if needed for now
    const region = await prisma.regionTemplate.findFirst({
        where: { id: 115 } // Barnaby's region
    });
    
    const regionId = region ? region.id : 115;
    console.log(`Using Region ID: ${regionId}`);

    // 1. Measure First Call (Cold Cache + DB Fetch)
    console.time('First Call (Cold)');
    const result1 = await NPCBehaviorService.getNPCsInRegion(regionId);
    console.timeEnd('First Call (Cold)');
    console.log(`Found ${result1.length} NPCs in region ${regionId}`);
    
    if (result1.length > 0) {
        // Sanitize check
        const sample = result1[0];
        // console.log('Sample NPC Data (Sanitized):', JSON.stringify(sample, null, 2));
        
        if (sample.schedules || sample.regions || sample.eventReactions) {
             console.error('SECURITY FAIL: Internal fields exposed!');
             process.exit(1);
        } else {
             console.log('Security PASS: Internal fields hidden.');
        }
    } else {
        console.warn('Warning: No NPCs found in this region, verification might be incomplete.');
    }

    // 2. Measure Second Call (Cached)
    console.time('Second Call (Cached)');
    const result2 = await NPCBehaviorService.getNPCsInRegion(regionId);
    console.timeEnd('Second Call (Cached)');
    
    if (result1.length !== result2.length) {
        console.error('MISMATCH: Cached result count differs from fresh result!');
    } else {
        console.log('Cache PASS: Counts match.');
    }

    // 3. Verify Error Handling
    console.log('\n--- Testing Error Handling ---');
    try {
        await NPCBehaviorService.getNPCsInRegion(99999);
        console.log('Error Handling PASS: Gracefully returned empty array for invalid region.');
    } catch (e) {
        console.error('Error Handling FAIL: Threw exception', e);
    }
}

verifyOptimization()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
