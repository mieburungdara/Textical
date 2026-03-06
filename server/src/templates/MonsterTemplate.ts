/**
 * Monster Template System
 * 
 * Monster Classification:
 * - Type: beast, undead, demon, dragon, elemental, humanoid, construct
 * - Tier: 1-5 (difficulty scaling)
 * - Role: normal, elite, boss, mini_boss
 * 
 * Stat Scaling:
 * - HP: Scales heavily with tier
 * - Attack: Scales moderately
 * - Defense: Scales with tier
 * - DEX: Varies by monster type
 * - Magic: For magical monsters
 */

import { Unit } from '../combat/TickCost.js';

// ========== MONSTER TYPES ==========

export enum MonsterType {
  BEAST = 'beast',           // Animals, insects
  UNDEAD = 'undead',         // Skeletons, zombies, ghosts
  DEMON = 'demon',           // Demons, evil spirits
  DRAGON = 'dragon',         // Dragons, drakes
  ELEMENTAL = 'elemental',   // Fire, ice, lightning
  HUMANOID = 'humanoid',     // Orcs, goblins, bandits
  CONSTRUCT = 'construct',    // Golems, robots
  GIANT = 'giant',           // Ogres, trolls
  PLANT = 'plant',           // Mandragoras, venus flytrap
  BUG = 'bug',               // Scorpions, spiders
}

// ========== MONSTER TIERS ==========

export enum MonsterTier {
  TIER_1 = 1,  // Very Easy (Level 1-10)
  TIER_2 = 2,  // Easy (Level 11-20)
  TIER_3 = 3,  // Normal (Level 21-30)
  TIER_4 = 4,  // Hard (Level 31-40)
  TIER_5 = 5,  // Very Hard / Boss (Level 41-50)
}

// ========== MONSTER ROLES ==========

export enum MonsterRole {
  NORMAL = 'normal',
  ELITE = 'elite',     // 1.5x stats
  MINI_BOSS = 'mini_boss', // 2x stats
  BOSS = 'boss',       // 3x stats
  WORLD_BOSS = 'world_boss', // 5x stats
}

// ========== MONSTER STAT GROWTH ==========

export interface MonsterStatGrowth {
  vit?: number;     // VIT per level (determines HP) - optional for backward compatibility
  hp: number;       // Additional HP per level
  attack: number;
  defense: number;
  dex: number;
  magic?: number;   // Magic per level (determines Mana) - optional for backward compatibility
  mana?: number;    // Additional Mana per level - optional for backward compatibility
}

// ========== MONSTER TEMPLATE INTERFACE ==========

export interface MonsterTemplate {
  id: string;
  name: string;
  monsterType: MonsterType;
  tier: MonsterTier;
  role: MonsterRole;
  
  // Base stats at level 1
  baseHp: number;      // Used if baseVit not provided
  baseVit?: number;    // VIT - determines Max HP (optional for backward compatibility)
  baseAttack: number;
  baseDefense: number;
  baseDex: number;
  baseMagic: number;   // Used if baseMana not provided
  baseMana?: number;  // Optional for backward compatibility
  
  // Stat growth per level
  growth: MonsterStatGrowth;
  
  // Combat bonuses
  critRateBonus: number;
  critDamageBonus: number;
  evasionBonus: number;
  resistanceBonus: number;
  lifeStealBonus?: number; // Optional - for monsters with lifesteal
  
  // Rewards
  baseExpReward: number;
  baseGoldReward: number;
  
  // Drops
  commonDrops: string[];     // 30%+ drop rate
  uncommonDrops: string[];   // 10-30% drop rate
  rareDrops: string[];       // 1-10% drop rate
  legendaryDrops: string[];  // <1% drop rate
  
  // Abilities
  abilities: string[];        // Skill IDs
  
  // Description
  description: string;
}

// ========== ROLE MULTIPLIERS ==========

export const ROLE_MULTIPLIERS: Record<MonsterRole, number> = {
  [MonsterRole.NORMAL]: 1.0,
  [MonsterRole.ELITE]: 1.5,
  [MonsterRole.MINI_BOSS]: 2.0,
  [MonsterRole.BOSS]: 3.0,
  [MonsterRole.WORLD_BOSS]: 5.0,
};

// ========== TIER SCALING ==========

export const TIER_SCALING: Record<MonsterTier, number> = {
  [MonsterTier.TIER_1]: 1.0,
  [MonsterTier.TIER_2]: 1.5,
  [MonsterTier.TIER_3]: 2.5,
  [MonsterTier.TIER_4]: 4.0,
  [MonsterTier.TIER_5]: 6.0,
};

  // ========== MONSTER TEMPLATES ==========

export const MONSTER_TEMPLATES: Record<string, MonsterTemplate> = {
  // ========== TIER 1 - BEASTS ==========
  slime: {
    id: 'slime',
    name: 'Slime',
    monsterType: MonsterType.BEAST,
    tier: MonsterTier.TIER_1,
    role: MonsterRole.NORMAL,
    
    // Base stats at Level 1
    // HP = VIT * 10 + growth.hp
    baseHp: 30,     // Derived: vit * 10 (kept for backward compatibility)
    baseVit: 3,     // VIT determines HP
    baseAttack: 5,
    baseDefense: 2,
    baseDex: 10,
    baseMagic: 0,
    baseMana: 0,    // Derived: magic * 10
    
    growth: {
      vit: 1,        // +1 VIT per level (+10 HP)
      hp: 0,         // Additional HP (now from VIT)
      attack: 0.8,
      defense: 0.3,
      dex: 1,
      magic: 0,
      mana: 0,
    },
    
    critRateBonus: 3,
    critDamageBonus: 0.3,
    evasionBonus: 2,
    resistanceBonus: 0,
    
    baseExpReward: 10,
    baseGoldReward: 5,
    
    commonDrops: ['slime_gel', 'coin'],
    uncommonDrops: [],
    rareDrops: ['slime_crown'],
    legendaryDrops: [],
    
    abilities: ['acid Splash'],
    description: 'Gelatinous blob that oozes around',
  },
  
  bat: {
    id: 'bat',
    name: 'Bat',
    monsterType: MonsterType.BEAST,
    tier: MonsterTier.TIER_1,
    role: MonsterRole.NORMAL,
    
    // Base stats at Level 1
    baseHp: 20,     // Derived: vit * 10
    baseVit: 2,     // Low HP
    baseAttack: 8,
    baseDefense: 1,
    baseDex: 35,    // Very high DEX (fast)
    baseMagic: 0,
    baseMana: 0,
    
    growth: {
      vit: 1,
      hp: 0,
      attack: 1,
      defense: 0.2,
      dex: 3,
      magic: 0,
      mana: 0,
    },
    
    critRateBonus: 8,
    critDamageBonus: 0.5,
    evasionBonus: 15,
    resistanceBonus: 0,
    
    baseExpReward: 8,
    baseGoldReward: 3,
    
    commonDrops: ['bat_wing', 'coin'],
    uncommonDrops: [],
    rareDrops: ['bat_fang'],
    legendaryDrops: [],
    
    abilities: ['sonic_scream'],
    description: 'Nocturnal flying mammal',
  },
  
  wolf: {
    id: 'wolf',
    name: 'Wolf',
    monsterType: MonsterType.BEAST,
    tier: MonsterTier.TIER_1,
    role: MonsterRole.NORMAL,
    
    // Base stats at Level 1
    baseHp: 45,
    baseVit: 5,
    baseAttack: 12,
    baseDefense: 3,
    baseDex: 30,
    baseMagic: 0,
    baseMana: 0,
    
    growth: {
      vit: 1,
      hp: 0,
      attack: 1.5,
      defense: 0.5,
      dex: 2.5,
      magic: 0,
      mana: 0,
    },
    
    critRateBonus: 10,
    critDamageBonus: 0.5,
    evasionBonus: 8,
    resistanceBonus: 2,
    
    baseExpReward: 15,
    baseGoldReward: 8,
    
    commonDrops: ['wolf_pelt', 'coin'],
    uncommonDrops: ['wolf_fang'],
    rareDrops: [],
    legendaryDrops: [],
    
    abilities: ['bite', 'howl'],
    description: 'Pack hunter with sharp fangs',
  },
  
  // ========== TIER 1 - HUMANOIDS ==========
  goblin: {
    id: 'goblin',
    name: 'Goblin',
    monsterType: MonsterType.HUMANOID,
    tier: MonsterTier.TIER_1,
    role: MonsterRole.NORMAL,
    
    baseHp: 40,
    baseAttack: 10,
    baseDefense: 3,
    baseDex: 25,
    baseMagic: 0,
    
    growth: {
      hp: 5,
      attack: 1.2,
      defense: 0.4,
      dex: 2,
      magic: 0,
    },
    
    critRateBonus: 5,
    critDamageBonus: 0.4,
    evasionBonus: 8,
    resistanceBonus: 0,
    
    baseExpReward: 12,
    baseGoldReward: 6,
    
    commonDrops: ['goblin_ear', 'coin'],
    uncommonDrops: ['iron_ore'],
    rareDrops: [],
    legendaryDrops: [],
    
    abilities: ['club_smash'],
    description: 'Small green humanoid, mischievous and greedy',
  },
  
  // ========== TIER 2 ==========
  skeleton: {
    id: 'skeleton',
    name: 'Skeleton',
    monsterType: MonsterType.UNDEAD,
    tier: MonsterTier.TIER_2,
    role: MonsterRole.NORMAL,
    
    baseHp: 55,
    baseAttack: 14,
    baseDefense: 8,
    baseDex: 20,
    baseMagic: 0,
    
    growth: {
      hp: 7,
      attack: 1.8,
      defense: 1,
      dex: 1.5,
      magic: 0,
    },
    
    critRateBonus: 5,
    critDamageBonus: 0.4,
    evasionBonus: 5,
    resistanceBonus: 10,
    
    baseExpReward: 20,
    baseGoldReward: 12,
    
    commonDrops: ['bone', 'coin'],
    uncommonDrops: ['skull'],
    rareDrops: [],
    legendaryDrops: [],
    
    abilities: ['bone_club'],
    description: 'Animated skeleton of a fallen warrior',
  },
  
  orc: {
    id: 'orc',
    name: 'Orc',
    monsterType: MonsterType.HUMANOID,
    tier: MonsterTier.TIER_2,
    role: MonsterRole.NORMAL,
    
    baseHp: 80,
    baseAttack: 18,
    baseDefense: 10,
    baseDex: 15,
    baseMagic: 0,
    
    growth: {
      hp: 10,
      attack: 2,
      defense: 1.5,
      dex: 1,
      magic: 0,
    },
    
    critRateBonus: 8,
    critDamageBonus: 0.5,
    evasionBonus: 3,
    resistanceBonus: 5,
    
    baseExpReward: 30,
    baseGoldReward: 18,
    
    commonDrops: ['orc_tusk', 'leather', 'coin'],
    uncommonDrops: [],
    rareDrops: ['orc_club'],
    legendaryDrops: [],
    
    abilities: ['smash', 'war_cry'],
    description: 'Brutish green-skinned warrior',
  },
  
  spider: {
    id: 'spider',
    name: 'Giant Spider',
    monsterType: MonsterType.BUG,
    tier: MonsterTier.TIER_2,
    role: MonsterRole.NORMAL,
    
    baseHp: 50,
    baseAttack: 16,
    baseDefense: 4,
    baseDex: 40,
    baseMagic: 0,
    
    growth: {
      hp: 6,
      attack: 2,
      defense: 0.5,
      dex: 4,
      magic: 0,
    },
    
    critRateBonus: 15,
    critDamageBonus: 0.6,
    evasionBonus: 12,
    resistanceBonus: 3,
    
    baseExpReward: 25,
    baseGoldReward: 14,
    
    commonDrops: ['spider_silk', 'coin'],
    uncommonDrops: ['spider_venom'],
    rareDrops: [],
    legendaryDrops: [],
    
    abilities: ['poison_bite', 'web_shot'],
    description: 'Venomous arachnid',
  },
  
  // ========== TIER 3 ==========
  troll: {
    id: 'troll',
    name: 'Troll',
    monsterType: MonsterType.GIANT,
    tier: MonsterTier.TIER_3,
    role: MonsterRole.NORMAL,
    
    baseHp: 150,
    baseAttack: 25,
    baseDefense: 15,
    baseDex: 10,
    baseMagic: 0,
    
    growth: {
      hp: 18,
      attack: 3,
      defense: 2,
      dex: 1,
      magic: 0,
    },
    
    critRateBonus: 5,
    critDamageBonus: 0.6,
    evasionBonus: 2,
    resistanceBonus: 8,
    
    baseExpReward: 60,
    baseGoldReward: 35,
    
    commonDrops: ['troll_hide', 'troll_club', 'coin'],
    uncommonDrops: [],
    rareDrops: ['troll_blood'],
    legendaryDrops: [],
    
    abilities: ['smash', 'regeneration'],
    description: 'Regenerating giant with immense strength',
  },
  
  dark_mage: {
    id: 'dark_mage',
    name: 'Dark Mage',
    monsterType: MonsterType.HUMANOID,
    tier: MonsterTier.TIER_3,
    role: MonsterRole.NORMAL,
    
    baseHp: 50,
    baseAttack: 5,
    baseDefense: 5,
    baseDex: 30,
    baseMagic: 25,
    
    growth: {
      hp: 5,
      attack: 0.8,
      defense: 0.6,
      dex: 2.5,
      magic: 3,
    },
    
    critRateBonus: 15,
    critDamageBonus: 0.8,
    evasionBonus: 10,
    resistanceBonus: 25,
    
    baseExpReward: 55,
    baseGoldReward: 30,
    
    commonDrops: ['dark_crystal', 'spellbook', 'coin'],
    uncommonDrops: [],
    rareDrops: ['magic_orb'],
    legendaryDrops: [],
    
    abilities: ['dark_bolt', 'shadow_shield'],
    description: 'Wielder of forbidden dark magic',
  },
  
  fire_elemental: {
    id: 'fire_elemental',
    name: 'Fire Elemental',
    monsterType: MonsterType.ELEMENTAL,
    tier: MonsterTier.TIER_3,
    role: MonsterRole.NORMAL,
    
    baseHp: 70,
    baseAttack: 22,
    baseDefense: 6,
    baseDex: 25,
    baseMagic: 15,
    
    growth: {
      hp: 8,
      attack: 2.5,
      defense: 0.8,
      dex: 2,
      magic: 2,
    },
    
    critRateBonus: 10,
    critDamageBonus: 0.7,
    evasionBonus: 8,
    resistanceBonus: 20,
    
    baseExpReward: 50,
    baseGoldReward: 28,
    
    commonDrops: ['fire_essence', 'coin'],
    uncommonDrops: [],
    rareDrops: ['flame_core'],
    legendaryDrops: [],
    
    abilities: ['fireball', 'flame_touch'],
    description: 'Embodiment of fire',
  },
  
  // ========== TIER 4 - BOSSES ==========
  dragon_whelp: {
    id: 'dragon_whelp',
    name: 'Dragon Whelp',
    monsterType: MonsterType.DRAGON,
    tier: MonsterTier.TIER_4,
    role: MonsterRole.MINI_BOSS,
    
    baseHp: 200,
    baseAttack: 30,
    baseDefense: 20,
    baseDex: 25,
    baseMagic: 20,
    
    growth: {
      hp: 25,
      attack: 4,
      defense: 3,
      dex: 2,
      magic: 3,
    },
    
    critRateBonus: 12,
    critDamageBonus: 0.8,
    evasionBonus: 8,
    resistanceBonus: 25,
    
    baseExpReward: 150,
    baseGoldReward: 100,
    
    commonDrops: ['dragon_scale', 'dragon_egg', 'coin'],
    uncommonDrops: ['dragon_claw'],
    rareDrops: ['dragon_heart'],
    legendaryDrops: [],
    
    abilities: ['fire_breath', 'claw_slash', 'fly'],
    description: 'Young dragon with deadly potential',
  },
  
  demon: {
    id: 'demon',
    name: 'Demon',
    monsterType: MonsterType.DEMON,
    tier: MonsterTier.TIER_4,
    role: MonsterRole.MINI_BOSS,
    
    baseHp: 180,
    baseAttack: 35,
    baseDefense: 15,
    baseDex: 35,
    baseMagic: 25,
    
    growth: {
      hp: 22,
      attack: 4.5,
      defense: 2,
      dex: 3,
      magic: 3,
    },
    
    critRateBonus: 18,
    critDamageBonus: 1.0,
    evasionBonus: 12,
    resistanceBonus: 30,
    
    baseExpReward: 180,
    baseGoldReward: 120,
    
    commonDrops: ['demon_horn', 'demon_skin', 'coin'],
    uncommonDrops: [],
    rareDrops: ['demon_heart'],
    legendaryDrops: [],
    
    abilities: ['dark_bolt', 'hellfire', 'teleport'],
    description: 'Minion of the demon realm',
  },
  
  // ========== TIER 5 - BOSSES ==========
  dragon: {
    id: 'dragon',
    name: 'Dragon',
    monsterType: MonsterType.DRAGON,
    tier: MonsterTier.TIER_5,
    role: MonsterRole.BOSS,
    
    baseHp: 500,
    baseAttack: 50,
    baseDefense: 35,
    baseDex: 30,
    baseMagic: 40,
    
    growth: {
      hp: 60,
      attack: 6,
      defense: 5,
      dex: 3,
      magic: 5,
    },
    
    critRateBonus: 15,
    critDamageBonus: 1.2,
    evasionBonus: 10,
    resistanceBonus: 40,
    
    baseExpReward: 500,
    baseGoldReward: 300,
    
    commonDrops: ['dragon_scale', 'dragon_blood', 'coin'],
    uncommonDrops: ['dragon_claw', 'dragon_fang'],
    rareDrops: ['dragon_heart', 'dragon_wing'],
    legendaryDrops: ['dragon_egg'],
    
    abilities: ['inferno', 'tail_whip', 'fly', 'roar'],
    description: 'Ancient dragon of immense power',
  },
  
  demon_lord: {
    id: 'demon_lord',
    name: 'Demon Lord',
    monsterType: MonsterType.DEMON,
    tier: MonsterTier.TIER_5,
    role: MonsterRole.BOSS,
    
    baseHp: 800,
    baseAttack: 65,
    baseDefense: 45,
    baseDex: 40,
    baseMagic: 55,
    
    growth: {
      hp: 100,
      attack: 8,
      defense: 6,
      dex: 4,
      magic: 7,
    },
    
    critRateBonus: 25,
    critDamageBonus: 1.5,
    evasionBonus: 15,
    resistanceBonus: 50,
    
    baseExpReward: 1000,
    baseGoldReward: 500,
    
    commonDrops: ['demon_heart', 'hellfire_orb', 'coin'],
    uncommonDrops: ['demon_crown', 'dark_essence'],
    rareDrops: ['soul_shard'],
    legendaryDrops: ['demon_sword'],
    
    abilities: ['meteor_strike', 'dark_pulse', 'summon_minions', 'immortality'],
    description: 'Ruler of the demon realm',
  },
  
  // ========== SPECIAL - WORLD BOSS ==========
  ancient_dragon: {
    id: 'ancient_dragon',
    name: 'Ancient Dragon',
    monsterType: MonsterType.DRAGON,
    tier: MonsterTier.TIER_5,
    role: MonsterRole.WORLD_BOSS,
    
    baseHp: 2000,
    baseAttack: 80,
    baseDefense: 60,
    baseDex: 45,
    baseMagic: 70,
    
    growth: {
      hp: 250,
      attack: 12,
      defense: 10,
      dex: 5,
      magic: 10,
    },
    
    critRateBonus: 30,
    critDamageBonus: 2.0,
    evasionBonus: 20,
    resistanceBonus: 60,
    
    baseExpReward: 5000,
    baseGoldReward: 2000,
    
    commonDrops: ['ancient_scale', 'dragon_essence', 'coin'],
    uncommonDrops: ['ancient_claw', 'ancient_fang'],
    rareDrops: ['dragon_king_crest'],
    legendaryDrops: ['dragon_king_heart', 'eternal_dragon_egg'],
    
    abilities: ['world_breaker', 'time_freeze', 'dimension_shift', 'doomsday'],
    description: 'Legendary dragon that predates history',
  },
};

// ========== FACTORY FUNCTIONS ==========

/**
 * Create a monster from template with level and role scaling
 * 
 * Formula:
 * - Stats = (baseStat + growth.stat * (level - 1)) * tierMultiplier * roleMultiplier
 */
export function createMonsterFromTemplate(
  templateId: string,
  level: number,
  id: string,
  role?: MonsterRole,
  customName?: string
): Unit {
  const template = MONSTER_TEMPLATES[templateId];
  
  if (!template) {
    throw new Error(`Monster template not found: ${templateId}`);
  }
  
  const finalRole = role || template.role;
  const name = customName || template.name;
  
  const tierMult = TIER_SCALING[template.tier];
  const roleMult = ROLE_MULTIPLIERS[finalRole];
  const levelOffset = Math.max(0, level - 1);
  const totalMultiplier = tierMult * roleMult;
  
  // Calculate primary stats with growth
  // For backward compatibility: if baseVit not provided, calculate from baseHp / 10
  const vit = (template.baseVit !== undefined ? template.baseVit : Math.floor(template.baseHp / 10)) 
              + ((template.growth.vit || 0) * levelOffset);
  const attack = template.baseAttack + (template.growth.attack * levelOffset);
  const defense = template.baseDefense + (template.growth.defense * levelOffset);
  const dex = template.baseDex + (template.growth.dex * levelOffset);
  // For backward compatibility: if baseMana not provided, calculate from baseMagic * 10
  const magic = template.baseMagic + ((template.growth.magic || 0) * levelOffset);
  
  // Calculate derived stats (HP = VIT * 10 + growth.hp, Mana = MAGIC * 10 + growth.mana)
  const baseHp = (vit * 10) + (template.growth.hp * levelOffset);
  const baseMana = (magic * 10) + ((template.growth.mana || 0) * levelOffset);
  
  return {
    id,
    name,
    level,
    
    // Primary Stats
    vit: Math.floor(vit),
    hp: Math.floor(baseHp * totalMultiplier),
    maxHp: Math.floor(baseHp * totalMultiplier),
    mana: Math.floor(baseMana * totalMultiplier),
    maxMana: Math.floor(baseMana * totalMultiplier),
    attack: Math.floor(attack * totalMultiplier),
    defense: Math.floor(defense * totalMultiplier),
    speed: Math.floor(dex * totalMultiplier),
    magic: Math.floor(magic * totalMultiplier),
    
    // Secondary Stats - Combat
    critRate: template.critRateBonus,
    critDamage: 1.0 + template.critDamageBonus,
    evasion: Math.floor(template.evasionBonus * roleMult),
    accuracy: 75 + Math.floor(dex * 0.5), // Base accuracy from DEX
    block: 5 + Math.floor(defense * 0.3), // Base block from DEF
    
    // Secondary Stats - Defense
    resistance: Math.floor(template.resistanceBonus * roleMult),
    damageReduction: 0, // Default 0
    statusResistance: 0, // Default 0
    tenacity: 0, // Default 0
    
    // Secondary Stats - Offense
    attackSpeed: 1.0, // Base 100%
    lifeSteal: template.lifeStealBonus ?? 0, // Optional from monster template
  };
}

/**
 * Create a party of monsters
 */
export function createMonsterParty(
  templateId: string,
  level: number,
  count: number = 1,
  role?: MonsterRole
): Unit[] {
  const units: Unit[] = [];
  
  for (let i = 0; i < count; i++) {
    units.push(createMonsterFromTemplate(templateId, level, `${templateId}_${i}`, role));
  }
  
  return units;
}

/**
 * Calculate monster rewards
 */
export function calculateMonsterRewards(
  template: MonsterTemplate,
  level: number,
  role: MonsterRole = MonsterRole.NORMAL
): { exp: number; gold: number; dropChance: number } {
  const levelMult = 1 + (level - 1) * 0.1;
  const roleMult = ROLE_MULTIPLIERS[role];
  
  const exp = Math.floor(template.baseExpReward * levelMult * roleMult);
  const gold = Math.floor(template.baseGoldReward * levelMult * roleMult);
  
  // Higher role = higher drop chance
  const dropChance = 0.3 + (roleMult - 1) * 0.2;
  
  return { exp, gold, dropChance: Math.min(1, dropChance) };
}

/**
 * Get monsters by type
 */
export function getMonstersByType(monsterType: MonsterType): MonsterTemplate[] {
  return Object.values(MONSTER_TEMPLATES).filter(
    m => m.monsterType === monsterType
  );
}

/**
 * Get monsters by tier
 */
export function getMonstersByTier(tier: MonsterTier): MonsterTemplate[] {
  return Object.values(MONSTER_TEMPLATES).filter(
    m => m.tier === tier
  );
}

/**
 * Get boss monsters
 */
export function getBossMonsters(): MonsterTemplate[] {
  return Object.values(MONSTER_TEMPLATES).filter(
    m => m.role === MonsterRole.BOSS || m.role === MonsterRole.WORLD_BOSS
  );
}

// ========== QUICK REFERENCE ==========

export const MONSTER_QUICK_REFERENCE = `
╔══════════════════════════════════════════════════════════════════════════════╗
║                          MONSTER TEMPLATE SYSTEM                          ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MONSTER TYPES                                                             ║
║  ├─ beast:     Slime, Wolf, Bat                                           ║
║  ├─ undead:    Skeleton, Zombie, Ghost                                    ║
║  ├─ demon:     Demon, Demon Lord                                          ║
║  ├─ dragon:    Dragon Whelp, Dragon, Ancient Dragon                       ║
║  ├─ elemental: Fire Elemental, Ice Golem                                   ║
║  ├─ humanoid:  Goblin, Orc, Dark Mage                                     ║
║  └─ giant:     Troll, Ogre                                                 ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MONSTER TIERS                                                             ║
║  ├─ Tier 1: Level 1-10   (Easy)                                           ║
║  ├─ Tier 2: Level 11-20  (Normal)                                          ║
║  ├─ Tier 3: Level 21-30  (Hard)                                            ║
║  ├─ Tier 4: Level 31-40  (Very Hard)                                       ║
║  └─ Tier 5: Level 41-50  (Boss)                                            ║
╠══════════════════════════════════════════════════════════════════════════════╣
║  MONSTER ROLES                                                             ║
║  ├─ Normal:     1.0x stats                                                ║
║  ├─ Elite:      1.5x stats                                                ║
║  ├─ Mini Boss:  2.0x stats                                                ║
║  ├─ Boss:       3.0x stats                                                ║
║  └─ World Boss: 5.0x stats                                                ║
╠══════════════════════════════════════════════════════════════════════════════╗
║  STAT FORMULA                                                              ║
║  HP/ATK/DEF = (base + growth * (level-1)) * tierMult * roleMult          ║
╠══════════════════════════════════════════════════════════════════════════════╗
║  EXAMPLE STATS                                                             ║
║  Slime Lv.1:      HP=30,  ATK=5,  DEX=10                                  ║
║  Dragon Lv.50:    HP=3800, ATK=380, DEX=180 (Boss, Tier 5)               ║
║  Ancient Dragon:  HP=17500, ATK=780, DEX=400 (World Boss)                 ║
╚══════════════════════════════════════════════════════════════════════════════╝
`;
