/**
 * Monster Import Script
 * Imports monsters from client JSON to server database
 */

const fs = require('fs');
const path = require('path');
const prisma = require('../src/db');

const CLIENT_MONSTERS_PATH = path.join(__dirname, '../../client/assets/data/monsters.json');

async function importMonsters() {
    console.log('🔄 Starting monster import...');
    
    // Read client monsters JSON
    if (!fs.existsSync(CLIENT_MONSTERS_PATH)) {
        console.error('❌ Client monsters.json not found:', CLIENT_MONSTERS_PATH);
        return;
    }
    
    const content = fs.readFileSync(CLIENT_MONSTERS_PATH, 'utf8');
    const monsters = JSON.parse(content);
    
    console.log(`📦 Found ${Object.keys(monsters).length} monsters in client JSON`);
    
    // Ensure a default category exists
    let defaultCategory = await prisma.monsterCategory.findUnique({ where: { id: 1 } });
    if (!defaultCategory) {
        console.log('📦 Creating default MonsterCategory...');
        await prisma.monsterCategory.create({
            data: { id: 1, name: 'General' }
        });
        console.log('✅ Created default category (ID: 1)');
    } else {
        console.log('✅ Default category exists (ID: 1)');
    }
    
    let imported = 0;
    let skipped = 0;
    
    for (const [id, data] of Object.entries(monsters)) {
        const monsterId = parseInt(id);
        
        try {
            // Check if monster already exists
            const existing = await prisma.monsterTemplate.findUnique({
                where: { id: monsterId }
            });
            
            if (existing) {
                console.log(`⏭️  Monster ${id} already exists, skipping`);
                skipped++;
                continue;
            }
            
            // Create monster template
            await prisma.monsterTemplate.create({
                data: {
                    id: monsterId,
                    version: 1,
                    name: data.name || 'Unknown',
                    description: data.description || '',
                    hp_base: 10,
                    damage_base: 2,
                    // Default values for required fields
                    level: 1,
                    xpReward: 10,
                    goldReward: 0,
                    // Visual defaults
                    iconPath: data.image || '',
                    shortDesc: data.description?.substring(0, 50) || '',
                    // Combat defaults
                    race: 'BEAST',
                    rank: 'COMMON',
                    size: 'MEDIUM',
                    movementType: 'WALK',
                    // Stats defaults
                    defense_base: 0,
                    speed_base: 5,
                    range_base: 1,
                    accuracy_base: 100,
                    dodge_rate: 0.05,
                    crit_chance: 0.05,
                    crit_damage: 1.5,
                    block_chance: 0,
                    block_power_base: 0.5,
                    initiative_base: 0,
                    lifesteal_base: 0,
                    cooldown_reduction: 0,
                    move_speed: 100,
                    attack_speed: 1.0,
                    // Elemental defaults
                    res_fire: 1.0,
                    res_water: 1.0,
                    res_earth: 1.0,
                    res_wind: 1.0,
                    res_light: 1.0,
                    res_dark: 1.0,
                    // Growth defaults
                    hp_growth: 0,
                    damage_growth: 0,
                    defense_growth: 0,
                    // AI defaults
                    aiScript: 'SimpleAI',
                    aiConfig: '{}',
                    attack_element: 'PHYSICAL',
                    threat_modifier: 1.0,
                    preferred_target: 'RANDOM',
                    behaviorTree: 'SimpleAI',
                    // Required foreign key
                    categoryId: 1
                }
            });
            
            console.log(`✅ Imported monster ${id}: ${data.name}`);
            imported++;
            
        } catch (error) {
            console.error(`❌ Error importing monster ${id}:`, error.message);
        }
    }
    
    console.log(`\n📊 Import complete:`);
    console.log(`   Imported: ${imported}`);
    console.log(`   Skipped: ${skipped}`);
    console.log(`   Total: ${imported + skipped}`);
}

importMonsters()
    .then(() => {
        console.log('\n✨ Done!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
