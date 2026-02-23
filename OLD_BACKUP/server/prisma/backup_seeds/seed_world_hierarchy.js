const prisma = require('../../src/db');

/**
 * World Hierarchy Seeder
 * Generates 390 zones across 5 tiers with hierarchical connections
 * 
 * Distribution:
 * - Tier 1 (GREEN): 100 zones (Level 1-10)
 * - Tier 2 (BLUE): 120 zones (Level 10-25)
 * - Tier 3 (YELLOW): 90 zones (Level 25-40)
 * - Tier 4 (RED): 60 zones (Level 40-60)
 * - Tier 5 (BLACK): 20 zones (Level 60-80)
 */

const ZONE_TIERS = [
    { type: 'GREEN', count: 100, levelMin: 1, levelMax: 10, color: 'VERDANT', names: ['Verdant Valley', 'Whispering Woods', 'Peaceful Meadow', 'Crystal Brook', 'Sunlit Glade'] },
    { type: 'BLUE', count: 120, levelMin: 10, levelMax: 25, color: 'AZURE', names: ['Azure Coast', 'Tranquil Bay', 'Sapphire Shore', 'Misty Harbor', 'Serene Lake'] },
    { type: 'YELLOW', count: 90, levelMin: 25, levelMax: 40, color: 'GOLDEN', names: ['Golden Wastes', 'Sunscorch Plains', 'Amber Dunes', 'Gilded Mesa', 'Desert Expanse'] },
    { type: 'RED', count: 60, levelMin: 40, levelMax: 60, color: 'CRIMSON', names: ['Crimson Battlefield', 'Bloodstone Ridge', 'Scarlet Wasteland', 'Volcanic Rim', 'War-Torn Valley'] },
    { type: 'BLACK', count: 20, levelMin: 60, levelMax: 80, color: 'OBSIDIAN', names: ['Obsidian Depths', 'Void Sanctum', 'Shadow Abyss', 'Eternal Darkness', 'Death\'s Gate'] }
];

const START_ID = 10000; // Starting ID to avoid conflicts with existing zones

async function seedWorld() {
    console.log('🌍 Starting World Hierarchy Seeding (390 Zones)...\n');
    
    let currentId = START_ID;
    const allZones = [];
    
    // Create all zones first
    for (const tier of ZONE_TIERS) {
        console.log(`Creating ${tier.count} ${tier.type} zones...`);
        const tierZones = [];
        
        for (let i = 0; i < tier.count; i++) {
            const nameBase = tier.names[i % tier.names.length];
            const nameNumber = Math.floor(i / tier.names.length) + 1;
            const zoneName = tier.names.length > 1 && i >= tier.names.length 
                ? `${nameBase} ${nameNumber}` 
                : `${nameBase} #${i + 1}`;
            
            // Level scaling within tier range
            const levelRange = tier.levelMax - tier.levelMin;
            const zoneLevel = tier.levelMin + Math.floor((i / tier.count) * levelRange);

            // Procedural Grid Assignment
            // We use a simple grid layout for 390 zones
            let x, y;
            const rowSize = 10;
            const tierOffsets = {
                'GREEN': { x: 0, y: 0 },
                'BLUE': { x: 10, y: 0 },
                'YELLOW': { x: 0, y: 10 },
                'RED': { x: 10, y: 10 },
                'BLACK': { x: 20, y: 0 }
            };
            const offset = tierOffsets[tier.type];
            x = offset.x + (i % rowSize);
            y = offset.y + Math.floor(i / rowSize);
            
            const zoneData = {
                id: currentId,
                name: zoneName,
                description: `A ${tier.type.toLowerCase()} zone in the ${tier.color.toLowerCase()} region.`,
                zoneType: tier.type,
                zoneLevel: zoneLevel,
                zoneColor: tier.color,
                visualType: tier.type === 'ROYAL' ? 'ROYAL_CITY' : tier.type === 'GREEN' ? 'VILLAGE' : 'WILDERNESS',
                isSafeZone: tier.type === 'GREEN' || tier.type === 'BLUE',
                regionalTaxRate: 0.10,
                gridX: x,
                gridY: y
            };
            
            tierZones.push(zoneData);
            allZones.push({ ...zoneData, tier: tier.type });
            currentId++;
            if (i % 20 === 0) console.log(`    .. iteration ${i}`);
        }
        
        console.log(`  ✓ Created ${tierZones.length} ${tier.type} zones (IDs ${tierZones[0].id} - ${tierZones[tierZones.length-1].id})`);
    }
    console.log(`\n--- All data prepared (${allZones.length} zones) ---`);
    
    // Insert all zones into database
    console.log('\n📝 Inserting zones into database...');
    for (const zone of allZones) {
        const { tier, ...zoneData } = zone;
        await prisma.regionTemplate.upsert({
            where: { id: zoneData.id },
            update: zoneData,
            create: zoneData
        });
    }
    console.log(`  ✓ Inserted ${allZones.length} zones`);
    
    // Create hierarchical connections
    console.log('\n🔗 Creating hierarchical connections...');
    const connectionCount = await createConnections(allZones);
    console.log(`  ✓ Created ${connectionCount} connections`);
    
    console.log('\n✅ World Seeding Complete!');
    console.log(`Total Zones: ${allZones.length}`);
    console.log(`Total Connections: ${connectionCount}`);
    console.log(`\nZone Breakdown:`);
    for (const tier of ZONE_TIERS) {
        const count = allZones.filter(z => z.tier === tier.type).length;
        const zones = allZones.filter(z => z.tier === tier.type);
        const minId = Math.min(...zones.map(z => z.id));
        const maxId = Math.max(...zones.map(z => z.id));
        console.log(`  ${tier.type.padEnd(7)}: ${count.toString().padStart(3)} zones (ID ${minId}-${maxId})`);
    }
}

async function createConnections(allZones) {
    let connectionCount = 0;
    
    // Group zones by tier
    const tierGroups = {};
    for (const tier of ZONE_TIERS) {
        tierGroups[tier.type] = allZones.filter(z => z.tier === tier.type);
    }
    
    // Connect BLUE to GREEN (each blue connects to 1-2 green zones)
    for (let i = 0; i < tierGroups.BLUE.length; i++) {
        const blueZone = tierGroups.BLUE[i];
        const greenIndex = Math.floor((i / tierGroups.BLUE.length) * tierGroups.GREEN.length);
        const parentGreen = tierGroups.GREEN[greenIndex];
        
        await prisma.regionConnection.upsert({
            where: { 
                originRegionId_targetRegionId: { 
                    originRegionId: blueZone.id, 
                    targetRegionId: parentGreen.id 
                } 
            },
            update: {},
            create: {
                originRegionId: blueZone.id,
                targetRegionId: parentGreen.id,
                travelTimeSeconds: 300
            }
        });
        connectionCount++;
    }
    
    // Connect YELLOW to BLUE
    for (let i = 0; i < tierGroups.YELLOW.length; i++) {
        const yellowZone = tierGroups.YELLOW[i];
        const blueIndex = Math.floor((i / tierGroups.YELLOW.length) * tierGroups.BLUE.length);
        const parentBlue = tierGroups.BLUE[blueIndex];
        
        await prisma.regionConnection.upsert({
            where: { 
                originRegionId_targetRegionId: { 
                    originRegionId: yellowZone.id, 
                    targetRegionId: parentBlue.id 
                } 
            },
            update: {},
            create: {
                originRegionId: yellowZone.id,
                targetRegionId: parentBlue.id,
                travelTimeSeconds: 600
            }
        });
        connectionCount++;
    }
    
    // Connect RED to YELLOW
    for (let i = 0; i < tierGroups.RED.length; i++) {
        const redZone = tierGroups.RED[i];
        const yellowIndex = Math.floor((i / tierGroups.RED.length) * tierGroups.YELLOW.length);
        const parentYellow = tierGroups.YELLOW[yellowIndex];
        
        await prisma.regionConnection.upsert({
            where: { 
                originRegionId_targetRegionId: { 
                    originRegionId: redZone.id, 
                    targetRegionId: parentYellow.id 
                } 
            },
            update: {},
            create: {
                originRegionId: redZone.id,
                targetRegionId: parentYellow.id,
                travelTimeSeconds: 900
            }
        });
        connectionCount++;
    }
    
    // Connect BLACK to RED
    for (let i = 0; i < tierGroups.BLACK.length; i++) {
        const blackZone = tierGroups.BLACK[i];
        const redIndex = Math.floor((i / tierGroups.BLACK.length) * tierGroups.RED.length);
        const parentRed = tierGroups.RED[redIndex];
        
        await prisma.regionConnection.upsert({
            where: { 
                originRegionId_targetRegionId: { 
                    originRegionId: blackZone.id, 
                    targetRegionId: parentRed.id 
                } 
            },
            update: {},
            create: {
                originRegionId: blackZone.id,
                targetRegionId: parentRed.id,
                travelTimeSeconds: 1200
            }
        });
        connectionCount++;
    }
    
    return connectionCount;
}

// Run seeder
seedWorld()
    .catch(e => {
        console.error('ERROR:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
