require('dotenv').config();
const statService = require('../src/services/statService');

const LOG_TAG = '[StatRecoveryTest]';

async function testStatRecovery() {
    console.log(`${LOG_TAG} Starting Stat Recovery Service Tests...`);
    
    // Choose a valid hero ID from DB (e.g. 1)
    const heroId = 1;

    try {
        console.log(`${LOG_TAG} Using Hero ID: ${heroId}`);

        // Test 1: getRecoveryStats
        console.log(`\n${LOG_TAG} Testing getRecoveryStats...`);
        const recovery = await statService.getRecoveryStats(heroId);
        
        console.log('Recovery Stats:', JSON.stringify(recovery, null, 2));

        if (!recovery.hp || !recovery.mana || !recovery.energy) {
            throw new Error('Missing recovery sections (hp, mana, energy)');
        }
        
        if (typeof recovery.hp.regen !== 'number') {
            throw new Error('Invalid HP regen format');
        }

        console.log(`${LOG_TAG} ✅ Recovery stats fetched successfully`);

    } catch (error) {
        console.error(`${LOG_TAG} ❌ Test Failed:`, error);
        process.exit(1);
    }
}

testStatRecovery();
