const prisma = require('../src/db');
const monsterData = require('../src/data/monsters.json');

async function main() {
    console.log('[Seed] Starting to seed monsters...');
    
    // Get last monster ID
    const lastMonster = await prisma.monsterTemplate.findFirst({
        orderBy: { id: 'desc' }
    });
    let currentId = (lastMonster ? lastMonster.id : 0) + 1;
    
    const created = [];
    
    for (let key in monsterData) {
        const m = monsterData[key];
        
        // Skip if already exists
        const existing = await prisma.monsterTemplate.findFirst({
            where: { name: m.name }
        });
        
        if (!existing) {
            const monster = await prisma.monsterTemplate.create({
                data: {
                    id: currentId,
                    name: m.name,
                    hp_base: m.hp_base,
                    damage_base: m.damage_base,
                    defense_base: m.defense_base || 0,
                    speed_base: m.speed_base || 5,
                    range_base: m.range_base || 1,
                    xpReward: m.exp_reward || 0,
                    iconPath: m.image_path || '',
                    categoryId: 1 // Default category
                }
            });
            created.push(monster);
            console.log(`[Seed] Created monster: ${monster.name} (ID: ${currentId})`);
            currentId++;
        } else {
            console.log(`[Seed] Monster already exists: ${m.name} (ID: ${existing.id})`);
        }
    }
    
    console.log(`[Seed] Seed complete! Created ${created.length} new monsters.`);
}

main()
    .catch((e) => {
        console.error('[Seed] Error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
