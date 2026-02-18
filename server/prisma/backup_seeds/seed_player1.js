const prisma = require('../src/db');

async function main() {
    console.log('✦ Seeding Player 1 and Novice Hero...');

    // 1. Create/Upsert Player 1
    const user = await prisma.user.upsert({
        where: { username: 'player1' },
        update: {},
        create: {
            username: 'player1',
            password: 'password123', // Simple for dev
            silver: 1000,
            gold: 10,
            energy: 100,
            maxEnergy: 100,
            currentRegion: 1, // Royal City
            premiumTierId: 0
        }
    });

    console.log(`  ✅ User 'player1' (ID: ${user.id}) prepared.`);

    // 2. Create/Upsert Novice Hero
    const heroName = 'Novice Hero 1';
    const existingHero = await prisma.hero.findFirst({
        where: { userId: user.id, name: heroName }
    });

    if (!existingHero) {
        const hero = await prisma.hero.create({
            data: {
                userId: user.id,
                name: heroName,
                classId: 1001, // Novice Class
                level: 1,
                xp: 0,
                unitLevel: 1,
                unitXp: 0,
                classLevel: 1,
                classXp: 0,
                hp_base: 500, // Balanced starting HP
                damage_base: 45, // Balanced starting Damage
                str: 10,
                dex: 10,
                int: 10,
                vit: 10,
                luk: 5,
                vitality: 100,
                isMain: true,
                generation: 1
            }
        });
        console.log(`  ✅ Hero '${hero.name}' (ID: ${hero.id}) created for player1.`);
        
        // Setup initial stat history for the hero
        await prisma.heroStatHistory.createMany({
            data: [
                { heroId: hero.id, statKey: 'HP', baseValue: 500, bonusFromItems: 0, bonusFromBuffs: 0, allocatedPoints: 0 },
                { heroId: hero.id, statKey: 'ATTACK', baseValue: 45, bonusFromItems: 0, bonusFromBuffs: 0, allocatedPoints: 0 },
                { heroId: hero.id, statKey: 'DEFENSE', baseValue: 10, bonusFromItems: 0, bonusFromBuffs: 0, allocatedPoints: 0 },
                { heroId: hero.id, statKey: 'SPEED', baseValue: 5, bonusFromItems: 0, bonusFromBuffs: 0, allocatedPoints: 0 }
            ]
        });
        console.log(`  ✅ Hero stat history initialized.`);
    } else {
        console.log(`  ℹ️ Hero '${heroName}' already exists for player1.`);
    }

    console.log('✦ Player 1 Seeding Complete!');
}

main()
    .catch((e) => {
        console.error('❌ Seed Error:', JSON.stringify(e, null, 2));
        if (e.code) console.error('Error Code:', e.code);
        if (e.meta) console.error('Error Meta:', e.meta);
        process.exit(1);
    })

    .finally(async () => {
        await prisma.$disconnect();
    });
