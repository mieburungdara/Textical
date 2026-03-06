/**
 * Creature Factory Functions
 * 
 * Factory functions for creating creatures from templates.
 * Replaces the old MonsterTemplate.ts and CreatureTemplate.ts functionality.
 */

import { Unit } from '../../combat/TickCost.js';
import { ElementType, ELEMENT_TEMPLATES } from '../elements/index.js';
import { WeaponType, getWeaponStats, getMonsterWeaponSet, WEAPON_STATS, isRangedWeapon } from '../items/index.js';
import { 
  CreatureTemplate, 
  CreatureType, 
  CreatureRank, 
  CreatureTier, 
  CreatureKind,
  RANK_MULTIPLIERS, 
  TIER_SCALING 
} from './CreatureBase.js';
import { CREATURE_TEMPLATES, getCreatureTemplate, TYPE_TEMPLATES, TYPE_VARIANTS, getTypeTemplate } from './index.js';
import { getTraitStatBonuses } from '../traits/index.js';

// ========== ELEMENT MODIFIERS ==========

export interface ElementModifier {
  attackBonus: number;
  defenseBonus: number;
  resistanceBonus: number;
  abilities: string[];
  drops: string[];
}

export const ELEMENT_MODIFIERS: Record<ElementType, ElementModifier> = {
  [ElementType.NEUTRAL]: {
    attackBonus: 0,
    defenseBonus: 0,
    resistanceBonus: 0,
    abilities: [],
    drops: [],
  },
  [ElementType.FIRE]: {
    attackBonus: 2,
    defenseBonus: 1,
    resistanceBonus: 10,
    abilities: ['fireball', 'flame_touch'],
    drops: ['fire_essence', 'flame_core'],
  },
  [ElementType.WATER]: {
    attackBonus: 1,
    defenseBonus: 2,
    resistanceBonus: 10,
    abilities: ['water_bolt', 'aqua_shield'],
    drops: ['water_essence', 'pearl'],
  },
  [ElementType.EARTH]: {
    attackBonus: 3,
    defenseBonus: 3,
    resistanceBonus: 5,
    abilities: ['rock_throw', 'earthquake'],
    drops: ['earth_essence', 'gemstone'],
  },
  [ElementType.WIND]: {
    attackBonus: 1,
    defenseBonus: 0,
    resistanceBonus: 8,
    abilities: ['wind_slice', 'gust'],
    drops: ['wind_essence', 'feather'],
  },
  [ElementType.LIGHT]: {
    attackBonus: 2,
    defenseBonus: 1,
    resistanceBonus: 15,
    abilities: ['light_bolt', 'holy_shield'],
    drops: ['light_essence', 'holy_orb'],
  },
  [ElementType.DARK]: {
    attackBonus: 3,
    defenseBonus: 1,
    resistanceBonus: 15,
    abilities: ['dark_bolt', 'shadow_veil'],
    drops: ['dark_essence', 'shadow_crystal'],
  },
};

// ========== CLASS MODIFIERS ==========

export interface ClassModifier {
  attackBonus: number;
  defenseBonus: number;
  dexBonus: number;
  magicBonus: number;
  critRateBonus: number;
  evasionBonus: number;
  abilities: string[];
  attackRange?: number;
  moveRange?: number;
}

export const CLASS_MODIFIERS: Record<string, ClassModifier> = {
  warrior: {
    attackBonus: 3,
    defenseBonus: 4,
    dexBonus: 0,
    magicBonus: 0,
    critRateBonus: 2,
    evasionBonus: -2,
    abilities: ['power_strike', 'shield_bash'],
    attackRange: 1,
    moveRange: 3,
  },
  knight: {
    attackBonus: 2,
    defenseBonus: 6,
    dexBonus: 0,
    magicBonus: 0,
    critRateBonus: 0,
    evasionBonus: -3,
    abilities: ['shield_wall', 'holy_strike'],
    attackRange: 1,
    moveRange: 2,
  },
  berserker: {
    attackBonus: 6,
    defenseBonus: -2,
    dexBonus: 1,
    magicBonus: 0,
    critRateBonus: 5,
    evasionBonus: 2,
    abilities: ['rage', 'death_blow', 'bleed'],
    attackRange: 1,
    moveRange: 4,
  },
  archer: {
    attackBonus: 2,
    defenseBonus: -1,
    dexBonus: 5,
    magicBonus: 0,
    critRateBonus: 5,
    evasionBonus: 3,
    abilities: ['aimed_shot', 'piercing_arrow', 'volley'],
    attackRange: 5,
    moveRange: 4,
  },
  ranger: {
    attackBonus: 3,
    defenseBonus: 0,
    dexBonus: 4,
    magicBonus: 0,
    critRateBonus: 4,
    evasionBonus: 4,
    abilities: ['trap', 'snare', 'multi_shot'],
    attackRange: 4,
    moveRange: 5,
  },
  mage: {
    attackBonus: 0,
    defenseBonus: -2,
    dexBonus: 2,
    magicBonus: 8,
    critRateBonus: 3,
    evasionBonus: 2,
    abilities: ['fireball', 'ice_bolt', 'lightning'],
    attackRange: 3,
    moveRange: 3,
  },
  necromancer: {
    attackBonus: 1,
    defenseBonus: -1,
    dexBonus: 1,
    magicBonus: 10,
    critRateBonus: 5,
    evasionBonus: 1,
    abilities: ['summon_undead', 'life_drain', 'curse'],
    attackRange: 3,
    moveRange: 3,
  },
  healer: {
    attackBonus: 0,
    defenseBonus: 0,
    dexBonus: 1,
    magicBonus: 6,
    critRateBonus: 0,
    evasionBonus: 1,
    abilities: ['heal', 'group_heal', 'bless'],
    attackRange: 2,
    moveRange: 3,
  },
  thief: {
    attackBonus: 2,
    defenseBonus: -2,
    dexBonus: 7,
    magicBonus: 0,
    critRateBonus: 8,
    evasionBonus: 8,
    abilities: ['backstab', 'steal', 'smoke_bomb'],
    attackRange: 1,
    moveRange: 5,
  },
  assassin: {
    attackBonus: 4,
    defenseBonus: -2,
    dexBonus: 6,
    magicBonus: 0,
    critRateBonus: 10,
    evasionBonus: 6,
    abilities: ['poison_blade', 'vanish', 'critical_strike'],
    attackRange: 1,
    moveRange: 5,
  },
};

// ========== CLASS TO WEAPON MAPPING ==========
// Used to determine equipment when classId is provided but no explicit equipment

export const CLASS_WEAPONS: Record<string, WeaponType[]> = {
  warrior: [WeaponType.SWORD],
  knight: [WeaponType.SWORD, WeaponType.SHIELD],
  berserker: [WeaponType.AXE],
  archer: [WeaponType.BOW],
  ranger: [WeaponType.BOW],
  mage: [WeaponType.STAFF],
  necromancer: [WeaponType.STAFF],
  healer: [WeaponType.STAFF],
  thief: [WeaponType.DAGGER],
  assassin: [WeaponType.DAGGER],
};

// ========== MAIN FACTORY FUNCTION ==========

export interface CreateCreatureOptions {
  raceId: string;
  classId?: string;
  type?: CreatureType;
  element?: ElementType;
  rank?: CreatureRank;
  tier?: CreatureTier;
  level: number;
  customId?: string;
  customName?: string;
  kind?: CreatureKind;
  equipment?: WeaponType[];  // Explicit equipment (overrides template)
}

/**
 * Create a creature from modular components
 */
export function createCreature(options: CreateCreatureOptions): Unit {
  const {
    raceId,
    classId,
    type = CreatureType.BEAST,
    element = ElementType.NEUTRAL,
    rank = CreatureRank.NORMAL,
    tier = CreatureTier.TIER_1,
    level,
    customId,
    customName,
    kind = CreatureKind.MONSTER,
  } = options;
  
  // Get template
  const template = getCreatureTemplate(raceId);
  if (!template) {
    throw new Error(`Creature template not found: ${raceId}`);
  }
  
  const classMod = classId ? CLASS_MODIFIERS[classId] : undefined;
  const elementMod = ELEMENT_MODIFIERS[element];
  
  const rankMult = RANK_MULTIPLIERS[rank];
  const tierScale = TIER_SCALING[tier];
  const totalMultiplier = rankMult * tierScale;
  const levelOffset = Math.max(0, level - 1);
  
  // Calculate base stats
  const baseVit = template.baseVit + (classMod?.dexBonus || 0); // Using dexBonus as vit bonus proxy
  const baseAttack = template.baseAttack + (classMod?.attackBonus || 0) + elementMod.attackBonus;
  const baseDefense = template.baseDefense + (classMod?.defenseBonus || 0) + elementMod.defenseBonus;
  const baseDex = template.baseDex + (classMod?.dexBonus || 0);
  const baseMagic = template.baseMagic + (classMod?.magicBonus || 0);
  const baseMana = template.baseMana;
  const baseHp = template.baseHp;
  
  // Apply growth
  const vit = baseVit + (template.growth.vit * levelOffset);
  const attack = baseAttack + (template.growth.attack * levelOffset);
  const defense = baseDefense + (template.growth.defense * levelOffset);
  const dex = baseDex + (template.growth.dex * levelOffset);
  const magic = baseMagic + (template.growth.magic * levelOffset);
  const mana = baseMana + (template.growth.mana * levelOffset);
  const hp = baseHp + (template.growth.hp * levelOffset);
  
  // Calculate derived stats with multipliers
  const finalHp = Math.floor((vit * 10 + hp) * totalMultiplier);
  const finalMana = Math.floor((magic * 10 + mana) * totalMultiplier);
  const finalAttack = Math.floor(attack * totalMultiplier);
  const finalDefense = Math.floor(defense * totalMultiplier);
  const finalDex = Math.floor(dex * totalMultiplier);
  const finalMagic = Math.floor(magic * totalMultiplier);
  
  // Calculate bonuses
  const critRate = template.critRateBonus + (classMod?.critRateBonus || 0);
  const critDamage = 1.0 + template.critDamageBonus;
  const evasion = template.evasionBonus + Math.floor(finalDex * 0.1) + (classMod?.evasionBonus || 0);
  const resistance = Math.floor((template.resistanceBonus + elementMod.resistanceBonus + tierScale * 2) * rankMult);
  
  // ========== APPLY TRAIT BONUSES ==========
  // Get trait bonuses from template's traits
  const templateTraits = template.traits ?? [];
  const traitBonuses = getTraitStatBonuses(templateTraits);
  
  // Trait bonuses are applied on top of existing bonuses
  const traitAttackBonus = traitBonuses.attackBonus ?? 0;
  const traitDefenseBonus = traitBonuses.defenseBonus ?? 0;
  const traitCritRateBonus = traitBonuses.critRateBonus ?? 0;
  const traitCritDamageBonus = traitBonuses.critDamageBonus ?? 0;
  const traitEvasionBonus = traitBonuses.evasionBonus ?? 0;
  const traitResistanceBonus = traitBonuses.resistanceBonus ?? 0;
  const traitLifeStealBonus = traitBonuses.lifeStealBonus ?? 0;
  const traitSpellVampBonus = traitBonuses.spellVampBonus ?? 0;
  const traitDamageReductionBonus = traitBonuses.damageReductionBonus ?? 0;
  const traitStatusResistanceBonus = traitBonuses.statusResistanceBonus ?? 0;
  
  // Generate name
  const elementPrefix = element !== ElementType.NEUTRAL ? `${element.charAt(0).toUpperCase() + element.slice(1)} ` : '';
  const classSuffix = classId ? ` ${classId.charAt(0).toUpperCase() + classId.slice(1)}` : '';
  const rankPrefix = rank !== CreatureRank.NORMAL ? `${rank} ` : '';
  
  const finalName = customName || `${rankPrefix}${elementPrefix}${template.name}${classSuffix}`;
  
  // Generate ID
  const elementSuffix = element !== ElementType.NEUTRAL ? `_${element}` : '';
  const classSuffixId = classId ? `_${classId}` : '';
  const rankSuffix = rank !== CreatureRank.NORMAL ? `_${rank}` : '';
  const tierSuffix = tier > 1 ? `_t${tier}` : '';
  
  const finalId = customId || `${raceId}${elementSuffix}${classSuffixId}${rankSuffix}${tierSuffix}_${level}`;
  
  // ========== DETERMINE EQUIPMENT & GRID STATS ==========
  // Priority: explicit equipment > classId > template equipment > auto-detect from template ID
  
  let finalEquipment: WeaponType[];
  
  // 1. Use explicit equipment if provided
  if (options.equipment && options.equipment.length > 0) {
    finalEquipment = options.equipment;
  }
  // 2. Use class-based weapons if classId is provided
  else if (classId && CLASS_WEAPONS[classId]) {
    finalEquipment = CLASS_WEAPONS[classId];
  }
  // 3. Use template equipment if available
  else if (template.equipment && template.equipment.length > 0) {
    finalEquipment = template.equipment;
  }
  // 4. Fallback to monster weapon set
  else {
    finalEquipment = getMonsterWeaponSet(raceId);
  }
  
  // Calculate grid stats from equipment
  // Use the first weapon that can attack
  let attackRange = 1;
  let moveRange = 3;
  let minRange = 0;
  
  for (const weaponType of finalEquipment) {
    const weaponStats = getWeaponStats(weaponType);
    
    // Use the weapon with the longest attack range
    if (weaponStats.attackRange > attackRange) {
      attackRange = weaponStats.attackRange;
      moveRange = weaponStats.moveRange;
      minRange = weaponStats.minRange;
    }
  }
  
  return {
    id: finalId,
    name: finalName,
    level,
    
    // Primary stats (with trait bonuses applied to attack/defense)
    vit: Math.floor(vit) + (traitBonuses.vitBonus ?? 0),
    hp: finalHp + (traitBonuses.hpBonus ?? 0),
    maxHp: finalHp + (traitBonuses.hpBonus ?? 0),
    mana: finalMana + (traitBonuses.manaBonus ?? 0),
    maxMana: finalMana + (traitBonuses.manaBonus ?? 0),
    attack: finalAttack + traitAttackBonus,
    defense: finalDefense + traitDefenseBonus,
    speed: finalDex + (traitBonuses.dexBonus ?? 0),
    magic: finalMagic + (traitBonuses.magicBonus ?? 0),
    
    // Secondary stats (with trait bonuses applied)
    critRate: critRate + traitCritRateBonus,
    critDamage: critDamage + traitCritDamageBonus,
    evasion: evasion + traitEvasionBonus,
    accuracy: 75 + Math.floor(finalDex * 0.5) + (traitBonuses.accuracyBonus ?? 0),
    block: 5 + Math.floor(finalDefense * 0.3) + (traitBonuses.blockBonus ?? 0),
    resistance: resistance + traitResistanceBonus,
    damageReduction: traitDamageReductionBonus,
    statusResistance: traitStatusResistanceBonus,
    tenacity: 0,
    attackSpeed: 1.0,
    // LifeSteal: template bonus + trait bonus
    lifeSteal: (template.lifeStealBonus ?? 0) + traitLifeStealBonus,
    // SpellVamp: from traits only
    spellVamp: traitSpellVampBonus,
    // CastSpeed: default 100 (1.0x), can be modified by traits in future
    castSpeed: 100,
    
    // Grid stats
    attackRange,
    moveRange,
    minRange,
    
    // Equipment
    equipment: finalEquipment,
    
    // Traits
    traits: template.traits ?? [],
    
    // Size
    size: template.size,
  };
}

// ========== CONVENIENCE FACTORIES ==========

/**
 * Create a monster from template
 */
export function createMonsterFromTemplate(
  templateId: string,
  level: number,
  id: string,
  rank?: CreatureRank,
  customName?: string,
  element?: ElementType
): Unit {
  return createCreature({
    raceId: templateId,
    level,
    customId: id,
    customName,
    kind: CreatureKind.MONSTER,
    rank,
    element,
  });
}

/**
 * Create a player character
 */
export function createPlayer(
  raceId: string,
  classId: string,
  level: number,
  id: string,
  customName?: string
): Unit {
  return createCreature({
    raceId,
    classId,
    level,
    customId: id,
    customName,
    kind: CreatureKind.PLAYER,
    type: CreatureType.HUMANOID,
  });
}

/**
 * Create an NPC
 */
export function createNPC(
  raceId: string,
  level: number,
  id: string,
  customName?: string,
  classId?: string
): Unit {
  return createCreature({
    raceId,
    classId,
    level,
    customId: id,
    customName,
    kind: CreatureKind.NPC,
    type: CreatureType.HUMANOID,
  });
}

/**
 * Create a monster party
 */
export function createMonsterParty(
  templateId: string,
  level: number,
  count: number = 1,
  rank?: CreatureRank
): Unit[] {
  const units: Unit[] = [];
  
  for (let i = 0; i < count; i++) {
    units.push(createMonsterFromTemplate(templateId, level, `${templateId}_${i}`, rank));
  }
  
  return units;
}

/**
 * Calculate monster rewards
 */
export function calculateMonsterRewards(
  template: CreatureTemplate,
  level: number,
  rank: CreatureRank = CreatureRank.NORMAL
): { exp: number; gold: number; dropChance: number } {
  const levelMult = 1 + (level - 1) * 0.1;
  const rankMult = RANK_MULTIPLIERS[rank];
  
  const exp = Math.floor(template.baseExpReward * levelMult * rankMult);
  const gold = Math.floor(template.baseGoldReward * levelMult * rankMult);
  
  // Higher rank = higher drop chance
  const dropChance = 0.3 + (rankMult - 1) * 0.2;
  
  return { exp, gold, dropChance: Math.min(1, dropChance) };
}

// ========== QUICK CREATION FUNCTIONS ==========

// Slime family
export const createSlime = (level: number, id: string) => 
  createCreature({ raceId: 'base_slime', level, customId: id, type: CreatureType.BEAST });

export const createFireSlime = (level: number, id: string) =>
  createCreature({ raceId: 'base_slime', level, customId: id, type: CreatureType.ELEMENTAL, element: ElementType.FIRE });

export const createWaterSlime = (level: number, id: string) =>
  createCreature({ raceId: 'base_slime', level, customId: id, type: CreatureType.ELEMENTAL, element: ElementType.WATER });

export const createDarkSlime = (level: number, id: string) =>
  createCreature({ raceId: 'base_slime', level, customId: id, type: CreatureType.ABERRATION, element: ElementType.DARK });

// Skeleton family
export const createSkeleton = (level: number, id: string) =>
  createCreature({ raceId: 'base_skeleton', level, customId: id, type: CreatureType.UNDEAD });

export const createSkeletonArcher = (level: number, id: string) =>
  createCreature({ raceId: 'base_skeleton', level, customId: id, type: CreatureType.UNDEAD, classId: 'archer' });

export const createSkeletonKnight = (level: number, id: string) =>
  createCreature({ raceId: 'base_skeleton', level, customId: id, type: CreatureType.UNDEAD, classId: 'knight' });

// Dragon family
export const createDragon = (level: number, id: string, rank: CreatureRank = CreatureRank.NORMAL) =>
  createCreature({ raceId: 'base_dragon', level, customId: id, type: CreatureType.DRAGON, rank });

export const createDragonMage = (level: number, id: string, rank: CreatureRank = CreatureRank.NORMAL) =>
  createCreature({ raceId: 'base_dragon', level, customId: id, type: CreatureType.DRAGON, classId: 'mage', rank });

// Boss
export const createBoss = (raceId: string, level: number, id: string, tier: CreatureTier = CreatureTier.TIER_4) =>
  createCreature({ raceId, level, customId: id, type: CreatureType.BEAST, rank: CreatureRank.BOSS, tier });

// Re-export for convenience
export { CreatureType, CreatureRank, CreatureTier, CreatureKind, RANK_MULTIPLIERS, TIER_SCALING };
