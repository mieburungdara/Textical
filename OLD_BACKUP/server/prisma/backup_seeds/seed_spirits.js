const prisma = require('../src/db');

async function seedSpirits() {
    console.log("=== SEEDING SPIRIT SYSTEM (v16.0) ===");

    try {
        // 1. Seed Spirit Templates
        const spirits = [
            {
                name: "Ancient Guardian Spirit",
                lore: "A faint hum of protective energy surrounds you. 'Walk with courage, child of the sun.'",
                effectType: "BUFF",
                statKey: "expGain",
                statValue: 1.15,
                isBenevolent: true
            },
            {
                name: "Whispering Sylph",
                lore: "The wind carries soft voices that guide your steps. 'The path is clear today.'",
                effectType: "BUFF",
                statKey: "accuracy",
                statValue: 1.1,
                isBenevolent: true
            },
            {
                name: "Restless Merchant Spirit",
                lore: "A shimmering figure offers advice on bartering. 'Buy low, sell high, traveler...'",
                effectType: "BUFF",
                statKey: "silverGain",
                statValue: 1.2,
                isBenevolent: true
            },
            {
                name: "Nature's Embrace",
                lore: "The trees seem to lean in, sharing their vitality. 'Breathe... let the earth heal you.'",
                effectType: "BUFF",
                statKey: "hpRegen",
                statValue: 1.25,
                isBenevolent: true
            },
            {
                name: "Echo of the Brave",
                lore: "A spectral warrior stands tall beside you. 'Do not falter. Your steel is stronger than you know.'",
                effectType: "BUFF",
                statKey: "defense",
                statValue: 1.15,
                isBenevolent: true
            },
            {
                name: "Haunting Shade",
                lore: "Cold hands seem to tug at your cloak. 'Stay... stay in the dark forever...'",
                effectType: "DEBUFF",
                statKey: "accuracy",
                statValue: 0.85,
                isBenevolent: false
            },
            {
                name: "Chilling Wraith",
                lore: "The air turns frigid, draining your very strength to move. 'Every breath belongs to the void.'",
                effectType: "DEBUFF",
                statKey: "vitalityCost",
                statValue: 1.2,
                isBenevolent: false
            },
            {
                name: "Sorrowful Banshee",
                lore: "A piercing wail shatters your concentration. 'Why do you still walk when all have fallen?'",
                effectType: "DEBUFF",
                statKey: "skillCastingSpeed",
                statValue: 0.8,
                isBenevolent: false
            },
            {
                name: "Greedy Poltergeist",
                lore: "Invisible fingers fumble with your coin pouch. 'Everything has a price... even your life.'",
                effectType: "DEBUFF",
                statKey: "silverGain",
                statValue: 0.75,
                isBenevolent: false
            },
            {
                name: "Vengeful revenant",
                lore: "The ground trembles with ancient rage. 'You do not belong in this hallowed silence!'",
                effectType: "DEBUFF",
                statKey: "defense",
                statValue: 0.8,
                isBenevolent: false
            }
        ];

        console.log("- Creating Spirit Templates...");
        for (const s of spirits) {
            await prisma.spiritTemplate.upsert({
                where: { id: spirits.indexOf(s) + 1 },
                update: s,
                create: s
            });
        }

        // 2. Distribute spiritDensity and RegionSpirits
        console.log("- Distributing Spirit Density and Links...");
        const regions = await prisma.regionTemplate.findMany();

        for (const region of regions) {
            let density = 0.0;
            let spiritIds = [];

            // Distribution Logic based on ZoneType
            switch (region.zoneType) {
                case 'BLACK':
                case 'BOSS':
                    density = 0.7 + Math.random() * 0.3;
                    spiritIds = [6, 7, 8, 10]; // Pure malevolence
                    break;
                case 'RED':
                    density = 0.5 + Math.random() * 0.4;
                    spiritIds = region.corruptionLevel > 0.6 ? [7, 8, 9, 10] : [5, 6, 7, 8];
                    break;
                case 'YELLOW':
                    density = 0.3 + Math.random() * 0.3;
                    spiritIds = [1, 2, 3, 5, 6, 9];
                    break;
                case 'BLUE':
                    density = 0.15 + Math.random() * 0.25;
                    spiritIds = [1, 2, 3, 4, 5];
                    break;
                case 'GREEN':
                default:
                    density = Math.random() * 0.15;
                    spiritIds = [1, 2, 4];
                    break;
            }

            // Sync spiritDensity
            await prisma.regionTemplate.update({
                where: { id: region.id },
                data: { spiritDensity: density }
            });

            // Connect spirits to region
            for (const sId of spiritIds) {
                await prisma.regionSpirit.upsert({
                    where: {
                        regionId_spiritId: { regionId: region.id, spiritId: sId }
                    },
                    update: {},
                    create: { regionId: region.id, spiritId: sId }
                });
            }
        }

        console.log("✅ Spirit System Seeding Complete and Expanded.");
    } catch (error) {
        console.error("❌ Seeding failed:", error);
    } finally {
        await prisma.$disconnect();
    }
}

seedSpirits();
