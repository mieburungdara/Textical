const prisma = require('../src/db');
const bcrypt = require('bcryptjs');

async function seedUsers() {
    console.log('=== SEEDING USERS & HEROES ===\n');

    // Check if users already exist
    const existingUsers = await prisma.user.count();
    console.log('Existing users:', existingUsers);
    
    if (existingUsers > 0) {
        console.log(`⚠️  Database already has ${existingUsers} users. Skipping user seed.\n`);
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
    } else {
        console.log('   ✅ Premium tier already exists');
    }

    // Ensure CITADEL regions exist (based on MAPS.json)
    const citadelPositions = [
        { id: 100, name: "Northern Citadel", gridX: 5, gridY: 5, description: "A fortified citadel in the north" },
        { id: 101, name: "Eastern Citadel", gridX: 29, gridY: 5, description: "A fortified citadel in the east" },
        { id: 102, name: "Southern Citadel", gridX: 5, gridY: 29, description: "A fortified citadel in the south" },
        { id: 103, name: "Western Citadel", gridX: 29, gridY: 29, description: "A fortified citadel in the west" }
    ];

    for (const citadel of citadelPositions) {
        await prisma.regionTemplate.upsert({
            where: { id: citadel.id },
            update: {},
            create: {
                id: citadel.id,
                name: citadel.name,
                description: citadel.description,
                zoneType: "CITADEL",
                zoneLevel: 10,
                isSafeZone: true,
                gridX: citadel.gridX,
                gridY: citadel.gridY
            }
        });
    }
    console.log('   ✅ Created 4 CITADEL regions');

    // Delete old region 0 if exists (Starter Village)
    await prisma.regionTemplate.deleteMany({ where: { id: 0 } }).catch(() => {});

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
    } else {
        console.log('   ✅ Class template already exists');
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
                currentRegion: 180, // Start at Northwind Citadel (ID 180)
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

    process.stdout.write('\n📋 Login Credentials:\n');
    process.stdout.write('   username: player1, password: password123\n');
    process.stdout.write('   username: player2, password: password123\n');
    process.stdout.write('   username: testuser, password: password123\n\n');
}

seedUsers()
    .then(async () => {
        console.log('Seed completed successfully!');
        await prisma.$disconnect();
    })
    .catch(async (e) => {
        console.error('Seed failed:', e);
        await prisma.$disconnect();
        process.exit(1);
    });
