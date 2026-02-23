const prisma = require('./src/db');
const bcrypt = require('bcryptjs');

async function seedUsers() {
    console.log('=== AUTO SEED: USERS & HEROES ===\n');

    // Check if users already exist
    const existingUsers = await prisma.user.count();
    if (existingUsers > 0) {
        console.log(`⚠️  Database already has ${existingUsers} users.`);
        console.log('   Skipping seed to avoid duplicates.\n');
        await prisma.$disconnect();
        return;
    }

    // Ensure required data exists
    console.log('🔧 Setting up required references...');
    
    // Ensure a premium tier exists
    let premiumTier = await prisma.premiumTierTemplate.findFirst();
    if (!premiumTier) {
        premiumTier = await prisma.premiumTierTemplate.create({
            data: { id: 1, name: "Free", queueSlots: 0, speedBonus: 0.0, energyRegenMult: 1.0, maxEnergyBonus: 0 }
        });
        console.log('   ✅ Created premium tier: Free');
    }

    // Ensure a region exists (at least id=0)
    let region = await prisma.regionTemplate.findFirst({ where: { id: 0 } });
    if (!region) {
        region = await prisma.regionTemplate.create({
            data: {
                id: 0,
                name: "Starter Village",
                description: "A peaceful starting village",
                zoneType: "TOWN",
                zoneLevel: 1,
                isSafeZone: true
            }
        });
        console.log('   ✅ Created region: Starter Village');
    }

    // Ensure a class exists
    let classTemplate = await prisma.classTemplate.findFirst();
    if (!classTemplate) {
        classTemplate = await prisma.classTemplate.create({
            data: {
                id: 1,
                name: "Novice",
                tier: 1,
                resourceType: "MANA",
                focus: "General"
            }
        });
        console.log('   ✅ Created class: Novice');
    }

    const hashedPassword = await bcrypt.hash('password123', 10);

    // Create test users
    const usersData = [
        { username: 'player1', gold: 1000, silver: 5000 },
        { username: 'player2', gold: 500, silver: 2500 },
        { username: 'testuser', gold: 10000, silver: 50000 },
    ];

    const HERO_NAMES = [
        { name: "Aeliana", race: "HUMAN" },
        { name: "Thornwood", race: "HUMAN" },
        { name: "Morrigan", race: "HUMAN" },
    ];

    for (let i = 0; i < usersData.length; i++) {
        const userData = usersData[i];
        console.log(`\n📦 Creating user: ${userData.username}...`);
        
        const user = await prisma.user.create({
            data: {
                username: userData.username,
                password: hashedPassword,
                gold: userData.gold,
                silver: userData.silver,
                energy: 100,
                maxEnergy: 100,
                currentRegion: 0,
                premiumTierId: premiumTier.id
            }
        });

        // Create a hero
        const heroData = HERO_NAMES[i % HERO_NAMES.length];
        console.log(`   ⚔️  Creating hero: ${heroData.name}...`);

        const hero = await prisma.hero.create({
            data: {
                userId: user.id,
                name: heroData.name,
                race: heroData.race,
                classId: classTemplate.id,
                isMain: true
            }
        });

        // Create formation preset
        const preset = await prisma.formationPreset.create({
            data: {
                userId: user.id,
                name: "Main Party"
            }
        });

        // Add hero to formation
        await prisma.formationSlot.create({
            data: {
                presetId: preset.id,
                heroId: hero.id,
                gridX: 25,
                gridY: 40
            }
        });

        console.log(`   ✅ Created: ${user.username} with hero ${hero.name}`);
    }

    console.log('\n=== SEED COMPLETE ===\n');
    console.log('📋 Login Credentials:');
    console.log('   username: player1, password: password123');
    console.log('   username: player2, password: password123');
    console.log('   username: testuser, password: password123\n');

    await prisma.$disconnect();
}

seedUsers()
    .then(() => {
        console.log('🎉 Auto-seed completed successfully!');
        process.exit(0);
    })
    .catch((error) => {
        console.error('❌ Seed failed:', error);
        process.exit(1);
    });
