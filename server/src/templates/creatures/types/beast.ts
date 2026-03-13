/**
 * Beast Type Template
 * 
 * Base stats for beast-type creatures: slimes, wolves, bats, spiders, etc.
 * Uses exponential growth: stat = base * growthRate^(level-1)
 */

import { CreatureType, CreatureTypeTemplate, CreatureCombatBonuses, CreatureGrowthRates } from './_base.js';

// Beast-type creatures: fast, moderate stats
// Growth: balanced with emphasis on DEX
const beastGrowth: CreatureGrowthRates = {
  vit: 1.03,     // +3% VIT per level
  hp: 1.02,      // +2% HP bonus per level
  attack: 1.04,  // +4% ATK per level
  defense: 1.02, // +2% DEF per level
  dex: 1.05,     // +5% DEX per level (fast)
  magic: 1.0,    // No magic growth
  mana: 1.0,     // No mana growth
};

const beastBonuses: CreatureCombatBonuses = {
  critRate: 3,
  evasion: 5,
};

export const BEAST_TYPE: CreatureTypeTemplate = {
  type: CreatureType.BEAST,
  name: 'Beast',
  
  baseHp: 40,
  baseVit: 4,
  baseAttack: 8,
  baseDefense: 3,
  baseDex: 15,
  baseMagic: 0,
  baseMana: 0,
  
  growth: beastGrowth,
  bonuses: beastBonuses,
  abilities: [],
  drops: ['meat', 'hide', 'bone'],
  
  description: 'Natural creature with instincts',
};

// ========== VARIANTS ==========

// Slime: slow, weak, but numerous
export const SLIME_TYPE: CreatureTypeTemplate = {
  ...BEAST_TYPE,
  type: CreatureType.BEAST,
  name: 'Slime',
  
  baseHp: 30,
  baseVit: 3,
  baseAttack: 5,
  baseDefense: 2,
  baseDex: 10,
  
  growth: {
    vit: 1.02,    // +2% VIT per level (slow)
    hp: 1.01,     // +1% HP bonus per level
    attack: 1.03, // +3% ATK per level
    defense: 1.02, // +2% DEF per level
    dex: 1.02,    // +2% DEX per level (slow)
    magic: 1.0,   // No magic
    mana: 1.0,    // No mana
  },
  
  bonuses: {
    critRate: 3,
    evasion: 2,
  },
  
  drops: ['slime_gel'],
  description: 'Gelatinous blob that oozes around',
};

// Wolf: fast, high crit
export const WOLF_TYPE: CreatureTypeTemplate = {
  ...BEAST_TYPE,
  type: CreatureType.BEAST,
  name: 'Wolf',
  
  baseHp: 45,
  baseVit: 5,
  baseAttack: 12,
  baseDefense: 3,
  baseDex: 30,
  
  growth: {
    vit: 1.03,    // +3% VIT per level
    hp: 1.02,     // +2% HP per level
    attack: 1.05, // +5% ATK per level
    defense: 1.02, // +2% DEF per level
    dex: 1.06,    // +6% DEX per level (very fast)
    magic: 1.0,   // No magic
    mana: 1.0,    // No mana
  },
  
  bonuses: {
    critRate: 10,
    evasion: 8,
  },
  
  drops: ['wolf_pelt', 'wolf_fang'],
  description: 'Pack hunter with sharp fangs',
};

// Spider: very fast, high crit
export const SPIDER_TYPE: CreatureTypeTemplate = {
  ...BEAST_TYPE,
  type: CreatureType.BUG,
  name: 'Spider',
  
  baseHp: 50,
  baseVit: 5,
  baseAttack: 16,
  baseDefense: 4,
  baseDex: 40,
  
  growth: {
    vit: 1.03,    // +3% VIT per level
    hp: 1.02,     // +2% HP per level
    attack: 1.05, // +5% ATK per level
    defense: 1.02, // +2% DEF per level
    dex: 1.07,    // +7% DEX per level (very fast)
    magic: 1.0,   // No magic
    mana: 1.0,    // No mana
  },
  
  bonuses: {
    critRate: 15,
    evasion: 12,
  },
  
  drops: ['spider_silk', 'spider_venom'],
  description: 'Venomous arachnid',
};
