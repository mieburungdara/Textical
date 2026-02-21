/**
 * block_power Archetype Test
 * Tests that block_power is calculated based on class archetype
 * 
 * Run with: node server/tests/block_power_archetype.test.js
 */

const EnhancedScalingComponent = require('../src/services/stat/EnhancedScalingComponent');

console.log("=".repeat(60));
console.log("🛡️ BLOCK_POWER ARCHETYPE TEST");
console.log("=".repeat(60));
console.log("\nTesting block_power based on class archetype...\n");

// Mock applyMod function to capture the applied values
const appliedMods = {};
const applyMod = (statName, value, priority, source) => {
    if (!appliedMods[statName]) {
        appliedMods[statName] = [];
    }
    appliedMods[statName].push({ value, source });
};

// Test cases for all archetypes
const testCases = [
    // Tank - 100% (level × 0.01)
    { job: 'WARRIOR', level: 10, archetype: 'TANK', expectedMultiplier: 1.0, expected: 0.10 },
    { job: 'KNIGHT', level: 10, archetype: 'TANK', expectedMultiplier: 1.0, expected: 0.10 },
    { job: 'PALADIN', level: 10, archetype: 'TANK', expectedMultiplier: 1.0, expected: 0.10 },
    { job: 'GUARDIAN', level: 10, archetype: 'TANK', expectedMultiplier: 1.0, expected: 0.10 },
    
    // Melee DPS - 50% (level × 0.005)
    { job: 'BERSERKER', level: 10, archetype: 'MELEE_DPS', expectedMultiplier: 0.5, expected: 0.05 },
    { job: 'ROGUE', level: 10, archetype: 'MELEE_DPS', expectedMultiplier: 0.5, expected: 0.05 },
    { job: 'ASSASSIN', level: 10, archetype: 'MELEE_DPS', expectedMultiplier: 0.5, expected: 0.05 },
    
    // Ranged DPS - 25% (level × 0.0025)
    { job: 'RANGER', level: 10, archetype: 'RANGED_DPS', expectedMultiplier: 0.25, expected: 0.025 },
    { job: 'ARCHER', level: 10, archetype: 'RANGED_DPS', expectedMultiplier: 0.25, expected: 0.025 },
    { job: 'HUNTER', level: 10, archetype: 'RANGED_DPS', expectedMultiplier: 0.25, expected: 0.025 },
    
    // Caster - 10% (level × 0.001)
    { job: 'MAGE', level: 10, archetype: 'CASTER', expectedMultiplier: 0.1, expected: 0.01 },
    { job: 'WIZARD', level: 10, archetype: 'CASTER', expectedMultiplier: 0.1, expected: 0.01 },
    { job: 'SORCERER', level: 10, archetype: 'CASTER', expectedMultiplier: 0.1, expected: 0.01 },
    
    // Healer - 25% (level × 0.0025)
    { job: 'CLERIC', level: 10, archetype: 'HEALER', expectedMultiplier: 0.25, expected: 0.025 },
    { job: 'PRIEST', level: 10, archetype: 'HEALER', expectedMultiplier: 0.25, expected: 0.025 },
    { job: 'DRUID', level: 10, archetype: 'HEALER', expectedMultiplier: 0.25, expected: 0.025 },
    
    // Unknown class - should get 0
    { job: 'UNKNOWN', level: 10, archetype: null, expectedMultiplier: 0, expected: 0 }
];

let allTestsPassed = true;

console.log("📊 Test Results:");
console.log("-".repeat(60));

testCases.forEach(({ job, level, archetype, expected }) => {
    Object.keys(appliedMods).forEach(key => delete appliedMods[key]);
    
    const heroData = {
        job: { name: job },
        jobLevel: level
    };
    
    EnhancedScalingComponent.applyJobScaling(heroData, {}, applyMod);
    
    const blockPowerMods = appliedMods['block_power'] || [];
    // Get the job-based block_power (filter out blacksmith bonus)
    const jobBonus = blockPowerMods.find(m => m.source.startsWith('Job:') && m.source.includes(archetype || job));
    const blockPowerValue = jobBonus ? jobBonus.value : 0;
    
    const passed = Math.abs(blockPowerValue - expected) < 0.001;
    allTestsPassed = allTestsPassed && passed;
    
    const status = passed ? '✅' : '❌';
    console.log(`\n${status} ${job} (${archetype || 'Unknown'}) Level ${level}`);
    console.log(`   block_power: ${blockPowerValue.toFixed(4)}`);
    console.log(`   Expected: ${expected.toFixed(4)}`);
    console.log(`   Damage Reduction: ${(blockPowerValue * 100).toFixed(1)}%`);
});

console.log("\n" + "=".repeat(60));
console.log("\n📊 Archetype Multiplier Summary:");
console.log("-".repeat(60));
console.log("   Tank       (WARRIOR, KNIGHT, PALADIN, GUARDIAN): 100% (level × 0.01)");
console.log("   Melee DPS  (BERSERKER, ROGUE, ASSASSIN):          50% (level × 0.005)");
console.log("   Ranged DPS (RANGER, ARCHER, HUNTER):               25% (level × 0.0025)");
console.log("   Caster     (MAGE, WIZARD, SORCERER):               10% (level × 0.001)");
console.log("   Healer    (CLERIC, PRIEST, DRUID):                25% (level × 0.0025)");
console.log("=".repeat(60));

if (allTestsPassed) {
    console.log("\n✅ ALL TESTS PASSED!");
    console.log("   block_power is correctly calculated based on class archetype.");
} else {
    console.log("\n❌ TESTS FAILED!");
    console.log("   There may be an issue with the implementation.");
}

process.exit(allTestsPassed ? 0 : 1);
