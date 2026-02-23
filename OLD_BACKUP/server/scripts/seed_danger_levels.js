const prisma = require('../src/db');

const DANGER_MAP = {
    'GREEN': 1,
    'TOWN': 1,
    'VILLAGE': 1,
    'BRIDGE': 1,
    'BLUE': 2,
    'WATER': 2,
    'YELLOW': 3,
    'ROYAL': 4,
    'CITADEL': 4,
    'RED': 5,
    'BLACK': 6,
    'BOSS': 6,
    'CHASM': 6
};

const CATEGORY_MAP = {
    'GREEN': 'Verdant Forest',
    'TOWN': 'Kingdom Hub',
    'VILLAGE': 'Rural Settlement',
    'BRIDGE': 'Strategic Crossing',
    'BLUE': 'Coastal Region',
    'WATER': 'Abyssal Sea',
    'YELLOW': 'Arid Plains',
    'ROYAL': 'Royal Territory',
    'CITADEL': 'Fortified Citadel',
    'RED': 'Scorched Earth',
    'BLACK': 'Void Corruption',
    'BOSS': 'Epicenter of Power',
    'CHASM': 'Gaping Abyss'
};

async function seedDangerLevels() {
    console.log("--- 🏔️ SEEDING DANGER LEVELS 🏔️ ---");
    
    const regions = await prisma.regionTemplate.findMany();
    let updatedCount = 0;

    for (const region of regions) {
        const danger = DANGER_MAP[region.zoneType] || 1;
        const category = CATEGORY_MAP[region.zoneType] || 'Territory';
        const isBandit = region.zoneType === 'RED' || region.zoneType === 'BLACK';
        
        // AAA: Inn Mapping
        const isInnZone = region.zoneType === 'TOWN' || region.zoneType === 'VILLAGE' || region.visualType === 'TOWN' || region.visualType === 'VILLAGE';
        const innTier = (region.zoneType === 'TOWN' || region.visualType === 'TOWN') ? 3 : (isInnZone ? 2 : 1);
        
        await prisma.regionTemplate.update({
            where: { id: region.id },
            data: { 
                dangerLevel: danger,
                hasInn: isInnZone,
                innTier: isInnZone ? innTier : 1,
                regionCategory: category,
                isBanditHideout: isBandit
            }
        });
        updatedCount++;
    }

    console.log(`Successfully updated danger levels for ${updatedCount} regions.`);
    console.log("--- ✅ SEEDING COMPLETE ✅ ---");
}

seedDangerLevels()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
