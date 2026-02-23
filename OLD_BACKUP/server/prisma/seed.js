const traitSeeder = require('./seed_traits');
const seedMaterials = require('./seed_materials');
const seedWeapons = require('./seed_weapons');
const seedPotions = require('./seed_potions');
const seedRegions = require('./seed_regions');
const seedUsers = require('./seed_users');

async function main() {
    console.log('🚀 Starting Master Seed...');
    
    try {
        await traitSeeder();
        console.log('--- Trait Seeding Done ---');
        
        await seedMaterials();
        console.log('--- Material Seeding Done ---');

        await seedRegions();
        console.log('--- Region Seeding Done ---');

        await seedUsers();
        console.log('--- User Seeding Done ---');
        
        console.log('🏁 Master Seed Completed Successfully.');
    } catch (error) {
        console.error('❌ Master Seed Failed:', error);
        process.exit(1);
    }
}

main();
