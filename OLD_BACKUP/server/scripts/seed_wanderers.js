const prisma = require('../src/db');

async function seedWanderers() {
    console.log('--- Seeding Wanderer NPCs ---');

    // 1. Find some regions to distribute NPCs
    // We'll pick a few regions from different zones to make them feel "world-wide"
    const targetRegions = await prisma.regionTemplate.findMany({
        take: 30,
        where: {
            OR: [
                { zoneType: 'VILLAGE' },
                { zoneType: 'GREEN' },
                { zoneType: 'YELLOW' }
            ]
        },
        select: { id: true, name: true, gridX: true, gridY: true }
    });

    if (targetRegions.length < 5) {
        console.error('Not enough regions found to seed NPCs. Please run mapSeeder first.');
        return;
    }

    const wanderers = [
        {
            name: "Barnaby the Merchant",
            title: "Traveling Peddler",
            description: "A jolly man carrying a massive backpack full of exotic goods.",
            type: "MERCHANT",
            isWanderer: true,
            active_time: "DAY"
        },
        {
            name: "Mysterious Nomad",
            title: "Desert Wanderer",
            description: "A cloaked figure who moves silently between oases.",
            type: "WANDERER",
            isWanderer: true,
            active_time: "ANY"
        },
        {
            name: "Silas the Scout",
            title: "Bandit Informant",
            description: "He looks suspicious, always scanning the horizon.",
            type: "BANDIT",
            isWanderer: true,
            active_time: "NIGHT"
        },
        {
            name: "Elder Garen",
            title: "Village Historian",
            description: "An old man who walks between villages telling stories.",
            type: "GIVE_QUEST",
            isWanderer: true,
            active_time: "DAY"
        }
    ];

    for (const data of wanderers) {
        // Upsert NPC Template
        const npc = await prisma.nPCTemplate.upsert({
            where: { id: wanderers.indexOf(data) + 1000 }, // Use high IDs to avoid collision
            update: data,
            create: {
                ...data,
                id: wanderers.indexOf(data) + 1000,
                version: 1
            }
        });

        // Assign 5 random regions to each wanderer
        const shuffled = targetRegions.sort(() => 0.5 - Math.random());
        const selectedRegions = shuffled.slice(0, 5);

        // Delete existing region mapping for this NPC to prevent duplicates
        await prisma.regionNPC.deleteMany({
            where: { npcId: npc.id }
        });

        for (const region of selectedRegions) {
            await prisma.regionNPC.create({
                data: {
                    npcId: npc.id,
                    regionId: region.id
                }
            });
            console.log(`Assigned NPC ${npc.name} to region ${region.name} (${region.id})`);
        }
    }

    console.log('--- Wanderer Seeding Completed! ---');
}

seedWanderers()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
