/**
 * Map Data Generator for Textical
 * 
 * Reads the legacy MAPS.json and generates split map files per tile type
 * with full RegionTemplate-compatible fields for database seeding.
 * 
 * RegionId formula: x * 35 + y
 * Output: plans/maps/{TILE_TYPE}.json + _meta.json
 * 
 * Usage: node plans/generate_map_files.js
 */

const fs = require('fs');
const path = require('path');

// ─── Constants ───────────────────────────────────────────────────────
const GRID = 35;
const calcId = (x, y) => x * GRID + y;

// ─── Read Source ─────────────────────────────────────────────────────
const sourceData = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'MAPS.json'), 'utf-8')
);

// ─── Tile Type Defaults ──────────────────────────────────────────────
// Each set of defaults maps directly to RegionTemplate DB fields
// plus additional UI/visual fields (label, color, icon, tileCategory)

const tileConfigs = {
  WATER: {
    label: "Open Waters",
    color: "#2980B9",
    icon: "water_tile",
    tileCategory: "ZONE",
    name: "Open Sea",
    description: "Vast ocean waters stretch endlessly beneath an unforgiving sky. The deep currents carry the whispers of drowned sailors and the promise of undiscovered shores.",
    visualType: "OCEAN",
    traversalType: "BOAT",
    zoneType: "WATER",
    zoneLevel: 15,
    zoneColor: null,
    isSafeZone: false,
    pvpMode: "SAFE",
    dangerLevel: 20,
    banditThreatLevel: 0.10,
    spiritDensity: 0.05,
    corruptionLevel: 0.0,
    sanctuaryPower: 0.0,
    elementalAffinity: "WATER",
    terrainAttackMod: 0.9,
    terrainDefenseMod: 0.9,
    weatherOverride: null,
    fogDensity: 0.1,
    requiredLevel: 5,
    minRequiredUnits: 0,
    minRequiredHeroLevel: 1,
    hasInn: false,
    innTier: 1,
    innRecoveryRate: 1.0,
    resourceModifier: 0.8,
    resourceScarcity: 1.2,
    marketDemandIndex: 1.0,
    regionalTaxRate: 0.10,
    gatheringStaminaCost: 1.5,
    spawnRateMultiplier: 0.8,
    eliteSpawnChance: 0.03,
    respawnPenaltyMult: 1.5,
    teleportCostMultiplier: 2.0,
    isDiscoveryPoint: true,
    discoveryXp: 50,
    manaStaticIntensity: 1.0,
    rareHerbSpawnChance: 0.0,
    mysticFogIntensity: 0.1
  },

  GREEN: {
    label: "Verdant Plains",
    color: "#27AE60",
    icon: "green_tile",
    tileCategory: "ZONE",
    name: "Verdant Field",
    description: "Lush green meadows where gentle breezes carry the scent of wildflowers. A safe haven for novice adventurers taking their first steps into the world.",
    visualType: "FOREST",
    traversalType: "WALK",
    zoneType: "GREEN",
    zoneLevel: 5,
    zoneColor: "VERDANT",
    isSafeZone: true,
    pvpMode: "SAFE",
    dangerLevel: 10,
    banditThreatLevel: 0.05,
    spiritDensity: 0.02,
    corruptionLevel: 0.0,
    sanctuaryPower: 0.0,
    elementalAffinity: "NEUTRAL",
    terrainAttackMod: 1.0,
    terrainDefenseMod: 1.0,
    weatherOverride: null,
    fogDensity: 0.0,
    requiredLevel: 1,
    minRequiredUnits: 0,
    minRequiredHeroLevel: 1,
    hasInn: false,
    innTier: 1,
    innRecoveryRate: 1.0,
    resourceModifier: 1.0,
    resourceScarcity: 1.0,
    marketDemandIndex: 1.0,
    regionalTaxRate: 0.10,
    gatheringStaminaCost: 1.0,
    spawnRateMultiplier: 1.0,
    eliteSpawnChance: 0.05,
    respawnPenaltyMult: 1.0,
    teleportCostMultiplier: 1.0,
    isDiscoveryPoint: true,
    discoveryXp: 75,
    manaStaticIntensity: 1.0,
    rareHerbSpawnChance: 0.05,
    mysticFogIntensity: 0.0
  },

  YELLOW: {
    label: "Amber Steppe",
    color: "#F1C40F",
    icon: "yellow_tile",
    tileCategory: "ZONE",
    name: "Amber Steppe",
    description: "Sun-scorched grasslands where the wind howls across endless golden plains. Bandits patrol the dusty roads, and only the prepared survive.",
    visualType: "DESERT",
    traversalType: "WALK",
    zoneType: "YELLOW",
    zoneLevel: 25,
    zoneColor: "GOLDEN",
    isSafeZone: false,
    pvpMode: "SAFE",
    dangerLevel: 30,
    banditThreatLevel: 0.15,
    spiritDensity: 0.10,
    corruptionLevel: 0.05,
    sanctuaryPower: 0.0,
    elementalAffinity: "NEUTRAL",
    terrainAttackMod: 1.0,
    terrainDefenseMod: 1.0,
    weatherOverride: null,
    fogDensity: 0.0,
    requiredLevel: 10,
    minRequiredUnits: 0,
    minRequiredHeroLevel: 5,
    hasInn: false,
    innTier: 1,
    innRecoveryRate: 1.0,
    resourceModifier: 1.2,
    resourceScarcity: 0.8,
    marketDemandIndex: 1.1,
    regionalTaxRate: 0.10,
    gatheringStaminaCost: 1.2,
    spawnRateMultiplier: 1.2,
    eliteSpawnChance: 0.08,
    respawnPenaltyMult: 1.2,
    teleportCostMultiplier: 1.0,
    isDiscoveryPoint: true,
    discoveryXp: 100,
    manaStaticIntensity: 1.0,
    rareHerbSpawnChance: 0.03,
    mysticFogIntensity: 0.0
  },

  BLUE: {
    label: "Azure Highlands",
    color: "#3498DB",
    icon: "blue_tile",
    tileCategory: "ZONE",
    name: "Azure Highlands",
    description: "Misty highlands where ancient ruins peek through thick fog. The spirits of forgotten warriors still roam these twilight paths.",
    visualType: "AUTUMN",
    traversalType: "WALK",
    zoneType: "BLUE",
    zoneLevel: 40,
    zoneColor: "AZURE",
    isSafeZone: false,
    pvpMode: "CONSENT",
    dangerLevel: 50,
    banditThreatLevel: 0.20,
    spiritDensity: 0.15,
    corruptionLevel: 0.10,
    sanctuaryPower: 0.0,
    elementalAffinity: "NEUTRAL",
    terrainAttackMod: 1.05,
    terrainDefenseMod: 0.95,
    weatherOverride: null,
    fogDensity: 0.15,
    requiredLevel: 20,
    minRequiredUnits: 0,
    minRequiredHeroLevel: 10,
    hasInn: false,
    innTier: 1,
    innRecoveryRate: 1.0,
    resourceModifier: 1.4,
    resourceScarcity: 0.7,
    marketDemandIndex: 1.2,
    regionalTaxRate: 0.12,
    gatheringStaminaCost: 1.3,
    spawnRateMultiplier: 1.3,
    eliteSpawnChance: 0.10,
    respawnPenaltyMult: 1.5,
    teleportCostMultiplier: 1.5,
    isDiscoveryPoint: true,
    discoveryXp: 150,
    manaStaticIntensity: 1.2,
    rareHerbSpawnChance: 0.08,
    mysticFogIntensity: 0.2
  },

  RED: {
    label: "Crimson Wastes",
    color: "#E74C3C",
    icon: "red_tile",
    tileCategory: "ZONE",
    name: "Crimson Wastes",
    description: "Scorched earth where volcanic ash blankets the ground and the air shimmers with heat. Only battle-hardened warriors dare tread these cursed lands.",
    visualType: "VOLCANO",
    traversalType: "WALK",
    zoneType: "RED",
    zoneLevel: 60,
    zoneColor: "CRIMSON",
    isSafeZone: false,
    pvpMode: "RESTRICTED",
    dangerLevel: 70,
    banditThreatLevel: 0.30,
    spiritDensity: 0.20,
    corruptionLevel: 0.25,
    sanctuaryPower: 0.0,
    elementalAffinity: "FIRE",
    terrainAttackMod: 1.1,
    terrainDefenseMod: 0.9,
    weatherOverride: null,
    fogDensity: 0.2,
    requiredLevel: 35,
    minRequiredUnits: 0,
    minRequiredHeroLevel: 20,
    hasInn: false,
    innTier: 1,
    innRecoveryRate: 1.0,
    resourceModifier: 1.8,
    resourceScarcity: 0.5,
    marketDemandIndex: 1.5,
    regionalTaxRate: 0.15,
    gatheringStaminaCost: 1.5,
    spawnRateMultiplier: 1.5,
    eliteSpawnChance: 0.15,
    respawnPenaltyMult: 2.0,
    teleportCostMultiplier: 2.0,
    isDiscoveryPoint: true,
    discoveryXp: 200,
    manaStaticIntensity: 1.5,
    rareHerbSpawnChance: 0.10,
    mysticFogIntensity: 0.3
  },

  BLACK: {
    label: "Obsidian Void",
    color: "#1C1C1C",
    icon: "black_tile",
    tileCategory: "ZONE",
    name: "Obsidian Void",
    description: "The heart of corruption where reality itself fractures. Dark energy pulses through the cracked earth, and monstrous entities patrol endlessly. Only full war-parties survive.",
    visualType: "HELL",
    traversalType: "WALK",
    zoneType: "BLACK",
    zoneLevel: 85,
    zoneColor: "OBSIDIAN",
    isSafeZone: false,
    pvpMode: "OPEN",
    dangerLevel: 90,
    banditThreatLevel: 0.50,
    spiritDensity: 0.40,
    corruptionLevel: 0.80,
    sanctuaryPower: 0.0,
    elementalAffinity: "DARK",
    terrainAttackMod: 1.2,
    terrainDefenseMod: 0.8,
    weatherOverride: "ASH_STORM",
    fogDensity: 0.5,
    requiredLevel: 50,
    minRequiredUnits: 30,
    minRequiredHeroLevel: 30,
    hasInn: false,
    innTier: 1,
    innRecoveryRate: 1.0,
    resourceModifier: 3.0,
    resourceScarcity: 0.3,
    marketDemandIndex: 2.0,
    regionalTaxRate: 0.0,
    gatheringStaminaCost: 2.0,
    spawnRateMultiplier: 2.0,
    eliteSpawnChance: 0.25,
    respawnPenaltyMult: 3.0,
    teleportCostMultiplier: 3.0,
    isDiscoveryPoint: true,
    discoveryXp: 500,
    manaStaticIntensity: 2.0,
    rareHerbSpawnChance: 0.15,
    mysticFogIntensity: 0.7
  },

  CHASM: {
    label: "The Great Rift",
    color: "#5D4E37",
    icon: "chasm_tile",
    tileCategory: "TERRAIN",
    name: "The Great Rift",
    description: "A bottomless fissure that splits the continent in two. Howling winds surge from the abyss below, and only those who can fly dare cross its yawning maw.",
    visualType: "WASTELAND",
    traversalType: "FLY",
    zoneType: "CHASM",
    zoneLevel: 40,
    zoneColor: null,
    isSafeZone: false,
    pvpMode: "SAFE",
    dangerLevel: 50,
    banditThreatLevel: 0.0,
    spiritDensity: 0.30,
    corruptionLevel: 0.15,
    sanctuaryPower: 0.0,
    elementalAffinity: "WIND",
    terrainAttackMod: 0.85,
    terrainDefenseMod: 0.85,
    weatherOverride: "GALE",
    fogDensity: 0.6,
    requiredLevel: 25,
    minRequiredUnits: 0,
    minRequiredHeroLevel: 15,
    hasInn: false,
    innTier: 1,
    innRecoveryRate: 1.0,
    resourceModifier: 0.5,
    resourceScarcity: 2.0,
    marketDemandIndex: 1.0,
    regionalTaxRate: 0.0,
    gatheringStaminaCost: 2.0,
    spawnRateMultiplier: 0.5,
    eliteSpawnChance: 0.20,
    respawnPenaltyMult: 2.5,
    teleportCostMultiplier: 2.5,
    isDiscoveryPoint: true,
    discoveryXp: 200,
    manaStaticIntensity: 0.5,
    rareHerbSpawnChance: 0.0,
    mysticFogIntensity: 0.5
  },

  CITADEL: {
    label: "Royal Citadel",
    color: "#F39C12",
    icon: "citadel_tile",
    tileCategory: "LANDMARK",
    name: "Royal Citadel",
    description: "A towering fortress of stone and steel, where banners fly high and the rule of law holds absolute. Merchants, soldiers, and adventurers gather within its walls.",
    visualType: "CASTLE",
    traversalType: "WALK",
    zoneType: "ROYAL",
    zoneLevel: 1,
    zoneColor: "NEUTRAL",
    isSafeZone: true,
    pvpMode: "SAFE",
    dangerLevel: 0,
    banditThreatLevel: 0.0,
    spiritDensity: 0.0,
    corruptionLevel: 0.0,
    sanctuaryPower: 1.0,
    elementalAffinity: "NEUTRAL",
    terrainAttackMod: 1.0,
    terrainDefenseMod: 1.5,
    weatherOverride: null,
    fogDensity: 0.0,
    requiredLevel: 1,
    minRequiredUnits: 0,
    minRequiredHeroLevel: 1,
    hasInn: true,
    innTier: 3,
    innRecoveryRate: 2.0,
    resourceModifier: 0.5,
    resourceScarcity: 0.5,
    marketDemandIndex: 0.8,
    regionalTaxRate: 0.08,
    gatheringStaminaCost: 1.0,
    spawnRateMultiplier: 0.0,
    eliteSpawnChance: 0.0,
    respawnPenaltyMult: 0.5,
    teleportCostMultiplier: 0.5,
    isDiscoveryPoint: true,
    discoveryXp: 250,
    manaStaticIntensity: 1.0,
    rareHerbSpawnChance: 0.0,
    mysticFogIntensity: 0.0
  },

  BRIDGE: {
    label: "Border Crossing",
    color: "#95A5A6",
    icon: "bridge_tile",
    tileCategory: "LANDMARK",
    name: "Border Crossing",
    description: "A fortified bridge spanning the Great Rift, serving as the only land passage between the divided regions. Weary travelers find rest at the small outpost built into its pillars.",
    visualType: "TOWN",
    traversalType: "WALK",
    zoneType: "GREEN",
    zoneLevel: 10,
    zoneColor: "VERDANT",
    isSafeZone: true,
    pvpMode: "SAFE",
    dangerLevel: 5,
    banditThreatLevel: 0.02,
    spiritDensity: 0.01,
    corruptionLevel: 0.0,
    sanctuaryPower: 0.3,
    elementalAffinity: "NEUTRAL",
    terrainAttackMod: 1.0,
    terrainDefenseMod: 1.0,
    weatherOverride: null,
    fogDensity: 0.0,
    requiredLevel: 1,
    minRequiredUnits: 0,
    minRequiredHeroLevel: 1,
    hasInn: true,
    innTier: 1,
    innRecoveryRate: 1.0,
    resourceModifier: 0.8,
    resourceScarcity: 1.0,
    marketDemandIndex: 1.0,
    regionalTaxRate: 0.10,
    gatheringStaminaCost: 1.0,
    spawnRateMultiplier: 0.0,
    eliteSpawnChance: 0.0,
    respawnPenaltyMult: 1.0,
    teleportCostMultiplier: 1.0,
    isDiscoveryPoint: true,
    discoveryXp: 150,
    manaStaticIntensity: 1.0,
    rareHerbSpawnChance: 0.0,
    mysticFogIntensity: 0.0
  },

  VILLAGE: {
    label: "Frontier Village",
    color: "#8E44AD",
    icon: "village_tile",
    tileCategory: "LANDMARK",
    name: "Frontier Village",
    description: "A humble settlement nestled at the edge of civilization. The locals are wary of strangers but willing to trade with those who prove their worth.",
    visualType: "TOWN",
    traversalType: "WALK",
    zoneType: "GREEN",
    zoneLevel: 5,
    zoneColor: "VERDANT",
    isSafeZone: true,
    pvpMode: "SAFE",
    dangerLevel: 3,
    banditThreatLevel: 0.01,
    spiritDensity: 0.01,
    corruptionLevel: 0.0,
    sanctuaryPower: 0.5,
    elementalAffinity: "NEUTRAL",
    terrainAttackMod: 1.0,
    terrainDefenseMod: 1.2,
    weatherOverride: null,
    fogDensity: 0.0,
    requiredLevel: 1,
    minRequiredUnits: 0,
    minRequiredHeroLevel: 1,
    hasInn: true,
    innTier: 2,
    innRecoveryRate: 1.5,
    resourceModifier: 1.0,
    resourceScarcity: 1.0,
    marketDemandIndex: 1.0,
    regionalTaxRate: 0.08,
    gatheringStaminaCost: 1.0,
    spawnRateMultiplier: 0.0,
    eliteSpawnChance: 0.0,
    respawnPenaltyMult: 0.8,
    teleportCostMultiplier: 0.8,
    isDiscoveryPoint: true,
    discoveryXp: 100,
    manaStaticIntensity: 1.0,
    rareHerbSpawnChance: 0.0,
    mysticFogIntensity: 0.0
  },

  BOSS: {
    label: "The Abyssal Throne",
    color: "#000000",
    icon: "boss_tile",
    tileCategory: "LANDMARK",
    name: "The Abyssal Throne",
    description: "The epicenter of all corruption. A monstrous throne of obsidian and bone rises from the fractured earth, pulsing with dark energy that warps reality itself. Only the mightiest war-parties dare challenge what sits upon it.",
    visualType: "HELL",
    traversalType: "WALK",
    zoneType: "BLACK",
    zoneLevel: 100,
    zoneColor: "OBSIDIAN",
    isSafeZone: false,
    pvpMode: "OPEN",
    dangerLevel: 100,
    banditThreatLevel: 0.0,
    spiritDensity: 1.0,
    corruptionLevel: 1.0,
    sanctuaryPower: 0.0,
    elementalAffinity: "DARK",
    terrainAttackMod: 0.8,
    terrainDefenseMod: 0.8,
    weatherOverride: "BLOOD_RAIN",
    fogDensity: 0.8,
    requiredLevel: 50,
    minRequiredUnits: 30,
    minRequiredHeroLevel: 40,
    hasInn: false,
    innTier: 1,
    innRecoveryRate: 1.0,
    resourceModifier: 5.0,
    resourceScarcity: 0.1,
    marketDemandIndex: 3.0,
    regionalTaxRate: 0.0,
    gatheringStaminaCost: 3.0,
    spawnRateMultiplier: 3.0,
    eliteSpawnChance: 0.50,
    respawnPenaltyMult: 5.0,
    teleportCostMultiplier: 5.0,
    isDiscoveryPoint: true,
    discoveryXp: 1000,
    manaStaticIntensity: 3.0,
    rareHerbSpawnChance: 0.25,
    mysticFogIntensity: 1.0
  }
};

// ─── Special Regions (Unique Lore Overrides) ─────────────────────────
// Key format: "TILE_TYPE:x,y"
// These override defaults for specific coordinates

const specialRegions = {
  // ── WATER Specials ──
  "WATER:1,8": {
    name: "Pirate's Cove",
    description: "A hidden inlet carved into the cliff face, where smugglers anchor their vessels under cover of night. Barrels of stolen goods and frayed rope ladders line the rocky shore. The Crimson Flag pirates claim this territory as their own.",
    landmarkName: "The Smuggler's Dock",
    banditThreatLevel: 0.50,
    dangerLevel: 35,
    visualType: "SHIP",
    isBanditHideout: true
  },
  "WATER:33,9": {
    name: "Siren's Strait",
    description: "Cursed waters where ethereal songs drift through perpetual fog. Ghostly lights dance beneath the surface, luring unwary sailors to watery graves. The spirits of drowned mariners guard treasures lost to the deep.",
    spiritDensity: 0.60,
    dangerLevel: 40,
    fogDensity: 0.7,
    mysticFogIntensity: 0.8,
    visualType: "OCEAN"
  },
  "WATER:0,17": {
    name: "Leviathan's Rest",
    description: "The deepest trench in the western ocean, where ancient sea serpents slumber in the abyssal dark. Fishermen speak of shadows larger than galleons passing beneath their hulls.",
    dangerLevel: 55,
    spiritDensity: 0.30,
    elementalAffinity: "WATER",
    spawnRateMultiplier: 2.0,
    eliteSpawnChance: 0.20
  },

  // ── GREEN Specials ──
  "GREEN:8,11": {
    name: "Ancient Grove",
    description: "A sacred circle of millennium-old trees whose roots dig deep into ley lines of pure mana. Druids once gathered here to commune with nature spirits. The air shimmers with residual magic, and rare herbs bloom in the dappled light.",
    landmarkName: "The Elder Circle",
    spiritDensity: 0.25,
    rareHerbSpawnChance: 0.20,
    manaStaticIntensity: 2.0,
    elementalAffinity: "EARTH",
    visualType: "FAIRY"
  },
  "GREEN:12,14": {
    name: "Hunter's Encampment",
    description: "A well-established camp where seasoned hunters gather to trade pelts and share tales of the wild. Smoking racks line the perimeter, and the scent of cured leather hangs heavy in the air.",
    resourceModifier: 1.5,
    dangerLevel: 5,
    gatheringStaminaCost: 0.8
  },

  // ── YELLOW Specials ──
  "YELLOW:14,4": {
    name: "Sandstorm Outpost",
    description: "A fortified waystation half-buried in perpetual sandstorms. Its thick stone walls offer the only shelter for miles, though the price of entry is steep. Desert nomads trade exotic wares within.",
    weatherOverride: "SANDSTORM",
    fogDensity: 0.4,
    terrainAttackMod: 0.85,
    terrainDefenseMod: 0.85,
    visualType: "DESERT"
  },
  "YELLOW:20,3": {
    name: "Bandit's Crossing",
    description: "A notorious stretch of road controlled by the Crimson Flag bandit clan. Ambushes are almost guaranteed, and only well-armed caravans dare pass through. The bandits have fortified the surrounding hills with watchtowers.",
    banditThreatLevel: 0.60,
    dangerLevel: 45,
    isBanditHideout: true,
    terrainDefenseMod: 0.8
  },
  "YELLOW:15,9": {
    name: "Sunlit Clearing",
    description: "A mystical glade where perpetual golden sunlight breaks through the canopy regardless of weather. Scholars believe a fragment of divine power is embedded in the earth, granting restorative properties to those who rest here.",
    elementalAffinity: "LIGHT",
    innRecoveryRate: 1.5,
    sanctuaryPower: 0.3,
    dangerLevel: 15,
    visualType: "GARDEN"
  },

  // ── BLUE Specials ──
  "BLUE:10,5": {
    name: "Frozen Tarn",
    description: "An eternally frozen lake surrounded by crystalline ice formations that sing in the wind. Beneath the translucent surface, shadows of ancient creatures are preserved in perfect stillness. Ice elementals guard the shore.",
    elementalAffinity: "WATER",
    weatherOverride: "BLIZZARD",
    visualType: "ICE",
    terrainAttackMod: 0.90,
    terrainDefenseMod: 1.10,
    dangerLevel: 55
  },
  "BLUE:24,3": {
    name: "Twilight Reef",
    description: "A coastal zone where bioluminescent coral formations create an otherworldly glow at dusk. Rare aquatic creatures spawn among the tide pools, and alchemists pay handsomely for the luminous extracts harvested here.",
    visualType: "CORAL",
    resourceModifier: 2.0,
    rareHerbSpawnChance: 0.15,
    elementalAffinity: "WATER",
    dangerLevel: 40
  },
  "BLUE:11,10": {
    name: "Misty Marshland",
    description: "A treacherous swamp where thick fog reduces visibility to mere feet. Poisonous vapors rise from stagnant pools, and the squelching ground can swallow the unwary whole. Those who know the safe paths find rare medicinal plants.",
    visualType: "SWAMP",
    fogDensity: 0.6,
    dangerLevel: 55,
    terrainAttackMod: 0.90,
    terrainDefenseMod: 0.90,
    rareHerbSpawnChance: 0.12
  },

  // ── RED Specials ──
  "RED:16,7": {
    name: "Scorched Battleground",
    description: "The charred remains of a legendary battle between fire titans and mortal armies. The ground still smolders centuries later, and fragments of enchanted weapons lie half-melted in the ash. Fire elementals dance among the ruins.",
    elementalAffinity: "FIRE",
    terrainAttackMod: 1.25,
    terrainDefenseMod: 0.75,
    dangerLevel: 80,
    spawnRateMultiplier: 2.0,
    visualType: "LAVA"
  },
  "RED:18,10": {
    name: "Cursed Barrows",
    description: "Ancient burial mounds corrupted by necromantic energy. The dead do not rest here — skeletal warriors patrol the fog-shrouded hills, and the wails of restless spirits echo through the night. Exorcists find endless work.",
    visualType: "GRAVEYARD",
    spiritDensity: 0.50,
    dominanCaste: "SKELETON",
    dangerLevel: 75,
    corruptionLevel: 0.40
  },

  // ── CHASM Specials ──
  "CHASM:17,7": {
    name: "Howling Abyss",
    description: "The deepest point of the Great Rift, where hurricane-force winds surge upward from unfathomable depths. The howling is said to be the voice of a trapped elder god. Those who fly too close risk being torn apart.",
    dangerLevel: 70,
    terrainAttackMod: 0.70,
    terrainDefenseMod: 0.70,
    weatherOverride: "HURRICANE",
    fogDensity: 0.8
  },

  // ── BLACK Specials ──
  "BLACK:17,16": {
    name: "The Void Gate",
    description: "A tear in the fabric of reality through which pure darkness seeps into the mortal world. The gate pulses with anti-mana, nullifying protective enchantments. It is said to be the entrance to the realm of the Dark Sovereign.",
    corruptionLevel: 0.95,
    manaStaticIntensity: 0.1,
    dangerLevel: 95,
    fogDensity: 0.9
  },
  "BLACK:16,17": {
    name: "Corruption Wellspring",
    description: "The source from which all corruption in the realm originates. Black ichor bubbles from cracks in the obsidian ground, spreading tendrils of decay in all directions. The very air corrodes armor and weakens resolve.",
    corruptionLevel: 1.0,
    terrainAttackMod: 0.7,
    terrainDefenseMod: 0.7,
    dangerLevel: 95,
    respawnPenaltyMult: 4.0
  },

  // ── CITADEL Specials (All unique) ──
  "CITADEL:5,5": {
    name: "Northwind Citadel",
    description: "The oldest of the four great citadels, built atop a windswept plateau. Northwind is renowned for its military academy and the legendary Order of the Frost Knights. Cold mountain winds keep the air crisp and the garrison sharp.",
    landmarkName: "Frost Knight Academy",
    flavorText: "Where steel is forged and honor is tempered.",
    weatherOverride: "SNOW",
    specialization: "MILITARY"
  },
  "CITADEL:29,5": {
    name: "Sunspire Citadel",
    description: "A magnificent tower of white marble and gold that catches the first rays of dawn. Home to the Grand Library and the Circle of Archmages, Sunspire is the center of magical knowledge and scholarly pursuit in the realm.",
    landmarkName: "The Grand Library",
    flavorText: "Knowledge illuminates where swords cannot reach.",
    elementalAffinity: "LIGHT",
    specialization: "ARCANE"
  },
  "CITADEL:5,29": {
    name: "Stormwatch Citadel",
    description: "A heavily fortified keep perched on sea cliffs, perpetually battered by ocean storms. Stormwatch commands the western naval fleet and serves as the realm's first line of defense against threats from the sea.",
    landmarkName: "The Admiral's Tower",
    flavorText: "No storm has ever breached these walls.",
    weatherOverride: "STORM",
    specialization: "NAVAL"
  },
  "CITADEL:29,29": {
    name: "Duskwall Citadel",
    description: "A sprawling trade fortress where merchant princes hold court alongside nobles. Duskwall's bazaars overflow with exotic goods from every corner of the realm. Gold flows like water, and every deal has a hidden price.",
    landmarkName: "The Grand Bazaar",
    flavorText: "Everything has a price. Everything.",
    marketDemandIndex: 0.6,
    regionalTaxRate: 0.05,
    specialization: "TRADE"
  },

  // ── BRIDGE Specials (All unique) ──
  "BRIDGE:17,5": {
    name: "Skyward Bridge",
    description: "An impossibly high stone bridge arching over the northern section of the Great Rift. Strong winds make the crossing treacherous, but a small inn built into the bridge's central pillar offers respite to brave travelers.",
    landmarkName: "The Windbreak Inn",
    flavorText: "Don't look down."
  },
  "BRIDGE:5,17": {
    name: "Westwend Bridge",
    description: "A sturdy dwarven-engineered bridge reinforced with iron beams and stone arches. The western crossing is known for its reliability and the gruff dwarven toll collector who has manned the gate for forty years.",
    landmarkName: "Dwarven Tollgate",
    flavorText: "Solid as the mountain it was carved from."
  },
  "BRIDGE:29,17": {
    name: "Ironspan Bridge",
    description: "A marvel of engineering spanning the eastern rift, its iron frame glowing faintly with protective enchantments. Mages of Sunspire maintain the magical barriers that shield travelers from the rift's howling winds.",
    landmarkName: "The Enchanted Span",
    flavorText: "Magic holds where stone would crumble."
  },
  "BRIDGE:17,29": {
    name: "Southgate Bridge",
    description: "The widest of the four bridges, designed to accommodate merchant caravans and military columns. Its massive stone pillars are carved with the history of the realm, and guards patrol day and night.",
    landmarkName: "The Merchant's Crossing",
    flavorText: "Where all roads of the south converge."
  },

  // ── VILLAGE Specials (All unique) ──
  "VILLAGE:17,13": {
    name: "Havenbrook",
    description: "A peaceful farming village nestled in a sheltered valley north of the central rift. Known for its annual harvest festival and the finest ale in the realm. The villagers are welcoming but wary of the darkness creeping from the south.",
    landmarkName: "The Golden Wheat Tavern",
    flavorText: "Home is where the hearth burns bright.",
    specialization: "FARMING"
  },
  "VILLAGE:13,17": {
    name: "Willowmere",
    description: "A village of herbalists and healers built around a crystal-clear spring said to possess restorative properties. Pilgrims travel from across the realm to drink from Willowmere's waters and seek cures for ailments mundane and magical.",
    landmarkName: "The Healing Spring",
    flavorText: "Nature provides for those who listen.",
    innRecoveryRate: 2.0,
    rareHerbSpawnChance: 0.10,
    specialization: "HERBALISM"
  },
  "VILLAGE:21,17": {
    name: "Thornfield",
    description: "A rugged frontier settlement populated by hunters, trappers, and rangers. Thornfield sits at the edge of wild territory, and its residents are as tough as the thorny hedgerows that form the village's natural walls.",
    landmarkName: "The Ranger's Lodge",
    flavorText: "Every thorn has its purpose.",
    resourceModifier: 1.3,
    specialization: "HUNTING"
  },
  "VILLAGE:17,21": {
    name: "Ashvale",
    description: "A mining settlement built into the foothills south of the central darkness. Ashvale's miners extract rare ores from veins that glow with residual dark energy. The work is dangerous but incredibly lucrative.",
    landmarkName: "The Deep Shaft Tavern",
    flavorText: "Dig deep enough and you'll find either fortune or doom.",
    resourceModifier: 1.5,
    resourceScarcity: 0.7,
    dangerLevel: 8,
    specialization: "MINING"
  },

  // ── BOSS Special ──
  "BOSS:17,17": {
    name: "The Abyssal Throne",
    description: "At the exact center of the world stands a monolithic throne carved from a single shard of void-crystal. It pulses with an energy that warps time and space. Here the Dark Sovereign awaits, eternal and patient, for challengers foolish enough to claim dominion over the abyss.",
    landmarkName: "Throne of the Dark Sovereign",
    flavorText: "All paths lead here. None lead back.",
    regionLoreSnippet: "The throne was not built — it grew, feeding on the corruption that seeped from the world's fractured core."
  }
};

// ─── Generate Output ─────────────────────────────────────────────────

const outDir = path.join(__dirname, 'maps');
fs.mkdirSync(outDir, { recursive: true });

// Write _meta.json
const meta = {
  version: "1.0.0",
  mapId: "overworld_main",
  mapName: "Overworld - Realm of Textical",
  gridWidth: GRID,
  gridHeight: GRID,
  defaultTile: "GREEN",
  tileSize: 64,
  totalRegions: GRID * GRID,
  regionIdFormula: "x * 35 + y",
  tileTypes: Object.keys(sourceData),
  createdAt: "2026-02-22",
  updatedAt: "2026-02-22"
};

fs.writeFileSync(
  path.join(outDir, '_meta.json'),
  JSON.stringify(meta, null, 2)
);
console.log('✅ _meta.json written');

// Track stats
let totalCoords = 0;
let totalSpecials = 0;

// Generate each tile type file
for (const [tileType, rawData] of Object.entries(sourceData)) {
  const config = tileConfigs[tileType];

  if (!config) {
    console.warn(`⚠️  No config found for tile type: ${tileType}, skipping`);
    continue;
  }

  const coordinates = rawData.coordinates.map(c => {
    const regionId = calcId(c.x, c.y);
    const specialKey = `${tileType}:${c.x},${c.y}`;
    const override = specialRegions[specialKey];

    const coord = { x: c.x, y: c.y, regionId };

    if (override) {
      totalSpecials++;
      // Merge override fields into coordinate
      Object.assign(coord, override);
    }

    return coord;
  });

  totalCoords += coordinates.length;

  const output = {
    tileType,
    defaults: config,
    coordinates
  };

  const filePath = path.join(outDir, `${tileType}.json`);
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2));
  console.log(`✅ ${tileType}.json written (${coordinates.length} tiles)`);
}

console.log(`\n🎉 Generation complete!`);
console.log(`   Total tiles: ${totalCoords}`);
console.log(`   Special regions: ${totalSpecials}`);
console.log(`   Output directory: ${outDir}`);
