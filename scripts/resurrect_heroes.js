const path = require('path');
const { PrismaClient } = require(path.join(process.cwd(), 'server', 'node_modules', '@prisma/client'));
const prisma = new PrismaClient();

async function main() {
    console.log("Resurrecting heroes for User 1...");
    
    await prisma.hero.upsert({
        where: { id: 1 },
        update: { userId: 1, classId: 2101, range_base: 1 },
        create: {
            id: 1, userId: 1, name: "Aldric the Brave", unitLevel: 15, classLevel: 15,
            hp_base: 2500, damage_base: 380, str: 50, dex: 25, int: 20, vit: 60, luk: 15,
            defense_base: 520, speed_base: 85, range_base: 1, classId: 2101, vitality: 2500, isMain: true
        }
    });

    await prisma.hero.upsert({
        where: { id: 2 },
        update: { userId: 1, classId: 1107, range_base: 5 },
        create: {
            id: 2, userId: 1, name: "Lyra Moonwhisper", unitLevel: 12, classLevel: 12,
            hp_base: 1200, damage_base: 150, str: 15, dex: 20, int: 70, vit: 25, luk: 20,
            defense_base: 180, speed_base: 120, range_base: 5, classId: 1107, vitality: 1200
        }
    });

    await prisma.hero.upsert({
        where: { id: 5 },
        update: { userId: 1, classId: 1104, range_base: 1 },
        create: {
            id: 5, userId: 1, name: "Seraphina Lightbringer", unitLevel: 20, classLevel: 20,
            hp_base: 2800, damage_base: 280, str: 25, dex: 30, int: 65, vit: 55, luk: 25,
            defense_base: 450, speed_base: 95, range_base: 1, classId: 1104, vitality: 2800
        }
    });

    console.log("Success: Heroes resurrected. Lyra is now an Archer (Range 5).");
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect());