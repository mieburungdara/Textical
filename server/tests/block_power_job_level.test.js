/**
 * block_power Verification Test
 * Tests that block_power is calculated from job level for tank classes
 * 
 * Run with: node server/tests/block_power_job_level.test.js
 */

const EnhancedScalingComponent = require('../src/services/stat/EnhancedScalingComponent');

console.log("=".repeat(60));
console.log("🛡️ BLOCK_POWER JOB LEVEL TEST");
console.log("=".repeat(60));
console.log("\nTesting block_power calculation from job level for tank classes...\n");

// Mock applyMod function to capture the applied values
const appliedMods = {};
const applyMod = (statName, value, priority, source) => {
    if (!appliedMods[statName]) {
        appliedMods[statName] = [];
    }
    appliedMods[statName].push({ value, source });
};

// Test cases for tank classes
const tankTestCases = [
    { job: 'WARRIOR', level: 5, expected: 0.05 },
    { job: 'WARRIOR', level: 10, expected: 0.10 },
    { job: 'KNIGHT', level: 10, expected: 0.10 },
    { job: 'PALADIN', level: 15, expected: 0.15 },
    { job: 'GUARDIAN', level: 20, expected: 0.20 },
    { job: 'BERSERKER', level: 10, expected: 0.10 }
];

// Test cases for non-tank classes (should NOT get block_power)
const nonTankTestCases = [
    { job: 'MAGE', level: 10 },
    { job: 'ROGUE', level: 10 },
    { job: 'CLERIC', level: 10 },
    { job: 'RANGER', level: 10 }
];

let allTestsPassed = true;

console.log("📊 Tank Classes Test:");
console.log("-".repeat(60));

tankTestCases.forEach(({ job, level, expected }) => {
    Object.keys(appliedMods).forEach(key => delete appliedMods[key]);
    
    const heroData = {
        job: { name: job },
        jobLevel: level
    };
    
    EnhancedScalingComponent.applyJobScaling(heroData, {}, applyMod);
    
    const blockPowerMods = appliedMods['block_power'] || [];
    const jobBonus = blockPowerMods.find(m => m.source.includes(job));
    const blockPowerValue = jobBonus ? jobBonus.value : 0;
    
    const passed = Math.abs(blockPowerValue - expected) < 0.001;
    allTestsPassed = allTestsPassed && passed;
    
    console.log(`\n${passed ? '✅' : '❌'} ${job} Level ${level}`);
    console.log(`   block_power: ${blockPowerValue.toFixed(4)}`);
    console.log(`   Expected: ${expected.toFixed(4)}`);
    console.log(`   Damage Reduction: ${(blockPowerValue * 100).toFixed(1)}%`);
});

console.log("\n" + "=".repeat(60));
console.log("\n📊 Non-Tank Classes Test:");
console.log("-".repeat(60));

nonTankTestCases.forEach(({ job, level }) => {
    Object.keys(appliedMods).forEach(key => delete appliedMods[key]);
    
    const heroData = {
        job: { name: job },
        jobLevel: level
    };
    
    EnhancedScalingComponent.applyJobScaling(heroData, {}, applyMod);
    
    const blockPowerMods = appliedMods['block_power'] || [];
    const blockPowerValue = blockPowerMods.reduce((sum, m) => sum + m.value, 0);
    
    const passed = blockPowerValue === 0;
    allTestsPassed = allTestsPassed && passed;
    
    console.log(`\n${passed ? '✅' : '❌'} ${job} Level ${level}`);
    console.log(`   block_power: ${blockPowerValue.toFixed(4)} (should be 0)`);
});

console.log("\n" + "=".repeat(60));
console.log("\n📊 Formula Summary:");
console.log("   block_power = jobLevel × 0.01 (1% per job level)");
console.log("   Applies to: WARRIOR, KNIGHT, PALADIN, GUARDIAN, BERSERKER");
console.log("   Max cap: 0.95 (95% damage reduction)");
console.log("=".repeat(60));

if (allTestsPassed) {
    console.log("\n✅ ALL TESTS PASSED!");
    console.log("   block_power is correctly calculated from job level for tank classes.");
} else {
    console.log("\n❌ TESTS FAILED!");
    console.log("   There may be an issue with the implementation.");
}

process.exit(allTestsPassed ? 0 : 1);
