const prisma = require('../src/db');

async function migratePvpModes() {
    console.log("--- Migrating PvP Modes based on Zone Type ---");

    const mapping = {
        'GREEN': 'SAFE',
        'VILLAGE': 'SAFE',
        'TOWN': 'SAFE',
        'ROYAL': 'SAFE',
        'YELLOW': 'CONSENT',
        'BLUE': 'CONSENT', // Adding Blue as Consent based on common RPG patterns
        'RED': 'RESTRICTED',
        'BLACK': 'OPEN',
        'BOSS': 'RESTRICTED',
        'CITADEL': 'SAFE',
        'BRIDGE': 'RESTRICTED',
        'WATER': 'SAFE',
        'CHASM': 'SAFE'
    };

    const regions = await prisma.regionTemplate.findMany();
    let updatedCount = 0;

    for (const region of regions) {
        const targetMode = mapping[region.zoneType] || 'SAFE';
        
        await prisma.regionTemplate.update({
            where: { id: region.id },
            data: { pvpMode: targetMode }
        });
        updatedCount++;
    }

    console.log(`✅ Finished! Updated ${updatedCount} regions.`);
}

migratePvpModes()
    .catch(e => console.error(e))
    .finally(async () => {
        // await prisma.$disconnect();
    });
