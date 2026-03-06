/**
 * Beast Type Template
 * 
 * Base stats for beast-type creatures: slimes, wolves, bats, spiders, etc.
 */

import { CreatureType, CreatureTypeTemplate, CreatureStatGrowth, CreatureCombatBonuses } from './_base.js';

const beastGrowth: CreatureStatGrowth = {
  vit: 1,
  hp: 5,
  attack: 1.2,
  defense: 0.4,
  dex: 2,
  magic: 0,
  mana: 0,
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
    vit: 1,
    hp: 0,
    attack: 0.8,
    defense: 0.3,
    dex: 1,
    magic: 0,
    mana: 0,
  },
  
  bonuses: {
    critRate: 3,
    evasion: 2,
  },
  
  drops: ['slime_gel'],
  description: 'Gelatinous blob that oozes around',
};

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
    vit: 1,
    hp: 0,
    attack: 1.5,
    defense: 0.5,
    dex: 2.5,
    magic: 0,
    mana: 0,
  },
  
  bonuses: {
    critRate: 10,
    evasion: 8,
  },
  
  drops: ['wolf_pelt', 'wolf_fang'],
  description: 'Pack hunter with sharp fangs',
};

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
    vit: 1,
    hp: 6,
    attack: 2,
    defense: 0.5,
    dex: 4,
    magic: 0,
    mana: 0,
  },
  
  bonuses: {
    critRate: 15,
    evasion: 12,
  },
  
  drops: ['spider_silk', 'spider_venom'],
  description: 'Venomous arachnid',
};
