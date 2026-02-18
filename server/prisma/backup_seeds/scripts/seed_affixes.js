const prisma = require('../db');

async function seedAffixes() {
    console.log("💎 SEEDING AFFIX MATERIALS AND TRAITS...");

    // 1. Create Traits
    const traits = [
        { id: 1, name: "FLAME_STRIKE", description: "Deals additional 10% Fire Damage.", category: "COMBAT" },
        { id: 2, name: "LIFE_LEECH", description: "Heals 5% of damage dealt.", category: "COMBAT" },
        { id: 3, name: "SWIFTNESS", description: "+15% Movement Speed.", category: "UTILITY" }
    ];

    for (const t of traits) {
        await prisma.traitTemplate.upsert({
            where: { id: t.id },
            update: t,
            create: t
        });
    }

    // 1.1 Create Trait Stats
    const traitStats = [
        { traitId: 1, statKey: "attack_damage", statValue: 5 }, // +5 Flat ATK
        { traitId: 3, statKey: "speed", statValue: 2 }         // +2 Flat SPD
    ];

    for (const ts of traitStats) {
        await prisma.traitStat.deleteMany({ where: { traitId: ts.traitId, statKey: ts.statKey } });
        await prisma.traitStat.create({ data: ts });
    }

    // 2. Create Affix Materials
    const materials = [
        { id: 3001, name: "Fire Essence", description: "A warm orb of pure flame.", category: "MATERIAL", rarity: "RARE" },
        { id: 3002, name: "Vampiric Fang", description: "A sharp fang dripping with dark energy.", category: "MATERIAL", rarity: "RARE" },
        { id: 3003, name: "Wind Feather", description: "An impossibly light feather.", category: "MATERIAL", rarity: "RARE" }
    ];

    for (const m of materials) {
        await prisma.itemTemplate.upsert({
            where: { id: m.id },
            update: m,
            create: m
        });
    }

    console.log("✅ Seeded 3 traits and 3 affix materials.");
}

seedAffixes().catch(err => console.error(err));
