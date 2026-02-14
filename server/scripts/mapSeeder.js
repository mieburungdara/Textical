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
    'WATER': { zoneType: 'WATER', isSafe: true, level: 1, color: 'AZURE', area: 'The Azure Ocean', sfx: 'ocean_waves', teleportMult: 2.0, element: 'WATER', atkMod: 0.9, corruption: 0.0, sanctuary: 0.1, caste: 'AQUATIC', particles: 'OCEAN_MIST', fog: 0.02, stamina: 1.0, music: 'BGM_OCEAN', banditThreat: 0.0 },
    'GREEN': { zoneType: 'GREEN', isSafe: true, level: 1, color: 'VERDANT', area: 'The Verdant Wilds', sfx: 'forest_ambient', teleportMult: 1.0, element: 'EARTH', defMod: 1.05, corruption: 0.0, sanctuary: 0.2, caste: 'BEAST', particles: 'FOREST_LEAVES', fog: 0.05, stamina: 1.0, music: 'BGM_FOREST', banditThreat: 0.05 },
    'BLUE': { zoneType: 'BLUE', isSafe: true, level: 15, color: 'AZURE', area: 'The Azure Isles', sfx: 'coastal_breeze', teleportMult: 1.0, element: 'AIR', corruption: 0.0, sanctuary: 0.1, caste: 'BEAST', particles: 'FAIRY_DUST', skybox: 'SKY_TWILIGHT', fog: 0.03, stamina: 1.3, music: 'BGM_MYSTIC', banditThreat: 0.1 },
    'YELLOW': { zoneType: 'YELLOW', isSafe: false, level: 45, color: 'GOLDEN', area: 'The Golden Expanse', sfx: 'desert_wind', teleportMult: 1.2, element: 'LIGHT', corruption: 0.1, sanctuary: 0.0, caste: 'INSECTOID', particles: 'SAND_DUST', skybox: 'SKY_SUNNY', fog: 0.08, stamina: 1.5, music: 'BGM_DESERT', banditThreat: 0.25 },
    'RED': { zoneType: 'RED', isSafe: false, level: 80, color: 'CRIMSON', area: 'The Crimson Realm', sfx: 'war_drums', teleportMult: 1.5, resourceMod: 1.5, element: 'FIRE', atkMod: 1.1, corruption: 0.3, sanctuary: -0.2, caste: 'DEMON', particles: 'EMBER_SPARKS', skybox: 'SKY_BLOOD', fog: 0.12, stamina: 1.7, music: 'BGM_VOLCANO', banditThreat: 0.4 },
    'BLACK': { zoneType: 'BLACK', isSafe: false, level: 100, color: 'OBSIDIAN', area: 'The Obsidian Abyss', sfx: 'dark_whispers', teleportMult: 2.0, resourceMod: 3.0, respawnPenalty: 3.0, partyMax: 30, element: 'DARK', atkMod: 1.2, corruption: 0.7, sanctuary: -0.5, caste: 'SKELETON', particles: 'ABYSS_ASHES', skybox: 'SKY_ABYSS', fog: 0.2, stamina: 2.0, music: 'BGM_VOID', banditThreat: 0.6 },
    'BOSS': { zoneType: 'BOSS', isSafe: false, level: 100, color: 'OBSIDIAN', area: 'The Heart of Darkness', sfx: 'boss_ominous', teleportMult: 5.0, resourceMod: 5.0, partyMax: 1, element: 'DARK', atkMod: 1.5, defMod: 1.5, corruption: 1.0, sanctuary: -1.0, caste: 'DEMON', particles: 'DARK_ENERGY', skybox: 'SKY_VOID', fog: 0.25, stamina: 1.0, music: 'BGM_BOSS', banditThreat: 0.8 },
    'CITADEL': { zoneType: 'ROYAL', isSafe: true, level: 0, color: 'NEUTRAL', area: 'Kingdom Citadels', sfx: 'castle_hub', teleportMult: 0.5, element: 'NEUTRAL', innRate: 2.5, corruption: 0.0, sanctuary: 1.0, caste: 'HUMAN', plots: 100, rentMult: 2.0, skybox: 'SKY_CLEAR', fog: 0.01, stamina: 1.0, music: 'BGM_CASTLE', banditThreat: 0.0 },
    'VILLAGE': { zoneType: 'VILLAGE', isSafe: true, level: 0, color: 'NEUTRAL', area: 'Rural Settlements', sfx: 'village_life', teleportMult: 0.8, element: 'NEUTRAL', innRate: 1.5, corruption: 0.0, sanctuary: 0.5, caste: 'HUMAN', plots: 20, rentMult: 1.0, particles: 'POCKET_DUST', skybox: 'SKY_CLEAR', fog: 0.02, stamina: 1.0, music: 'BGM_VILLAGE', banditThreat: 0.0 },
    'BRIDGE': { zoneType: 'BRIDGE', isSafe: false, level: 50, color: 'NEUTRAL', area: 'The Great Crossings', sfx: 'bridge_wind', teleportMult: 1.2, element: 'AIR', corruption: 0.1, sanctuary: 0.0, caste: 'HUMANOID', particles: 'WIND_GUSTS', fog: 0.05, stamina: 1.0, music: 'BGM_HIGH', banditThreat: 0.3 },
    'CHASM': { zoneType: 'CHASM', isSafe: false, level: 100, color: 'OBSIDIAN', area: 'The Deep Chasms', sfx: 'abyss_wind', teleportMult: 3.0, element: 'DARK', corruption: 0.5, sanctuary: -0.4, caste: 'ZOMBIE', particles: 'ABYSS_VAPOR', skybox: 'SKY_DARK', fog: 0.3, stamina: 1.0, music: 'BGM_CHASM', banditThreat: 0.7 }
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
  const cleanupTables = [
    'regionHazard', 'regionResource', 'regionMonster', 'regionNPC',
    'regionConnection', 'activeEvent', 'regionTemplate', 'regionArea',
    'audioTrack', 'hazardType'
  ];
  
  for (const table of cleanupTables) {
    try {
      if (prisma[table]) {
        await prisma[table].deleteMany({});
      }
    } catch (e) {
      // console.log(`Notice: Could not clear ${table}`);
    }
  }
  console.log('Cleanup step finished.');

  // Pre-create Audio Tracks
  console.log('Creating Audio Tracks...');
  const audioTracksData = [
    { name: 'BGM_OCEAN', path: 'res://audio/bgm/ocean_calm.ogg' },
    { name: 'BGM_FOREST', path: 'res://audio/bgm/forest_deep.ogg' },
    { name: 'BGM_MYSTIC', path: 'res://audio/bgm/mystic_grove.ogg' },
    { name: 'BGM_DESERT', path: 'res://audio/bgm/desert_winds.ogg' },
    { name: 'BGM_VOLCANO', path: 'res://audio/bgm/volcanic_drums.ogg' },
    { name: 'BGM_VOID', path: 'res://audio/bgm/void_whispers.ogg' },
    { name: 'BGM_BOSS', path: 'res://audio/bgm/boss_theme.ogg' },
    { name: 'BGM_CASTLE', path: 'res://audio/bgm/castle_hall.ogg' },
    { name: 'BGM_VILLAGE', path: 'res://audio/bgm/village_peace.ogg' },
    { name: 'BGM_HIGH', path: 'res://audio/bgm/high_altitude.ogg' },
    { name: 'BGM_CHASM', path: 'res://audio/bgm/deep_cave.ogg' },
  ];

  const audioMap = new Map();
  for (const track of audioTracksData) {
    const created = await prisma.audioTrack.create({ data: track });
    audioMap.set(track.name, created.id);
  }

  // Lore Generator
  const generateLore = (zoneType, x, y) => {
    const prefixes = ['Ancient', 'Forgotten', 'Mystic', 'Sacred', 'Cursed', 'Lost', 'Eternal', 'Shadowed'];
    const suffixes = ['Whispers', 'Echoes', 'Shadows', 'Light', 'Silence', 'Power', 'Origins', 'Dust'];
    const zoneNames = {
      'WATER': 'Abyss', 'GREEN': 'Glade', 'BLUE': 'Isle', 'YELLOW': 'Sands', 'RED': 'Peak',
      'BLACK': 'Void', 'BOSS': 'Heart', 'ROYAL': 'Bastion', 'VILLAGE': 'Hearth', 'BRIDGE': 'Span', 'CHASM': 'Gorge'
    };
    
    const prefix = prefixes[(x + y) % prefixes.length];
    const suffix = suffixes[(x * y) % suffixes.length];
    const name = zoneNames[zoneType] || 'Land';
    
    return `The ${prefix} ${name} of ${suffix}. Sejarah mencatat wilayah ini sebagai saksi bisu peristiwa besar di masa lalu.`;
  };

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
            dominanCaste: config.caste || 'NEUTRAL',
            plotAvailability: config.plots || 0,
            rentCostMultiplier: config.rentMult || 1.0,
            particleEffectPack: config.particles || null,
            skyboxOverride: config.skybox || null,
            fogDensity: config.fog || 0.0,
            gatheringStaminaCost: config.stamina || 1.0,
            banditThreatLevel: config.banditThreat || 0.0,
            mapMusic: audioMap.get(config.music) ? { connect: { id: audioMap.get(config.music) } } : undefined,
            regionLoreSnippet: generateLore(config.zoneType, coord.x, coord.y)
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
            dominanCaste: config.caste || 'NEUTRAL',
            plotAvailability: config.plots || 0,
            rentCostMultiplier: config.rentMult || 1.0,
            particleEffectPack: config.particles || null,
            skyboxOverride: config.skybox || null,
            fogDensity: config.fog || 0.0,
            gatheringStaminaCost: config.stamina || 1.0,
            mapMusic: audioMap.get(config.music) ? { connect: { id: audioMap.get(config.music) } } : undefined,
            regionLoreSnippet: generateLore(config.zoneType, coord.x, coord.y)
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
        console.error(`Error seeding region ${regionName} (ID: ${regionId}) at [${coord.x}, ${coord.y}]:`, err.message);
        throw err;
      }
    }
  }

  console.log(`--- Finished! Seeded ${count} regions. ---`);

  console.log('Applying global defaults for leftover regions...');
  const defaultMusic = audioMap.get('BGM_VILLAGE') || 1;
  const updated = await prisma.regionTemplate.updateMany({
    where: {
      OR: [
        { mapMusicId: null },
        { regionLoreSnippet: null }
      ]
    },
    data: {
      mapMusicId: defaultMusic,
      regionLoreSnippet: "Wilayah kuno yang terlupakan oleh waktu. Hanya desau angin yang tersisa menceritakan kejayaan masa lalu.",
      banditThreatLevel: 0.05
    }
  });
  console.log(`Global defaults applied to ${updated.count} regions.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
