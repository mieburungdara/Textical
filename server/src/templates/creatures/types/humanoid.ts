/**
 * Humanoid Type Template
 * 
 * Base stats for humanoid creatures: goblins, orcs, humans, elves, dwarves, etc.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureType, CreatureTypeTemplate, CreatureCombatBonuses, CreatureGrowthRates } from './_base.js';

// Humanoid: balanced stats, versatile
const humanoidGrowth: CreatureGrowthRates = {
  vit: 1.03,     // +3% VIT per level
  hp: 1.02,      // +2% HP bonus per level
  attack: 1.03,  // +3% ATK per level
  defense: 1.03, // +3% DEF per level
  dex: 1.03,     // +3% DEX per level
  magic: 1.03,   // +3% MAG per level
  mana: 1.03,    // +3% MANA per level
};

export const HUMANOID_TYPE: CreatureTypeTemplate = {
  type: CreatureType.HUMANOID,
  name: 'Humanoid',
  
  baseHp: 50,
  baseVit: 5,
  baseAttack: 10,
  baseDefense: 5,
  baseDex: 12,
  baseMagic: 5,
  baseMana: 50,
  
  growth: humanoidGrowth,
  
  bonuses: {
    critRate: 5,
    evasion: 3,
  },
  
  abilities: [],
  drops: ['coin', 'leather'],
  
  description: 'Bipedal intelligent creature',
};

// ========== VARIANTS ==========

// Goblin: fast, evasive, weak
export const GOBLIN_TYPE: CreatureTypeTemplate = {
  ...HUMANOID_TYPE,
  type: CreatureType.HUMANOID,
  name: 'Goblin',
  
  baseHp: 40,
  baseVit: 4,
  baseAttack: 10,
  baseDefense: 3,
  baseDex: 25,
  
  growth: {
    vit: 1.02,    // +2% VIT per level
    hp: 1.02,     // +2% HP per level
    attack: 1.04, // +4% ATK per level
    defense: 1.02, // +2% DEF per level
    dex: 1.05,    // +5% DEX per level (fast)
    magic: 1.0,   // No magic
    mana: 1.0,    // No mana
  },
  
  bonuses: {
    critRate: 5,
    evasion: 8,
  },
  
  drops: ['goblin_ear', 'iron_ore'],
  description: 'Small green humanoid, mischievous and greedy',
};

// Orc: high ATK, tanky
export const ORC_TYPE: CreatureTypeTemplate = {
  ...HUMANOID_TYPE,
  type: CreatureType.HUMANOID,
  name: 'Orc',
  
  baseHp: 80,
  baseVit: 8,
  baseAttack: 18,
  baseDefense: 10,
  baseDex: 15,
  
  growth: {
    vit: 1.04,    // +4% VIT per level
    hp: 1.03,     // +3% HP per level
    attack: 1.05, // +5% ATK per level (high damage)
    defense: 1.04, // +4% DEF per level
    dex: 1.03,    // +3% DEX per level
    magic: 1.0,   // No magic
    mana: 1.0,    // No mana
  },
  
  bonuses: {
    critRate: 8,
    evasion: 3,
    lifeSteal: 3,
  },
  
  drops: ['orc_tusk', 'leather'],
  description: 'Brutish green-skinned warrior',
};

// Human: balanced, versatile
export const HUMAN_TYPE: CreatureTypeTemplate = {
  ...HUMANOID_TYPE,
  type: CreatureType.HUMANOID,
  name: 'Human',
  
  baseHp: 50,
  baseVit: 5,
  baseAttack: 10,
  baseDefense: 5,
  baseDex: 10,
  baseMagic: 5,
  baseMana: 50,
  
  growth: {
    vit: 1.03,    // +3% VIT per level
    hp: 1.02,     // +2% HP per level
    attack: 1.03, // +3% ATK per level
    defense: 1.03, // +3% DEF per level
    dex: 1.03,    // +3% DEX per level
    magic: 1.03,  // +3% MAG per level
    mana: 1.03,   // +3% MANA per level
  },
  
  bonuses: {
    critRate: 5,
    evasion: 3,
  },
  
  drops: ['coin'],
  description: 'Versatile and adaptable beings',
};

// Elf: high DEX, high magic
export const ELF_TYPE: CreatureTypeTemplate = {
  ...HUMANOID_TYPE,
  type: CreatureType.HUMANOID,
  name: 'Elf',
  
  baseHp: 45,
  baseVit: 4,
  baseAttack: 8,
  baseDefense: 4,
  baseDex: 20,
  baseMagic: 8,
  baseMana: 80,
  
  growth: {
    vit: 1.02,    // +2% VIT per level
    hp: 1.01,     // +1% HP per level
    attack: 1.03, // +3% ATK per level
    defense: 1.02, // +2% DEF per level
    dex: 1.05,    // +5% DEX per level (very fast)
    magic: 1.04,   // +4% MAG per level
    mana: 1.04,    // +4% MANA per level
  },
  
  bonuses: {
    critRate: 8,
    evasion: 8,
  },
  
  drops: ['elf_hair', 'ancient_coin'],
  description: 'Graceful beings with keen senses',
};

// Dwarf: high DEF, high VIT
export const DWARF_TYPE: CreatureTypeTemplate = {
  ...HUMANOID_TYPE,
  type: CreatureType.HUMANOID,
  name: 'Dwarf',
  
  baseHp: 60,
  baseVit: 6,
  baseAttack: 12,
  baseDefense: 12,
  baseDex: 8,
  
  growth: {
    vit: 1.04,    // +4% VIT per level
    hp: 1.03,     // +3% HP per level
    attack: 1.04, // +4% ATK per level
    defense: 1.05, // +5% DEF per level (very tanky)
    dex: 1.02,    // +2% DEX per level (slow)
    magic: 1.0,   // No magic
    mana: 1.0,    // No mana
  },
  
  bonuses: {
    critRate: 3,
    evasion: 0,
    damageReduction: 5,
  },
  
  drops: ['dwarf_beard', 'mithril_ore'],
  description: 'Stout and hardy underground dwellers',
};

// Troll: giant, very tanky, regenerates
export const TROLL_TYPE: CreatureTypeTemplate = {
  ...HUMANOID_TYPE,
  type: CreatureType.GIANT,
  name: 'Troll',
  
  baseHp: 150,
  baseVit: 15,
  baseAttack: 25,
  baseDefense: 15,
  baseDex: 10,
  
  growth: {
    vit: 1.05,    // +5% VIT per level (very tanky)
    hp: 1.04,     // +4% HP per level
    attack: 1.05, // +5% ATK per level
    defense: 1.04, // +4% DEF per level
    dex: 1.02,    // +2% DEX per level (slow)
    magic: 1.0,   // No magic
    mana: 1.0,    // No mana
  },
  
  bonuses: {
    critRate: 5,
    evasion: 2,
    lifeSteal: 5,
  },
  
  drops: ['troll_hide', 'troll_blood'],
  description: 'Regenerating giant with immense strength',
};
