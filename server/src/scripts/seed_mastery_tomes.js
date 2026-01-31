const prisma = require('../db');

async function seedMasteryTomes() {
    console.log("📚 SEEDING MASTERY TOMES...");

    const classes = await prisma.classTemplate.findMany();

    for (const c of classes) {
        const tomeId = 9000 + c.id;
        await prisma.itemTemplate.upsert({
            where: { id: tomeId },
            update: {
                name: `${c.name} Mastery Tome`,
                masteryClassId: c.id,
                masteryXpAmount: 5000 // Base XP granted by a tome
            },
            create: {
                id: tomeId,
                name: `${c.name} Mastery Tome`,
                description: `A mystical volume containing the professional secrets of the ${c.name}. Consuming this grants significant Class XP.`,
                category: "CONSUMABLE",
                rarity: "RARE",
                masteryClassId: c.id,
                masteryXpAmount: 5000
            }
        });
    }

    console.log(`✅ Seeded ${classes.length} Mastery Tomes.`);
}

seedMasteryTomes().catch(err => console.error(err));
