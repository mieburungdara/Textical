/**
 * Humanoid Type Template
 * 
 * Base stats for humanoid creatures: goblins, orcs, humans, elves, dwarves, etc.
 */

import { CreatureType, CreatureTypeTemplate, CreatureStatGrowth, CreatureCombatBonuses } from './_base.js';

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
  
  growth: {
    vit: 1,
    hp: 5,
    attack: 1,
    defense: 0.5,
    dex: 1,
    magic: 0.5,
    mana: 5,
  },
  
  bonuses: {
    critRate: 5,
    evasion: 3,
  },
  
  abilities: [],
  drops: ['coin', 'leather'],
  
  description: 'Bipedal intelligent creature',
};

// ========== VARIANTS ==========

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
    vit: 1,
    hp: 5,
    attack: 1.2,
    defense: 0.4,
    dex: 2,
    magic: 0,
    mana: 0,
  },
  
  bonuses: {
    critRate: 5,
    evasion: 8,
  },
  
  drops: ['goblin_ear', 'iron_ore'],
  description: 'Small green humanoid, mischievous and greedy',
};

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
    vit: 1,
    hp: 10,
    attack: 2,
    defense: 1.5,
    dex: 1,
    magic: 0,
    mana: 0,
  },
  
  bonuses: {
    critRate: 8,
    evasion: 3,
    lifeSteal: 3,
  },
  
  drops: ['orc_tusk', 'leather'],
  description: 'Brutish green-skinned warrior',
};

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
    vit: 1,
    hp: 0,
    attack: 1,
    defense: 0.5,
    dex: 1,
    magic: 0.5,
    mana: 5,
  },
  
  bonuses: {
    critRate: 5,
    evasion: 3,
  },
  
  drops: ['coin'],
  description: 'Versatile and adaptable beings',
};

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
    vit: 1,
    hp: 0,
    attack: 0.8,
    defense: 0.4,
    dex: 2,
    magic: 1,
    mana: 10,
  },
  
  bonuses: {
    critRate: 8,
    evasion: 8,
  },
  
  drops: ['elf_hair', 'ancient_coin'],
  description: 'Graceful beings with keen senses',
};

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
    vit: 1.5,
    hp: 0,
    attack: 1.2,
    defense: 1.5,
    dex: 0.5,
    magic: 0,
    mana: 0,
  },
  
  bonuses: {
    critRate: 3,
    evasion: 0,
    damageReduction: 5,
  },
  
  drops: ['dwarf_beard', 'mithril_ore'],
  description: 'Stout and hardy underground dwellers',
};

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
    vit: 2,
    hp: 18,
    attack: 3,
    defense: 2,
    dex: 1,
    magic: 0,
    mana: 0,
  },
  
  bonuses: {
    critRate: 5,
    evasion: 2,
    lifeSteal: 5,
  },
  
  drops: ['troll_hide', 'troll_blood'],
  description: 'Regenerating giant with immense strength',
};
