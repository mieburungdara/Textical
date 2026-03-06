/**
 * Unit Templates - Predefined templates untuk berbagai jenis unit
 * 
 * Setiap template punya base stats yang bisa dimodifikasi oleh level
 * 
 * Template Types:
 * - HERO_CLASSES: Template untuk kelas hero (Warrior, Mage, Archer, etc)
 * - MONSTER_TIERS: Template untuk monster berdasarkan tier
 * - NPC_TIERS: Template untuk NPC
 */

import { Unit } from './TickCost.js';
import { DEFAULT_GRID_STATS } from '../templates/stats/GridStats.js';

// ========== HERO CLASSES ==========

export const HERO_TEMPLATES = {
  warrior: {
    id: 'template_warrior',
    name: 'Warrior',
    baseHp: 120,
    baseAttack: 15,
    baseDefense: 10,
    baseDex: 30,
    baseMagic: 0,
    baseCritRate: 10,
    baseCritDamage: 1.5,
    baseEvasion: 5,
    baseResistance: 5,
    description: 'Tank dengan high HP dan defense',
    roles: ['tank', 'melee'],
  },
  
  mage: {
    id: 'template_mage',
    name: 'Mage',
    baseHp: 60,
    baseAttack: 5,
    baseDefense: 3,
    baseDex: 40,
    baseMagic: 20,
    baseCritRate: 15,
    baseCritDamage: 1.8,
    baseEvasion: 10,
    baseResistance: 20,
    description: 'Magic damage dealer dengan low HP',
    roles: ['caster', 'magic'],
  },
  
  archer: {
    id: 'template_archer',
    name: 'Archer',
    baseHp: 80,
    baseAttack: 18,
    baseDefense: 5,
    baseDex: 60,
    baseMagic: 0,
    baseCritRate: 20,
    baseCritDamage: 1.6,
    baseEvasion: 15,
    baseResistance: 5,
    description: 'High damage dengan high crit rate',
    roles: ['ranged', 'physical'],
  },
  
  rogue: {
    id: 'template_rogue',
    name: 'Rogue',
    baseHp: 70,
    baseAttack: 16,
    baseDefense: 3,
    baseDex: 80,
    baseMagic: 0,
    baseCritRate: 30,
    baseCritDamage: 2.0,
    baseEvasion: 25,
    baseResistance: 3,
    description: 'High crit dan evasion',
    roles: ['melee', 'assassin'],
  },
  
  paladin: {
    id: 'template_paladin',
    name: 'Paladin',
    baseHp: 100,
    baseAttack: 12,
    baseDefense: 12,
    baseDex: 25,
    baseMagic: 10,
    baseCritRate: 8,
    baseCritDamage: 1.5,
    baseEvasion: 5,
    baseResistance: 15,
    description: 'Hybrid tank dan healer',
    roles: ['tank', 'support', 'hybrid'],
  },
  
  healer: {
    id: 'template_healer',
    name: 'Healer',
    baseHp: 70,
    baseAttack: 3,
    baseDefense: 5,
    baseDex: 45,
    baseMagic: 25,
    baseCritRate: 10,
    baseCritDamage: 1.4,
    baseEvasion: 8,
    baseResistance: 25,
    description: 'Support dengan healing magic',
    roles: ['caster', 'support'],
  },
} as const;

// ========== MONSTER TIERS ==========

export const MONSTER_TEMPLATES = {
  // TIER 1 - Basic monsters
  slime: {
    id: 'template_slime',
    name: 'Slime',
    baseHp: 30,
    baseAttack: 5,
    baseDefense: 2,
    baseDex: 10,
    baseMagic: 0,
    baseCritRate: 3,
    baseCritDamage: 1.3,
    baseEvasion: 2,
    baseResistance: 0,
    tier: 1,
    type: 'beast',
    drops: ['slime_gel', 'coin'],
    expReward: 10,
    goldReward: 5,
  },
  
  goblin: {
    id: 'template_goblin',
    name: 'Goblin',
    baseHp: 45,
    baseAttack: 10,
    baseDefense: 3,
    baseDex: 25,
    baseMagic: 0,
    baseCritRate: 5,
    baseCritDamage: 1.4,
    baseEvasion: 8,
    baseResistance: 0,
    tier: 1,
    type: 'humanoid',
    drops: ['goblin_ear', 'iron_ore', 'coin'],
    expReward: 15,
    goldReward: 8,
  },
  
  bat: {
    id: 'template_bat',
    name: 'Bat',
    baseHp: 20,
    baseAttack: 8,
    baseDefense: 1,
    baseDex: 35,
    baseMagic: 0,
    baseCritRate: 8,
    baseCritDamage: 1.5,
    baseEvasion: 15,
    baseResistance: 0,
    tier: 1,
    type: 'beast',
    drops: ['bat_wing', 'coin'],
    expReward: 8,
    goldReward: 3,
  },
  
  // TIER 2 - Intermediate monsters  
  wolf: {
    id: 'template_wolf',
    name: 'Wolf',
    baseHp: 60,
    baseAttack: 14,
    baseDefense: 5,
    baseDex: 40,
    baseMagic: 0,
    baseCritRate: 10,
    baseCritDamage: 1.5,
    baseEvasion: 10,
    baseResistance: 2,
    tier: 2,
    type: 'beast',
    drops: ['wolf_pelt', 'wolf_fang', 'coin'],
    expReward: 25,
    goldReward: 15,
  },
  
  skeleton: {
    id: 'template_skeleton',
    name: 'Skeleton',
    baseHp: 55,
    baseAttack: 12,
    baseDefense: 8,
    baseDex: 20,
    baseMagic: 0,
    baseCritRate: 5,
    baseCritDamage: 1.4,
    baseEvasion: 5,
    baseResistance: 10,
    tier: 2,
    type: 'undead',
    drops: ['bone', 'coin'],
    expReward: 20,
    goldReward: 12,
  },
  
  orc: {
    id: 'template_orc',
    name: 'Orc',
    baseHp: 80,
    baseAttack: 16,
    baseDefense: 10,
    baseDex: 15,
    baseMagic: 0,
    baseCritRate: 8,
    baseCritDamage: 1.5,
    baseEvasion: 3,
    baseResistance: 5,
    tier: 2,
    type: 'humanoid',
    drops: ['orc_tusk', 'leather', 'coin'],
    expReward: 30,
    goldReward: 18,
  },
  
  // TIER 3 - Advanced monsters
  troll: {
    id: 'template_troll',
    name: 'Troll',
    baseHp: 120,
    baseAttack: 20,
    baseDefense: 12,
    baseDex: 10,
    baseMagic: 0,
    baseCritRate: 5,
    baseCritDamage: 1.6,
    baseEvasion: 2,
    baseResistance: 8,
    tier: 3,
    type: 'giant',
    drops: ['troll_hide', 'troll_club', 'coin'],
    expReward: 50,
    goldReward: 30,
  },
  
  dark_mage: {
    id: 'template_dark_mage',
    name: 'Dark Mage',
    baseHp: 50,
    baseAttack: 5,
    baseDefense: 5,
    baseDex: 35,
    baseMagic: 25,
    baseCritRate: 15,
    baseCritDamage: 1.8,
    baseEvasion: 12,
    baseResistance: 25,
    tier: 3,
    type: 'humanoid',
    drops: ['dark_crystal', 'spellbook', 'coin'],
    expReward: 45,
    goldReward: 25,
  },
  
  dragon_whelp: {
    id: 'template_dragon_whelp',
    name: 'Dragon Whelp',
    baseHp: 100,
    baseAttack: 22,
    baseDefense: 15,
    baseDex: 20,
    baseMagic: 15,
    baseCritRate: 10,
    baseCritDamage: 1.7,
    baseEvasion: 8,
    baseResistance: 20,
    tier: 3,
    type: 'dragon',
    drops: ['dragon_scale', 'dragon_egg', 'coin'],
    expReward: 80,
    goldReward: 50,
  },
  
  // TIER 4 - Boss monsters
  dragon: {
    id: 'template_dragon',
    name: 'Dragon',
    baseHp: 300,
    baseAttack: 35,
    baseDefense: 25,
    baseDex: 30,
    baseMagic: 30,
    baseCritRate: 15,
    baseCritDamage: 2.0,
    baseEvasion: 10,
    baseResistance: 35,
    tier: 4,
    type: 'dragon',
    isBoss: true,
    drops: ['dragon_scale', 'dragon_heart', 'legendary_sword', 'coin'],
    expReward: 500,
    goldReward: 300,
  },
  
  demon_lord: {
    id: 'template_demon_lord',
    name: 'Demon Lord',
    baseHp: 500,
    baseAttack: 45,
    baseDefense: 30,
    baseDex: 40,
    baseMagic: 40,
    baseCritRate: 20,
    baseCritDamage: 2.2,
    baseEvasion: 15,
    baseResistance: 40,
    tier: 4,
    type: 'demon',
    isBoss: true,
    drops: ['demon_heart', 'hellfire_sword', 'dark_armor', 'coin'],
    expReward: 1000,
    goldReward: 500,
  },
};

// ========== NPC TEMPLATES ==========

export const NPC_TEMPLATES = {
  villager: {
    id: 'template_villager',
    name: 'Villager',
    baseHp: 30,
    baseAttack: 2,
    baseDefense: 2,
    baseDex: 10,
    baseMagic: 0,
    baseCritRate: 0,
    baseCritDamage: 1.0,
    baseEvasion: 2,
    baseResistance: 0,
    type: 'human',
    isHostile: false,
  },
  
  merchant: {
    id: 'template_merchant',
    name: 'Merchant',
    baseHp: 40,
    baseAttack: 1,
    baseDefense: 3,
    baseDex: 15,
    baseMagic: 0,
    baseCritRate: 0,
    baseCritDamage: 1.0,
    baseEvasion: 5,
    baseResistance: 0,
    type: 'human',
    isHostile: false,
  },
  
  guard: {
    id: 'template_guard',
    name: 'Guard',
    baseHp: 80,
    baseAttack: 12,
    baseDefense: 15,
    baseDex: 20,
    baseMagic: 0,
    baseCritRate: 5,
    baseCritDamage: 1.4,
    baseEvasion: 5,
    baseResistance: 5,
    type: 'human',
    isHostile: false,
  },
};

// ========== FACTORY FUNCTIONS ==========

export type HeroClass = keyof typeof HERO_TEMPLATES;
export type MonsterTemplate = keyof typeof MONSTER_TEMPLATES;
export type NpcTemplate = keyof typeof NPC_TEMPLATES;

export interface UnitTemplate {
  id: string;
  name: string;
  baseHp: number;      // Derived from baseVit * 10 (kept for backward compatibility)
  baseVit?: number;    // VIT - determines Max HP (optional for backward compatibility)
  baseAttack: number;
  baseDefense: number;
  baseDex: number;
  baseMagic: number;
  baseMana?: number;  // Derived from baseMagic * 10 (optional for backward compatibility)
  baseCritRate: number;
  baseCritDamage: number;
  baseEvasion: number;
  baseResistance: number;
  description?: string;
  roles?: string[];
  tier?: number;
  type?: string;
  drops?: string[];
  expReward?: number;
  goldReward?: number;
  isBoss?: boolean;
  isHostile?: boolean;
  
  // Grid stats (optional for backward compatibility)
  attackRange?: number;
  moveRange?: number;
  minRange?: number;
}

/**
 * Create a unit from template with level scaling
 * 
 * Stats scale dengan level menggunakan formula:
 * - HP: baseVit * 10 * (1 + level * 0.1) or baseHp * (1 + level * 0.1) for backward compat
 * - Mana: baseMagic * 10 * (1 + level * 0.1) or baseMana * (1 + level * 0.1) for backward compat
 * - Attack: baseAttack * (1 + level * 0.08)
 * - Defense: baseDefense * (1 + level * 0.05)
 * - DEX: baseDex * (1 + level * 0.03) - reduced scaling
 */
export function createUnitFromTemplate(
  template: UnitTemplate,
  level: number,
  id: string,
  customName?: string
): Unit {
  const name = customName || template.name;
  
  // Level scaling factors
  const hpScale = 1 + (level - 1) * 0.1;      // +10% per level
  const attackScale = 1 + (level - 1) * 0.08; // +8% per level
  const defenseScale = 1 + (level - 1) * 0.05; // +5% per level
  const dexScale = 1 + (level - 1) * 0.03;     // +3% per level (less scaling)
  
  // Calculate VIT (for HP) and Magic (for Mana)
  // For backward compatibility: if baseVit not provided, calculate from baseHp / 10
  const vit = template.baseVit !== undefined ? template.baseVit : Math.floor(template.baseHp / 10);
  const magic = template.baseMagic;
  
  // Calculate HP and Mana
  const hp = (vit * 10) * hpScale;
  const mana = (magic * 10) * hpScale;
  
  return {
    id,
    name,
    level,
    
    // Primary Stats
    vit: vit,
    hp: Math.floor(hp),
    maxHp: Math.floor(hp),
    mana: Math.floor(mana),
    maxMana: Math.floor(mana),
    attack: Math.floor(template.baseAttack * attackScale),
    defense: Math.floor(template.baseDefense * defenseScale),
    speed: Math.floor(template.baseDex * dexScale), // DEX affects tick speed
    magic: template.baseMagic,
    
    // Secondary Stats - Combat
    critRate: Math.min(50, Math.floor(template.baseCritRate + (level - 1) * 0.5)),
    critDamage: template.baseCritDamage,
    evasion: Math.min(40, template.baseEvasion + Math.floor((level - 1) * 0.3)),
    accuracy: Math.min(100, 75 + Math.floor(template.baseDex * 0.5 + (level - 1) * 0.5)),
    block: Math.min(30, 5 + Math.floor(template.baseDefense * 0.3 + (level - 1) * 0.2)),
    
    // Secondary Stats - Defense
    resistance: Math.min(50, template.baseResistance + Math.floor((level - 1) * 0.5)),
    damageReduction: 0, // Default 0
    statusResistance: 0, // Default 0
    tenacity: 0, // Default 0
    
    // Secondary Stats - Offense
    attackSpeed: 1.0, // Default 100%
    lifeSteal: 0, // Default 0
    spellVamp: 0, // Default 0
    castSpeed: 100, // Default 100 (1.0x)
    
    // Grid Stats
    attackRange: template.attackRange ?? DEFAULT_GRID_STATS.attackRange,
    moveRange: template.moveRange ?? DEFAULT_GRID_STATS.moveRange,
    minRange: template.minRange ?? DEFAULT_GRID_STATS.minRange,
  };
}

/**
 * Create a party of monsters from template
 */
export function createMonsterParty(
  template: MonsterTemplate,
  level: number,
  count: number = 1
): Unit[] {
  const tmpl = MONSTER_TEMPLATES[template];
  const units: Unit[] = [];
  
  for (let i = 0; i < count; i++) {
    units.push(createUnitFromTemplate(tmpl, level, `${template}_${i}`));
  }
  
  return units;
}

/**
 * Quick reference - all templates
 */
export const TEMPLATE_QUICK_REFERENCE = `
╔══════════════════════════════════════════════════════════════════╗
║                    UNIT TEMPLATES                                ║
╠══════════════════════════════════════════════════════════════════╣
║  HERO CLASSES                                                   ║
║  ├─ warrior:   HP 120, ATK 15, DEF 10, DEX 30 (tank)         ║
║  ├─ mage:      HP  60, ATK  5, DEF  3, DEX 40 (caster)       ║
║  ├─ archer:    HP  80, ATK 18, DEF  5, DEX 60 (ranged)       ║
║  ├─ rogue:     HP  70, ATK 16, DEF  3, DEX 80 (assassin)    ║
║  ├─ paladin:  HP 100, ATK 12, DEF 12, DEX 25 (hybrid)        ║
║  └─ healer:    HP  70, ATK  3, DEF  5, DEX 45 (support)      ║
╠══════════════════════════════════════════════════════════════════╣
║  MONSTER TIERS                                                  ║
║  TIER 1 (Level 1-10)                                           ║
║  ├─ slime:     HP 30, ATK  5, DEX 10                          ║
║  ├─ goblin:    HP 45, ATK 10, DEX 25                          ║
║  └─ bat:       HP 20, ATK  8, DEX 35                          ║
║  TIER 2 (Level 11-20)                                          ║
║  ├─ wolf:      HP 60, ATK 14, DEX 40                          ║
║  ├─ skeleton:  HP 55, ATK 12, DEX 20                          ║
║  └─ orc:       HP 80, ATK 16, DEX 15                          ║
║  TIER 3 (Level 21-30)                                          ║
║  ├─ troll:    HP 120, ATK 20, DEX 10                          ║
║  ├─ dark_mage: HP 50, ATK  5, DEX 35, MAG 25                 ║
║  └─ dragon_whelp: HP 100, ATK 22, DEX 20                       ║
║  TIER 4 (Boss)                                                  ║
║  ├─ dragon:   HP 300, ATK 35, DEX 30                          ║
║  └─ demon_lord: HP 500, ATK 45, DEX 40                        ║
╠══════════════════════════════════════════════════════════════════╣
║  LEVEL SCALING                                                  ║
║  ├─ HP:    base * (1 + level * 0.10)                          ║
║  ├─ ATK:   base * (1 + level * 0.08)                          ║
║  ├─ DEF:   base * (1 + level * 0.05)                          ║
║  └─ DEX:   base * (1 + level * 0.03)                          ║
╚══════════════════════════════════════════════════════════════════╝
`;
