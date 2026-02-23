/**
 * block_power Verification Test
 * Tests that block_power is calculated from DEF (not STR)
 * 
 * Run with: node server/tests/block_power_verification.test.js
 */

const EnhancedScalingComponent = require('../src/services/stat/EnhancedScalingComponent');

console.log("=".repeat(60));
console.log("🛡️ BLOCK_POWER VERIFICATION TEST");
console.log("=".repeat(60));
console.log("\nTesting block_power calculation from DEF (not STR)...\n");

// Mock applyMod function to capture the applied values
const appliedMods = {};
const applyMod = (statName, value, priority, source) => {
    if (!appliedMods[statName]) {
        appliedMods[statName] = [];
    }
    appliedMods[statName].push({ value, source });
};

// Mock primary attributes (STR, DEX, INT, VIT)
const primary = {
    str: { getValue: () => 50 },  // High STR to verify it's NOT used for block_power
    dex: { getValue: () => 30 },
    int: { getValue: () => 20 },
    vit: { getValue: () => 10 }
};

// Mock stats object with different DEF values to test
const testCases = [
    { name: "Low DEF (10)", defense: 10 },
    { name: "Medium DEF (50)", defense: 50 },
    { name: "High DEF (100)", defense: 100 },
    { name: "Very High DEF (150)", defense: 150 },
    { name: "Max DEF (190)", defense: 190 }
];

console.log("📊 Test Results:");
console.log("-".repeat(60));

let allTestsPassed = true;

testCases.forEach(({ name, defense }) => {
    // Clear previous mods
    Object.keys(appliedMods).forEach(key => delete appliedMods[key]);
    
    // Create stats object with the specific DEF value
    const stats = {
        defense: { 
            getValue: () => defense,
            getRawValue: () => defense,
            getModifiers: () => []
        }
    };
    
    // Run the attribute scaling
    EnhancedScalingComponent.applyAttributeScaling(primary, stats, applyMod);
    
    // Get block_power value
    const blockPowerMods = appliedMods['block_power'] || [];
    const blockPowerFromDEF = blockPowerMods.find(m => m.source === 'Attribute:DEF');
    const blockPowerValue = blockPowerFromDEF ? blockPowerFromDEF.value : 0;
    
    // Calculate expected value
    const expectedBlockPower = defense * 0.005;
    
    // Check if STR was used (should NOT be used anymore)
    const blockPowerFromSTR = blockPowerMods.find(m => m.source === 'Attribute:STR');
    const strWasUsed = !!blockPowerFromSTR;
    
    // Calculate damage reduction
    const damageMultiplier = 1.0 - Math.min(0.95, blockPowerValue);
    const damageReduction = (Math.min(0.95, blockPowerValue) * 100).toFixed(1);
    
    // Test result
    const passed = !strWasUsed && Math.abs(blockPowerValue - expectedBlockPower) < 0.001;
    allTestsPassed = allTestsPassed && passed;
    
    console.log(`\n${passed ? '✅' : '❌'} ${name}`);
    console.log(`   DEF Value: ${defense}`);
    console.log(`   block_power from DEF: ${blockPowerValue.toFixed(4)}`);
    console.log(`   Expected: ${expectedBlockPower.toFixed(4)}`);
    console.log(`   STR was used: ${strWasUsed ? 'YES (BUG!)' : 'No (Correct)'}`);
    console.log(`   Damage Reduction: ${damageReduction}%`);
    console.log(`   Damage received: 100 → ${(100 * damageMultiplier).toFixed(1)}`);
});

console.log("\n" + "=".repeat(60));

// Also test with STR value to show it's NOT affecting block_power anymore
console.log("\n🔍 Verifying STR is NOT used for block_power...");

const highSTRTest = {
    str: { getValue: () => 200 },  // Very high STR
    dex: { getValue: () => 10 },
    int: { getValue: () => 10 },
    vit: { getValue: () => 10 }
};

Object.keys(appliedMods).forEach(key => delete appliedMods[key]);

const statsZeroDEF = {
    defense: { 
        getValue: () => 0,
        getRawValue: () => 0,
        getModifiers: () => []
    }
};

EnhancedScalingComponent.applyAttributeScaling(highSTRTest, statsZeroDEF, applyMod);

const blockPowerMods = appliedMods['block_power'] || [];
const fromSTR = blockPowerMods.find(m => m.source === 'Attribute:STR');
const fromDEF = blockPowerMods.find(m => m.source === 'Attribute:DEF');

console.log(`\n   With STR=200, DEF=0:`);
console.log(`   - block_power from STR: ${fromSTR ? fromSTR.value : 0}`);
console.log(`   - block_power from DEF: ${fromDEF ? fromDEF.value : 0}`);

if (!fromSTR || fromSTR.value === 0) {
    console.log(`   ✅ STR is NOT used for block_power (Correct!)`);
} else {
    console.log(`   ❌ STR is still being used for block_power (BUG!)`);
    allTestsPassed = false;
}

console.log("\n" + "=".repeat(60));

if (allTestsPassed) {
    console.log("\n✅ ALL TESTS PASSED!");
    console.log("   block_power is correctly calculated from DEF, not STR.");
} else {
    console.log("\n❌ TESTS FAILED!");
    console.log("   There may be an issue with the implementation.");
}

console.log("\n📝 Formula Summary:");
console.log("   block_power = DEF × 0.005 (0.5% per DEF point)");
console.log("   Max block_power = 0.95 (95% damage reduction)");
console.log("=".repeat(60));

process.exit(allTestsPassed ? 0 : 1);
