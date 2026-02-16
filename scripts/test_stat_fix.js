const StatCalculationEngine = require('../server/src/services/stat/StatCalculationEngine');

async function test() {
    console.log('--- Testing StatCalculationEngine Fix ---');

    // 1. Mock Hero Data with specific values for the problematic stats
    // These values should be different from the defaults in StatCalculationEngine
    const mockHeroData = {
        unitLevel: 10,
        classLevel: 5,
        // Problematic fields (using DB schema names)
        attack_speed: 2.5,          // Default is 1.0
        move_speed: 150,            // Default is 100? or 5? Engine has move_speed_base || 5. Schema has default 100.
        armor_penetration: 20,      // Default is 0
        spell_vamp: 0.15,           // Default is 0
        
        // Other required fields to avoid crashes
        hp_base: 100,
        damage_base: 10,
        str: 10, dex: 10, int: 10, vit: 10, luk: 10,
        combatClass: { name: 'TestClass' },
        equipment: [],
        skills: [],
        buffs: [],
        user: { guild: null, factionId: null }
    };

    // 2. Instantiate Engine
    // We mock the DB since we are passing mockHeroData
    const engine = new StatCalculationEngine({ cacheEnabled: false });
    engine.db = { hero: { findUnique: () => mockHeroData } }; // Mock DB just in case

    // 3. Calculate Stats
    // We pass mockHeroData in context to bypass fetchHeroData
    const stats = await engine.calculateHeroStats(1, { mockHeroData });

    // 4. Verification
    const check = (name, actual, expected) => {
        const passed = Math.abs(actual - expected) < 0.001;
        console.log(`${passed ? '✅' : '❌'} ${name}: Expected ${expected}, Got ${actual}`);
        if (!passed) console.warn(`   -> Fix required for ${name}`);
    };

    console.log('\nResults:');
    check('Attack Speed', stats.attack_speed, 2.5);
    check('Move Speed', stats.move_speed, 150);
    check('Armor Penetration', stats.armor_penetration, 20);
    check('Spell Vamp', stats.spell_vamp, 0.15);
}

test().catch(console.error);
