require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const statService = require('../src/services/statService');

// Mock console.log to keep output clean, or just use it.
const LOG_TAG = '[StatQueryTest]';

async function testStatQueries() {
    console.log(`${LOG_TAG} Starting Stat Query Service Tests...`);
    
    // 1. Setup Test Hero
    // Use statService's db instance
    const prisma = statService.db;
    let hero = await prisma.hero.findFirst();
    
    if (!hero) {
        console.error(`${LOG_TAG} No hero found to test.`);
        process.exit(1);
    }
    
    const heroId = hero.id;
    console.log(`${LOG_TAG} Using Hero ID: ${heroId}`);

    try {
        // 2. Test Get Elemental Stats
        console.log(`\n${LOG_TAG} Testing getElementalStats...`);
        const elemental = await statService.getElementalStats(heroId);
        console.log('Elemental Stats:', JSON.stringify(elemental, null, 2));
        
        if (!elemental.resistances || !elemental.bonusDamage) {
            throw new Error('Elemental stats structure invalid');
        }
        console.log('✅ getElementalStats passed');

        // 3. Test Get Set Bonuses
        console.log(`\n${LOG_TAG} Testing getSetBonuses...`);
        const sets = await statService.getSetBonuses(heroId);
        console.log('Set Bonuses:', JSON.stringify(sets, null, 2));
        
        if (!Array.isArray(sets.sets)) {
            throw new Error('Set bonuses structure invalid');
        }
        console.log('✅ getSetBonuses passed');

        // 4. Test Get Equipment Stats
        console.log(`\n${LOG_TAG} Testing getEquipmentStats...`);
        const equipment = await statService.getEquipmentStats(heroId);
        console.log('Equipment Stats:', JSON.stringify(equipment, null, 2));
        
        if (!Array.isArray(equipment.equipment)) {
             throw new Error('Equipment stats structure invalid');
        }
        console.log('✅ getEquipmentStats passed');

    } catch (error) {
        console.error(`${LOG_TAG} Test Failed:`, error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
    
    console.log(`\n${LOG_TAG} All Tests Completed Successfully.`);
    process.exit(0);
}

testStatQueries();
