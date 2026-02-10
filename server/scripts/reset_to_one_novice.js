const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const userId = 1;
    console.log(`--- Reseting User ${userId} to 1 Novice unit ---`);

    // 1. Confirm Novice Class
    const noviceClass = await prisma.classTemplate.findFirst({
        where: { name: 'Novice' }
    });

    if (!noviceClass) {
        throw new Error("Novice class (ClassTemplate) not found in database!");
    }
    console.log(`Found Novice class with ID: ${noviceClass.id}`);

    // 2. Clear existing Heroes and Formations
    // Order matters because of relations
    console.log("Cleaning up old heroes and formations...");
    
    // Find all hero IDs for this user
    const userHeroes = await prisma.hero.findMany({
        where: { userId: userId },
        select: { id: true }
    });
    const heroIds = userHeroes.map(h => h.id);

    // Delete related data first
    await prisma.formationSlot.deleteMany({
        where: { heroId: { in: heroIds } }
    });
    
    await prisma.formationPreset.deleteMany({
        where: { userId: userId }
    });

    await prisma.heroEquipment.deleteMany({
        where: { heroId: { in: heroIds } }
    });

    await prisma.heroTrait.deleteMany({
        where: { heroId: { in: heroIds } }
    });

    await prisma.heroSkill.deleteMany({
        where: { heroId: { in: heroIds } }
    });

    await prisma.heroClassMastery.deleteMany({
        where: { heroId: { in: heroIds } }
    });

    await prisma.heroStatAllocation.deleteMany({
        where: { heroId: { in: heroIds } }
    });

    await prisma.heroStatHistory.deleteMany({
        where: { heroId: { in: heroIds } }
    });

    await prisma.heroElementalAffinity.deleteMany({
        where: { heroId: { in: heroIds } }
    });

    await prisma.heroEquipmentSet.deleteMany({
        where: { heroId: { in: heroIds } }
    });

    // Finally delete heroes
    await prisma.hero.deleteMany({
        where: { userId: userId }
    });

    console.log("Old data cleared.");

    // 3. Create the 1 Novice Hero
    const newHero = await prisma.hero.create({
        data: {
            userId: userId,
            name: "Trainee",
            classId: noviceClass.id,
            unitLevel: 1,
            classLevel: 1,
            str: 10,
            dex: 10,
            int: 10,
            vit: 10,
            luk: 5,
            isMain: true,
            vitality: 100
        }
    });

    console.log(`Created new Novice hero: ${newHero.name} (ID: ${newHero.id})`);

    // 4. Setup a default formation
    const preset = await prisma.formationPreset.create({
        data: {
            userId: userId,
            name: "Default Formation"
        }
    });

    await prisma.formationSlot.create({
        data: {
            presetId: preset.id,
            heroId: newHero.id,
            gridX: 1, // Central position in a 3x3 (if it's 0-indexed 1,1 is center)
            gridY: 1
        }
    });

    console.log("Default formation created with the new hero.");
    console.log("--- Reset Complete ---");
}

main()
    .catch(e => {
        console.error("FAILED to reset database:");
        console.error(e);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
