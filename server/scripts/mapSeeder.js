const prisma = require('../src/db');
const fs = require('fs');
const path = require('path');

async function main() {
  console.log('--- Starting Map Seeder (1225 Regions) ---');
  console.log('Using database configuration from src/db.js');
  console.log('--- Starting Map Seeder (1225 Regions) ---');

  const mapsPath = path.join(__dirname, '../../plans/MAPS.json');
  const mapsData = JSON.parse(fs.readFileSync(mapsPath, 'utf8'));

  // Utility to convert index to letters (A, B, ..., Z, AA, AB, ...)
  const getLetterCoord = (index) => {
    let letter = '';
    while (index >= 0) {
      letter = String.fromCharCode((index % 26) + 65) + letter;
      index = Math.floor(index / 26) - 1;
    }
    return letter;
  };

  const zoneRules = {
    'WATER': { zoneType: 'WATER', isSafe: true, level: 1, color: 'AZURE', area: 'The Azure Ocean', sfx: 'ocean_waves', teleportMult: 2.0, element: 'WATER', atkMod: 0.9, corruption: 0.0, sanctuary: 0.1, caste: 'AQUATIC' },
    'GREEN': { zoneType: 'GREEN', isSafe: true, level: 1, color: 'VERDANT', area: 'The Verdant Wilds', sfx: 'forest_ambient', teleportMult: 1.0, element: 'EARTH', defMod: 1.05, corruption: 0.0, sanctuary: 0.2, caste: 'BEAST' },
    'BLUE': { zoneType: 'BLUE', isSafe: true, level: 15, color: 'AZURE', area: 'The Azure Isles', sfx: 'coastal_breeze', teleportMult: 1.0, element: 'AIR', corruption: 0.0, sanctuary: 0.1, caste: 'BEAST' },
    'YELLOW': { zoneType: 'YELLOW', isSafe: false, level: 45, color: 'GOLDEN', area: 'The Golden Expanse', sfx: 'desert_wind', teleportMult: 1.2, element: 'LIGHT', corruption: 0.1, sanctuary: 0.0, caste: 'INSECTOID' },
    'RED': { zoneType: 'RED', isSafe: false, level: 80, color: 'CRIMSON', area: 'The Crimson Realm', sfx: 'war_drums', teleportMult: 1.5, resourceMod: 1.5, element: 'FIRE', atkMod: 1.1, corruption: 0.3, sanctuary: -0.2, caste: 'DEMON' },
    'BLACK': { zoneType: 'BLACK', isSafe: false, level: 100, color: 'OBSIDIAN', area: 'The Obsidian Abyss', sfx: 'dark_whispers', teleportMult: 2.0, resourceMod: 3.0, respawnPenalty: 3.0, partyMax: 30, element: 'DARK', atkMod: 1.2, corruption: 0.7, sanctuary: -0.5, caste: 'SKELETON' },
    'BOSS': { zoneType: 'BOSS', isSafe: false, level: 100, color: 'OBSIDIAN', area: 'The Heart of Darkness', sfx: 'boss_ominous', teleportMult: 5.0, resourceMod: 5.0, partyMax: 1, element: 'DARK', atkMod: 1.5, defMod: 1.5, corruption: 1.0, sanctuary: -1.0, caste: 'DEMON' },
    'CITADEL': { zoneType: 'ROYAL', isSafe: true, level: 0, color: 'NEUTRAL', area: 'Kingdom Citadels', sfx: 'castle_hub', teleportMult: 0.5, element: 'NEUTRAL', innRate: 2.5, corruption: 0.0, sanctuary: 1.0, caste: 'HUMAN' },
    'VILLAGE': { zoneType: 'VILLAGE', isSafe: true, level: 0, color: 'NEUTRAL', area: 'Rural Settlements', sfx: 'village_life', teleportMult: 0.8, element: 'NEUTRAL', innRate: 1.5, corruption: 0.0, sanctuary: 0.5, caste: 'HUMAN' },
    'BRIDGE': { zoneType: 'BRIDGE', isSafe: false, level: 50, color: 'NEUTRAL', area: 'The Great Crossings', sfx: 'bridge_wind', teleportMult: 1.2, element: 'AIR', corruption: 0.1, sanctuary: 0.0, caste: 'HUMANOID' },
    'CHASM': { zoneType: 'CHASM', isSafe: false, level: 100, color: 'OBSIDIAN', area: 'The Deep Chasms', sfx: 'abyss_wind', teleportMult: 3.0, element: 'DARK', corruption: 0.5, sanctuary: -0.4, caste: 'ZOMBIE' }
  };

  const visualPools = {
    'WATER': ['OCEAN', 'CORAL'],
    'GREEN': ['FOREST', 'GARDEN'],
    'BLUE': ['FAIRY', 'AUTUMN'],
    'YELLOW': ['DESERT', 'GLACIER', 'MINE'],
    'RED': ['DUNGEON', 'RUINS', 'STORM'],
    'BLACK': ['VOLCANO', 'HELL', 'LAVA'],
    'BOSS': ['ARENA'],
    'CITADEL': ['CASTLE'],
    'VILLAGE': ['TOWN'],
    'BRIDGE': ['RUINS'],
    'CHASM': ['MINE']
  };

  let count = 0;
  
  // Clean existing regions & hazards
  console.log('Cleaning old regions, areas & hazards...');
  try { await prisma.regionHazard.deleteMany({}); } catch (e) { console.log('Notice: Could not clear RegionHazard'); }
  try { await prisma.hazardType.deleteMany({}); } catch (e) { console.log('Notice: Could not clear HazardType'); }
  try { await prisma.regionTemplate.deleteMany({}); } catch (e) { console.log('Notice: Could not clear RegionTemplate'); }
  try { await prisma.regionArea.deleteMany({}); } catch (e) { console.log('Notice: Could not clear RegionArea'); }
  console.log('Cleanup step finished (with potential skips).');

  // Pre-create Hazard Types
  console.log('Creating HazardTypes...');
  const hazards = {
    'LAVA': await prisma.hazardType.create({ data: { name: 'Lava Flow', description: 'Damage api ekstrem setiap beberapa detik.' } }),
    'POISON': await prisma.hazardType.create({ data: { name: 'Poison Gas', description: 'Gas beracun yang mengurangi HP secara perlahan.' } }),
    'MIASMA': await prisma.hazardType.create({ data: { name: 'Abyss Miasma', description: 'Energi gelap yang melemahkan unit hero.' } }),
    'STORM': await prisma.hazardType.create({ data: { name: 'Void Storm', description: 'Badai petir yang menyambar secara acak.' } })
  };

  // Pre-create Areas to handle relations
  const areaMap = new Map();
  console.log('Creating RegionAreas...');
  for (const rule of Object.values(zoneRules)) {
    if (!areaMap.has(rule.area)) {
      const area = await prisma.regionArea.create({
        data: { name: rule.area, description: `Wilayah utama ${rule.area}` }
      });
      areaMap.set(rule.area, area.id);
    }
  }

  for (const [zoneKey, zoneData] of Object.entries(mapsData)) {
    console.log(`Processing Zone: ${zoneKey} (${zoneData.coordinates.length} coordinates)...`);
    const config = zoneRules[zoneKey] || { zoneType: zoneKey, isSafe: false, level: 1, color: 'NEUTRAL', area: 'Unknown' };
    const visualPool = visualPools[zoneKey] || ['FOREST'];
    const areaId = areaMap.get(config.area);

    for (const coord of zoneData.coordinates) {
      const xLetter = getLetterCoord(coord.x);
      const yNum = coord.y + 1;
      const regionName = `${xLetter}${yNum}`;
      const regionId = coord.x * 100 + coord.y;
      const visualType = visualPool[Math.floor(Math.random() * visualPool.length)];

      try {
        const region = await prisma.regionTemplate.upsert({
          where: { id: regionId },
          update: {
            name: regionName,
            description: `Wilayah koordinat ${regionName} (${zoneKey})`,
            visualType: visualType,
            traversalType: zoneData.traversal,
            zoneType: config.zoneType,
            zoneLevel: config.level,
            zoneColor: config.color,
            isSafeZone: config.isSafe,
            gridX: coord.x,
            gridY: coord.y,
            area: areaId ? { connect: { id: areaId } } : undefined,
            resourceModifier: config.resourceMod || 1.0,
            teleportCostMultiplier: config.teleportMult || 1.0,
            maxPartyUnits: config.partyMax || 100,
            ambientSfxPack: config.sfx || 'default_ambient',
            respawnPenaltyMult: config.respawnPenalty || 1.0,
            requiredLevel: Math.max(1, config.level - 5),
            isDiscoveryPoint: true,
            // Advanced RPG Features
            landmarkName: Math.random() > 0.9 ? `Landmark ${regionName}` : null,
            flavorText: `Kamu memasuki wilayah ${config.area} yang penuh misteri.`,
            discoveryXp: config.level * 20,
            spawnRateMultiplier: config.zoneType === 'BLACK' ? 1.5 : 1.0,
            eliteSpawnChance: config.zoneType === 'RED' ? 0.1 : 0.05,
            // Access Requirements
            minRequiredUnits: config.level > 50 ? Math.floor(config.level / 20) : 0,
            minRequiredHeroLevel: Math.max(1, config.level - 10),
            reputationRequirement: (zoneKey === 'CITADEL' || zoneKey === 'VILLAGE') ? 100 : 0,
            factionTributeRate: (zoneKey === 'CITADEL') ? 0.05 : 0.0,
            // Tactical Combat & Recovery
            elementalAffinity: config.element || 'NEUTRAL',
            terrainAttackMod: config.atkMod || 1.0,
            terrainDefenseMod: config.defMod || 1.0,
            innRecoveryRate: config.innRate || 1.0,
            // Micro-Economy & Blessings
            resourceScarcity: 1.0,
            marketDemandIndex: (zoneKey === 'CITADEL' || zoneKey === 'VILLAGE') ? 1.2 : 1.0,
            blessingType: Math.random() > 0.95 ? 'Blessing of Speed' : null,
            corruptionLevel: config.corruption || 0.0,
            sanctuaryPower: config.sanctuary || 0.0,
            dominanCaste: config.caste || 'NEUTRAL'
          },
          create: {
            id: regionId,
            name: regionName,
            description: `Wilayah koordinat ${regionName} (${zoneKey})`,
            visualType: visualType,
            traversalType: zoneData.traversal,
            zoneType: config.zoneType,
            zoneLevel: config.level,
            zoneColor: config.color,
            isSafeZone: config.isSafe,
            gridX: coord.x,
            gridY: coord.y,
            area: areaId ? { connect: { id: areaId } } : undefined,
            resourceModifier: config.resourceMod || 1.0,
            teleportCostMultiplier: config.teleportMult || 1.0,
            maxPartyUnits: config.partyMax || 100,
            ambientSfxPack: config.sfx || 'default_ambient',
            respawnPenaltyMult: config.respawnPenalty || 1.0,
            requiredLevel: Math.max(1, config.level - 5),
            isDiscoveryPoint: true,
            // Advanced RPG Features
            landmarkName: Math.random() > 0.9 ? `Landmark ${regionName}` : null,
            flavorText: `Kamu memasuki wilayah ${config.area} yang penuh misteri.`,
            discoveryXp: config.level * 20,
            spawnRateMultiplier: config.zoneType === 'BLACK' ? 1.5 : 1.0,
            eliteSpawnChance: config.zoneType === 'RED' ? 0.1 : 0.05,
            // Access Requirements
            minRequiredUnits: config.level > 50 ? Math.floor(config.level / 20) : 0,
            minRequiredHeroLevel: Math.max(1, config.level - 10),
            reputationRequirement: (zoneKey === 'CITADEL' || zoneKey === 'VILLAGE') ? 100 : 0,
            factionTributeRate: (zoneKey === 'CITADEL') ? 0.05 : 0.0,
            // Tactical Combat & Recovery
            elementalAffinity: config.element || 'NEUTRAL',
            terrainAttackMod: config.atkMod || 1.0,
            terrainDefenseMod: config.defMod || 1.0,
            innRecoveryRate: config.innRate || 1.0,
            // Micro-Economy & Blessings
            resourceScarcity: 1.0,
            marketDemandIndex: (zoneKey === 'CITADEL' || zoneKey === 'VILLAGE') ? 1.2 : 1.0,
            blessingType: Math.random() > 0.95 ? 'Blessing of Speed' : null,
            corruptionLevel: config.corruption || 0.0,
            sanctuaryPower: config.sanctuary || 0.0,
            dominanCaste: config.caste || 'NEUTRAL'
          }
        });

        // Add Hazards for dangerous zones
        if (zoneKey === 'BLACK' || zoneKey === 'BOSS') {
          await prisma.regionHazard.create({
            data: {
              regionId: regionId,
              hazardTypeId: hazards['MIASMA'].id,
              damage: config.level * 0.5,
              frequencySec: 5.0
            }
          });
        } else if (zoneKey === 'RED' && Math.random() > 0.7) {
          await prisma.regionHazard.create({
            data: {
              regionId: regionId,
              hazardTypeId: hazards['STORM'].id,
              damage: 20.0,
              frequencySec: 10.0
            }
          });
        }

        count++;
        if (count % 100 === 0) console.log(`Seeded ${count} regions...`);
      } catch (err) {
        console.error(`Error seeding region ${regionName} (ID: ${regionId}):`, err.message);
        throw err;
      }
    }
  }

  console.log(`--- Finished! Seeded ${count} regions. ---`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
