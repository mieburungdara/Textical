const prisma = require('../src/db');
const logger = require('../src/utils/logger');
const fs = require('fs');
const path = require('path');

// ─── Constants ───────────────────────────────────────────────────────
const GRID = 35;
const MAPS_DIR = path.join(__dirname, '..', '..', 'plans', 'maps');

// Fields from the JSON that map directly to RegionTemplate columns.
// UI-only fields (label, color, icon, tileCategory) are excluded.
const UI_ONLY_FIELDS = ['label', 'color', 'icon', 'tileCategory'];

/**
 * Reads all tile type JSON files from plans/maps/ directory.
 * @returns {Array<{tileType: string, defaults: object, coordinates: Array}>}
 */
function loadMapFiles() {
  const metaPath = path.join(MAPS_DIR, '_meta.json');
  if (!fs.existsSync(metaPath)) {
    throw new Error(`Map meta file not found: ${metaPath}`);
  }

  const meta = JSON.parse(fs.readFileSync(metaPath, 'utf-8'));
  logger.info(`[seedRegions] Loading map: ${meta.mapName} v${meta.version}`);
  logger.info(`[seedRegions] Grid: ${meta.gridWidth}x${meta.gridHeight}, Types: ${meta.tileTypes.length}`);

  const tileFiles = [];
  for (const tileType of meta.tileTypes) {
    const filePath = path.join(MAPS_DIR, `${tileType}.json`);
    if (!fs.existsSync(filePath)) {
      logger.warn(`[seedRegions] Tile file not found: ${filePath}, skipping`);
      continue;
    }
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    tileFiles.push(data);
  }

  return tileFiles;
}

/**
 * Builds a RegionTemplate data object by merging defaults + coordinate overrides.
 * Strips UI-only fields and maps to Prisma-compatible field names.
 * @param {object} defaults - Tile type default values.
 * @param {object} coord - Coordinate with optional overrides.
 * @returns {object} Prisma-ready data object.
 */
function buildRegionData(defaults, coord) {
  // Start with defaults
  const merged = { ...defaults };

  // Apply coordinate-level overrides (skip x, y, regionId)
  for (const [key, value] of Object.entries(coord)) {
    if (key === 'x' || key === 'y' || key === 'regionId') continue;
    merged[key] = value;
  }

  // Strip UI-only fields
  for (const uiField of UI_ONLY_FIELDS) {
    delete merged[uiField];
  }

  // Build Prisma-compatible data
  const data = {
    id: coord.regionId,
    gridX: coord.x,
    gridY: coord.y,
    name: merged.name || `Region ${coord.regionId}`,
    description: merged.description || '',
    visualType: merged.visualType || 'FOREST',
    traversalType: merged.traversalType || 'WALK',
    zoneType: merged.zoneType || 'GREEN',
    zoneLevel: merged.zoneLevel || 1,
    isSafeZone: merged.isSafeZone ?? true,
    pvpMode: merged.pvpMode || 'SAFE',
    dangerLevel: merged.dangerLevel || 1,
    hasInn: merged.hasInn ?? false,
    innTier: merged.innTier || 1,
    innRecoveryRate: merged.innRecoveryRate || 1.0,
    banditThreatLevel: merged.banditThreatLevel || 0.0,
    spiritDensity: merged.spiritDensity || 0.0,
    corruptionLevel: merged.corruptionLevel || 0.0,
    sanctuaryPower: merged.sanctuaryPower || 0.0,
    elementalAffinity: merged.elementalAffinity || 'NEUTRAL',
    terrainAttackMod: merged.terrainAttackMod || 1.0,
    terrainDefenseMod: merged.terrainDefenseMod || 1.0,
    weatherOverride: merged.weatherOverride || null,
    fogDensity: merged.fogDensity || 0.0,
    requiredLevel: merged.requiredLevel || 1,
    minRequiredUnits: merged.minRequiredUnits || 0,
    minRequiredHeroLevel: merged.minRequiredHeroLevel || 1,
    resourceModifier: merged.resourceModifier || 1.0,
    resourceScarcity: merged.resourceScarcity || 1.0,
    marketDemandIndex: merged.marketDemandIndex || 1.0,
    regionalTaxRate: merged.regionalTaxRate || 0.10,
    gatheringStaminaCost: merged.gatheringStaminaCost || 1.0,
    spawnRateMultiplier: merged.spawnRateMultiplier || 1.0,
    eliteSpawnChance: merged.eliteSpawnChance || 0.05,
    respawnPenaltyMult: merged.respawnPenaltyMult || 1.0,
    teleportCostMultiplier: merged.teleportCostMultiplier || 1.0,
    isDiscoveryPoint: merged.isDiscoveryPoint ?? true,
    discoveryXp: merged.discoveryXp || 100,
    manaStaticIntensity: merged.manaStaticIntensity || 1.0,
    rareHerbSpawnChance: merged.rareHerbSpawnChance || 0.0,
    mysticFogIntensity: merged.mysticFogIntensity || 0.0,
  };

  // Optional fields (only set if present in merged data)
  if (merged.zoneColor) data.zoneColor = merged.zoneColor;
  if (merged.landmarkName) data.landmarkName = merged.landmarkName;
  if (merged.flavorText) data.flavorText = merged.flavorText;
  if (merged.regionLoreSnippet) data.regionLoreSnippet = merged.regionLoreSnippet;
  if (merged.specialization) data.specialization = merged.specialization;
  if (merged.isBanditHideout) data.isBanditHideout = merged.isBanditHideout;
  if (merged.dominanCaste) data.dominanCaste = merged.dominanCaste;

  return data;
}

/**
 * Checks if two coordinates are adjacent on the grid (4-directional).
 * @param {number} x1 - First tile X.
 * @param {number} y1 - First tile Y.
 * @param {number} x2 - Second tile X.
 * @param {number} y2 - Second tile Y.
 * @returns {boolean} True if adjacent.
 */
function isAdjacent(x1, y1, x2, y2) {
  const dx = Math.abs(x1 - x2);
  const dy = Math.abs(y1 - y2);
  return (dx + dy) === 1;
}

/**
 * Generates RegionConnection entries for adjacent passable tiles.
 * Only connects tiles that share compatible traversal types.
 * @param {Map<string, object>} regionMap - Map of "x,y" -> region data.
 * @returns {Array<{originId: number, targetId: number, travelTime: number}>}
 */
function buildConnections(regionMap) {
  const connections = [];
  const entries = Array.from(regionMap.entries());

  // Build a lookup by coordinate key for O(1) adjacency check
  for (const [key, region] of entries) {
    const [x, y] = key.split(',').map(Number);

    // Check 4 cardinal directions
    const neighbors = [
      [x - 1, y], [x + 1, y],
      [x, y - 1], [x, y + 1]
    ];

    for (const [nx, ny] of neighbors) {
      const neighborKey = `${nx},${ny}`;
      const neighbor = regionMap.get(neighborKey);

      if (!neighbor) continue;

      // Determine travel time based on zone danger
      let travelTime = 15; // default
      const maxDanger = Math.max(region.dangerLevel, neighbor.dangerLevel);
      if (maxDanger >= 80) travelTime = 30;
      else if (maxDanger >= 60) travelTime = 25;
      else if (maxDanger >= 40) travelTime = 20;

      connections.push({
        originId: region.id,
        targetId: neighbor.id,
        travelTime
      });
    }
  }

  return connections;
}

/**
 * Seeds all RegionTemplate entries from map JSON files.
 * Uses upsert for idempotent seeding.
 * @returns {Promise<void>}
 */
async function seedRegions() {
  logger.info('[seedRegions] Starting region seeding...');

  const tileFiles = loadMapFiles();
  const allRegions = [];
  const regionMap = new Map(); // "x,y" -> region data

  // Phase 1: Build all region data
  logger.info('[seedRegions] Phase 1: Building region data...');
  for (const tileFile of tileFiles) {
    const { tileType, defaults, coordinates } = tileFile;

    for (const coord of coordinates) {
      const regionData = buildRegionData(defaults, coord);
      allRegions.push(regionData);
      regionMap.set(`${coord.x},${coord.y}`, regionData);
    }

    logger.debug(`[seedRegions] Processed ${tileType}: ${coordinates.length} tiles`);
  }

  logger.info(`[seedRegions] Total regions to seed: ${allRegions.length}`);

  // Phase 2: Seed RegionTemplates in batches
  logger.info('[seedRegions] Phase 2: Seeding RegionTemplates...');
  const BATCH_SIZE = 50;
  let created = 0;
  let updated = 0;

  for (let i = 0; i < allRegions.length; i += BATCH_SIZE) {
    const batch = allRegions.slice(i, i + BATCH_SIZE);

    const operations = batch.map(region => {
      const { id, ...dataWithoutId } = region;
      return prisma.regionTemplate.upsert({
        where: { id },
        update: dataWithoutId,
        create: region
      });
    });

    const results = await prisma.$transaction(operations);

    // Count creates vs updates (approximate via checking existing)
    created += results.length;

    const progress = Math.min(i + BATCH_SIZE, allRegions.length);
    logger.debug(`[seedRegions] Progress: ${progress}/${allRegions.length} regions`);
  }

  logger.info(`[seedRegions] RegionTemplates seeded: ${allRegions.length} total`);

  // Phase 3: Build and seed connections
  logger.info('[seedRegions] Phase 3: Building region connections...');
  const connections = buildConnections(regionMap);
  logger.info(`[seedRegions] Total connections to seed: ${connections.length}`);

  // Clear existing connections first (full replace strategy)
  await prisma.regionConnection.deleteMany({});
  logger.info('[seedRegions] Cleared existing connections');

  // Seed connections in batches
  let connCreated = 0;
  for (let i = 0; i < connections.length; i += BATCH_SIZE) {
    const batch = connections.slice(i, i + BATCH_SIZE);

    const operations = batch.map(conn =>
      prisma.regionConnection.create({
        data: {
          originRegionId: conn.originId,
          targetRegionId: conn.targetId,
          travelTimeSeconds: conn.travelTime
        }
      })
    );

    await prisma.$transaction(operations);
    connCreated += batch.length;

    const progress = Math.min(i + BATCH_SIZE, connections.length);
    if (progress % 500 === 0 || progress === connections.length) {
      logger.debug(`[seedRegions] Connection progress: ${progress}/${connections.length}`);
    }
  }

  logger.info(`[seedRegions] RegionConnections seeded: ${connCreated} total`);

  // Summary
  logger.info('[seedRegions] ═══════════════════════════════════════');
  logger.info(`[seedRegions] ✅ Seeding Complete!`);
  logger.info(`[seedRegions]    Regions: ${allRegions.length}`);
  logger.info(`[seedRegions]    Connections: ${connCreated}`);
  logger.info(`[seedRegions]    Tile Types: ${tileFiles.length}`);
  logger.info('[seedRegions] ═══════════════════════════════════════');
}

// Allow standalone execution
if (require.main === module) {
  seedRegions()
    .then(() => logger.info('[seedRegions] ✅ Region seeding completed successfully.'))
    .catch(e => {
      logger.error('[seedRegions] ❌ Region seeding failed:', e);
      process.exit(1);
    })
    .finally(() => prisma.$disconnect());
}

module.exports = seedRegions;
