const prisma = require('../src/db');

/**
 * World Seeder v2.0 - 390 Zones
 * Implements full hierarchy: ROYAL -> BLUE -> YELLOW -> RED -> BLACK
 * Including Villages as Red Zone havens.
 */

const CONFIG = {
    ROYAL: { count: 5, visual: "CASTLE", zoneType: "ROYAL", level: 0, safe: true },
    BLUE: { count: 200, zoneType: "BLUE", levelRange: [1, 30], safe: true,
        visuals: [
            { t: "FOREST", c: 40 }, { t: "GARDEN", c: 30 }, { t: "OCEAN", c: 30 },
            { t: "CORAL", c: 30 }, { t: "FAIRY", c: 35 }, { t: "AUTUMN", c: 35 }
        ]
    },
    YELLOW: { count: 100, zoneType: "YELLOW", levelRange: [31, 60], safe: false,
        visuals: [
            { t: "MINE", c: 20 }, { t: "SNOW", c: 20 }, { t: "SWAMP", c: 20 },
            { t: "DESERT", c: 20 }, { t: "GLACIER", c: 20 }
        ]
    },
    RED: { count: 50, zoneType: "RED", levelRange: [61, 99], safe: false,
        visuals: [
            { t: "DUNGEON", c: 10 }, { t: "RUINS", c: 10 }, { t: "STORM", c: 10 },
            { t: "CASTLE", c: 8 }, { t: "PRISON", c: 7 }, { t: "SHIP", c: 5 }
        ]
    },
    VILLAGE: { count: 15, visual: "TOWN", zoneType: "VILLAGE", level: 0, safe: true },
    BLACK: { count: 20, zoneType: "BLACK", levelRange: [100, 110], safe: false,
        visuals: [
            { t: "VOLCANO", c: 4 }, { t: "LAVA", c: 4 }, { t: "HELL", c: 4 },
            { t: "GRAVEYARD", c: 4 }, { t: "WASTELAND", c: 4 }
        ]
    }
};

const NAMES = {
    ROYAL: ["Aethelgard", "Stormreach", "Highstone", "Ironcrown", "Sunspire"],
    VILLAGE: ["Oakshade", "Millstone", "Riverside", "Greenfield", "Stonehill", "Fairview", "Clearwater", "Oakhaven", "Pinecrest", "Willowbrook", "Brookside", "Smallwood", "Deerfoot", "Greyport", "Windswept"],
    PREFIX: {
        BLUE: ["Emerald", "Azure", "Sapphire", "Crystal", "Whispering", "Hidden", "Silent", "Enchanted", "Lush", "Floral"],
        YELLOW: ["Golden", "Radiant", "Iron", "Sunlit", "Sandy", "Frozen", "Dusty", "Glaring", "Solid", "Bright"],
        RED: ["Crimson", "Broken", "Stormy", "Cursed", "Ancient", "Bloody", "Dark", "Forgotten", "Grave", "Shattered"],
        BLACK: ["Abyssal", "Burning", "Corrupted", "Eternal", "Deadly", "Sinister", "Doom", "Endless", "Void", "Hellish"]
    },
    SUFFIX: {
        BLUE: ["Grove", "Ocean", "Garden", "Coral", "Falls", "Woods", "Meadow", "Glade"],
        YELLOW: ["Mine", "Peak", "Swamp", "Desert", "Glacier", "Cave", "Plateau", "Pass"],
        RED: ["Ruins", "Dungeon", "Castle", "Prison", "Ship", "Fortress", "Spire", "Keep"],
        BLACK: ["Volcano", "Lava", "Hell", "Graveyard", "Wasteland", "Pit", "Abyss", "Chasm"]
    }
};

async function main() {
    console.log("✦ Starting World Seeding: 390 Zones (Upsert Mode)...");

    // Clear existing connections to rebuild them
    await prisma.regionConnection.deleteMany({});

    let regionId = 1;
    const regions = [];

    // Helper for Upsert
    const upsertRegion = async (id, data) => {
        try {
            return await prisma.regionTemplate.upsert({
                where: { id: parseInt(id) },
                update: data,
                create: { id: parseInt(id), ...data }
            });
        } catch (err) {
            console.error(`Failed to upsert region ${id}:`, err.message);
            throw err;
        }
    };

    // 1. Create Royal Cities (Hubs)
    const royalIds = [];
    for (let i = 0; i < CONFIG.ROYAL.count; i++) {
        const data = {
            name: NAMES.ROYAL[i],
            description: `Majestic hub of civilization.`,
            visualType: CONFIG.ROYAL.visual,
            zoneType: CONFIG.ROYAL.zoneType,
            zoneLevel: CONFIG.ROYAL.level,
            isSafeZone: CONFIG.ROYAL.safe
        };
        const r = await upsertRegion(regionId++, data);
        royalIds.push(r.id);
        regions.push(r);
    }

    // Helper for random name
    const genName = (type) => {
        const p = NAMES.PREFIX[type][Math.floor(Math.random() * NAMES.PREFIX[type].length)];
        const s = NAMES.SUFFIX[type][Math.floor(Math.random() * NAMES.SUFFIX[type].length)];
        return `${p} ${s}`;
    };

    // 2. Create Blue Zones (200)
    const blueIds = [];
    for (const visualDef of CONFIG.BLUE.visuals) {
        for (let i = 0; i < visualDef.c; i++) {
            const data = {
                name: `${genName("BLUE")} #${i+1}`,
                description: `A vibrant ${visualDef.t.toLowerCase()} region.`,
                visualType: visualDef.t,
                zoneType: CONFIG.BLUE.zoneType,
                zoneLevel: Math.floor(Math.random() * 30) + 1,
                isSafeZone: CONFIG.BLUE.safe
            };
            const r = await upsertRegion(regionId++, data);
            blueIds.push(r.id);
            regions.push(r);
        }
    }

    // 3. Create Yellow Zones (100)
    const yellowIds = [];
    for (const visualDef of CONFIG.YELLOW.visuals) {
        for (let i = 0; i < visualDef.c; i++) {
            const data = {
                name: `${genName("YELLOW")} #${i+1}`,
                description: `A challenging ${visualDef.t.toLowerCase()} region.`,
                visualType: visualDef.t,
                zoneType: CONFIG.YELLOW.zoneType,
                zoneLevel: Math.floor(Math.random() * 30) + 31,
                isSafeZone: CONFIG.YELLOW.safe
            };
            const r = await upsertRegion(regionId++, data);
            yellowIds.push(r.id);
            regions.push(r);
        }
    }

    // 4. Create Red Zones (50)
    const redIds = [];
    for (const visualDef of CONFIG.RED.visuals) {
        for (let i = 0; i < visualDef.c; i++) {
            const data = {
                name: `${genName("RED")} #${i+1}`,
                description: `A dangerous ${visualDef.t.toLowerCase()} region.`,
                visualType: visualDef.t,
                zoneType: CONFIG.RED.zoneType,
                zoneLevel: Math.floor(Math.random() * 39) + 61,
                isSafeZone: CONFIG.RED.safe
            };
            const r = await upsertRegion(regionId++, data);
            redIds.push(r.id);
            regions.push(r);
        }
    }

    // 5. Create Villages (15)
    const villageIds = [];
    for (let i = 0; i < CONFIG.VILLAGE.count; i++) {
        const data = {
            name: NAMES.VILLAGE[i],
            description: `A small haven in the wilderness.`,
            visualType: CONFIG.VILLAGE.visual,
            zoneType: CONFIG.VILLAGE.zoneType,
            zoneLevel: CONFIG.VILLAGE.level,
            isSafeZone: CONFIG.VILLAGE.safe
        };
        const r = await upsertRegion(regionId++, data);
        villageIds.push(r.id);
        regions.push(r);
    }

    // 6. Create Black Zones (20)
    const blackIds = [];
    for (const visualDef of CONFIG.BLACK.visuals) {
        for (let i = 0; i < visualDef.c; i++) {
            const data = {
                name: `${genName("BLACK")} #${i+1}`,
                description: `The forbidden ${visualDef.t.toLowerCase()} region.`,
                visualType: visualDef.t,
                zoneType: CONFIG.BLACK.zoneType,
                zoneLevel: 100,
                isSafeZone: CONFIG.BLACK.safe
            };
            const r = await upsertRegion(regionId++, data);
            blackIds.push(r.id);
            regions.push(r);
        }
    }

    console.log(`  ✅ ${regions.length} Regions created. Connecting...`);

    // CONNECTIONS
    // 1. Royal -> Blue (Each royal connects to 40 blue zones)
    for (let i = 0; i < royalIds.length; i++) {
        const slice = blueIds.slice(i * 40, (i + 1) * 40);
        for (const targetId of slice) {
            await prisma.regionConnection.create({
                data: { originRegionId: royalIds[i], targetRegionId: targetId, travelTimeSeconds: 15 }
            });
            await prisma.regionConnection.create({
                data: { originRegionId: targetId, targetRegionId: royalIds[i], travelTimeSeconds: 15 }
            });
        }
    }

    // 2. Blue -> Yellow (Each blue connects to 1 random yellow)
    for (let i = 0; i < blueIds.length; i++) {
        const targetId = yellowIds[i % yellowIds.length];
        await prisma.regionConnection.create({
            data: { originRegionId: blueIds[i], targetRegionId: targetId, travelTimeSeconds: 30 }
        });
        await prisma.regionConnection.create({
            data: { originRegionId: targetId, targetRegionId: blueIds[i], travelTimeSeconds: 30 }
        });
    }

    // 3. Yellow -> Red (Each yellow connects to 1 random red)
    for (let i = 0; i < yellowIds.length; i++) {
        const targetId = redIds[i % redIds.length];
        await prisma.regionConnection.create({
            data: { originRegionId: yellowIds[i], targetRegionId: targetId, travelTimeSeconds: 45 }
        });
        await prisma.regionConnection.create({
            data: { originRegionId: targetId, targetRegionId: yellowIds[i], travelTimeSeconds: 45 }
        });
    }

    // 4. Red -> Village (Close integration)
    for (let i = 0; i < redIds.length; i++) {
        const targetId = villageIds[i % villageIds.length];
        await prisma.regionConnection.create({
            data: { originRegionId: redIds[i], targetRegionId: targetId, travelTimeSeconds: 10 }
        });
        await prisma.regionConnection.create({
            data: { originRegionId: targetId, targetRegionId: redIds[i], travelTimeSeconds: 10 }
        });
    }

    // 5. Red -> Black
    for (let i = 0; i < redIds.length; i++) {
        const targetId = blackIds[i % blackIds.length];
        await prisma.regionConnection.create({
            data: { originRegionId: redIds[i], targetRegionId: targetId, travelTimeSeconds: 60 }
        });
        await prisma.regionConnection.create({
            data: { originRegionId: targetId, targetRegionId: redIds[i], travelTimeSeconds: 60 }
        });
    }

    console.log("  ✅ Connectivity established. Seeding complete!");
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
