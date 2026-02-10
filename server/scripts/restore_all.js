const { execSync } = require('child_process');
const path = require('path');

const scripts = [
    'src/scripts/seed_region_types.js',
    'src/scripts/seed.js', // Regions
    'src/scripts/seed_minerals.js',
    'src/scripts/seed_tools.js',
    'src/scripts/seed_weapons.js',
    'src/scripts/seed_armors.js',
    'src/scripts/seed_recipes.js',
    'src/scripts/seed_npcs.js',
    'src/scripts/seed_expanded_npcs.js',
    'src/scripts/seed_classes.js',
    'src/scripts/seed_world_events.js',
    'src/scripts/seed_skills.js',
    'scripts/restore_player1.js'
];

console.log("🚀 STARTING FULL GAME DATA RESTORATION (FIXED)...");

scripts.forEach(script => {
    const scriptPath = path.join(__dirname, '..', script);
    console.log(`\n[RUNNING] ${script}...`);
    try {
        execSync(`node ${scriptPath}`, { stdio: 'inherit' });
    } catch (error) {
        console.error(`❌ FAILED: ${script}`);
    }
});

console.log("\n✨ FULL RESTORATION COMPLETE! Cities, NPCs, Items, and Lore should be back.");
