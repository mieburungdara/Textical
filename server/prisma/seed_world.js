const prisma = require('../src/db');

async function main() {
    console.log("=== SEEDING WORLD BASICS (REGIONS & MONSTERS) ===");

    try {
        // 0. Seed WorldState
        await prisma.worldState.upsert({
            where: { id: 1 },
            update: {},
            create: { id: 1, currentHour: 12, weatherType: "CLEAR", moonPhase: "FULL" }
        });

        // 0.1 Seed PremiumTier
        await prisma.premiumTierTemplate.upsert({
            where: { id: 0 },
            update: {},
            create: { id: 0, name: "FREE" }
        });

        // 0.2 Seed ItemTemplate
        await prisma.itemTemplate.upsert({
            where: { id: 6001 },
            update: { name: "Glowstone Dust", category: "MATERIAL", rarity: "COMMON" },
            create: { id: 6001, name: "Glowstone Dust", category: "MATERIAL", rarity: "COMMON", description: "Faintly glowing dust." }
        });

        // 1. Seed Region
        await prisma.regionTemplate.upsert({
            where: { id: 1 },
            update: {
                name: "Oakshade Village",
                description: "A peaceful starting village.",
                visualType: "TOWN",
                zoneType: "GREEN"
            },
            create: {
                id: 1,
                name: "Oakshade Village",
                description: "A peaceful starting village.",
                visualType: "TOWN",
                zoneType: "GREEN"
            }
        });

        // 2. Seed Monster Category
        await prisma.monsterCategory.upsert({
            where: { id: 1 },
            update: { name: "Orc" },
            create: { id: 1, name: "Orc" }
        });

        // 3. Seed Basic Monsters
        const monsters = [
            { id: 1, name: "Orc Grunt", hp: 120, dmg: 15, catId: 1 },
            { id: 2, name: "Skeleton Warrior", hp: 90, dmg: 20, catId: 1 }
        ];

        for (const m of monsters) {
            await prisma.monsterTemplate.upsert({
                where: { id: m.id },
                update: {
                    name: m.name,
                    hp_base: m.hp,
                    damage_base: m.dmg,
                    categoryId: m.catId,
                    active_time: m.name === "Skeleton Warrior" ? "NIGHT" : "ANY"
                },
                create: {
                    id: m.id,
                    name: m.name,
                    hp_base: m.hp,
                    damage_base: m.dmg,
                    categoryId: m.catId,
                    active_time: m.name === "Skeleton Warrior" ? "NIGHT" : "ANY"
                }
            });

            // Map monster to region
            await prisma.regionMonster.deleteMany({ where: { regionId: 1, monsterId: m.id } });
            await prisma.regionMonster.create({
                data: { regionId: 1, monsterId: m.id }
            });
        }

        // 4. Seed Test User
        await prisma.user.upsert({
            where: { id: 1 },
            update: { username: "TestPlayer", currentRegion: 1 },
            create: {
                id: 1,
                username: "TestPlayer",
                password: "hashed_password",
                currentRegion: 1,
                silver: 1000,
                gold: 0,
                premiumTierId: 0
            }
        });

        console.log("  ✅ World basics, monsters, and test user have been successfully seeded.");
    } catch (error) {
        console.error("  ❌ World seeding failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
