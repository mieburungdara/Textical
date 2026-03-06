/**
 * Types Index
 * 
 * Central export for all creature type templates.
 */

export * from './_base.js';

// Beast types
export { 
  BEAST_TYPE, 
  SLIME_TYPE, 
  WOLF_TYPE, 
  SPIDER_TYPE 
} from './beast.js';

// Undead types
export { 
  UNDEAD_TYPE, 
  SKELETON_TYPE, 
  ZOMBIE_TYPE, 
  GHOST_TYPE, 
  LICH_TYPE 
} from './undead.js';

// Humanoid types
export { 
  HUMANOID_TYPE, 
  GOBLIN_TYPE, 
  ORC_TYPE, 
  HUMAN_TYPE, 
  ELF_TYPE, 
  DWARF_TYPE,
  TROLL_TYPE 
} from './humanoid.js';

// Dragon types
export { 
  DRAGON_TYPE, 
  DRAGON_WHELP_TYPE, 
  ANCIENT_DRAGON_TYPE 
} from './dragon.js';

// Demon types
export { 
  DEMON_TYPE, 
  DEMON_LORD_TYPE 
} from './demon.js';

// Elemental types
export { 
  ELEMENTAL_TYPE, 
  FIRE_ELEMENTAL_TYPE, 
  WATER_ELEMENTAL_TYPE, 
  EARTH_ELEMENTAL_TYPE, 
  WIND_ELEMENTAL_TYPE 
} from './elemental.js';

// Type registry for easy lookup
import { CreatureType, CreatureTypeTemplate } from './_base.js';
import { BEAST_TYPE, SLIME_TYPE, WOLF_TYPE, SPIDER_TYPE } from './beast.js';
import { UNDEAD_TYPE, SKELETON_TYPE, ZOMBIE_TYPE, GHOST_TYPE, LICH_TYPE } from './undead.js';
import { HUMANOID_TYPE, GOBLIN_TYPE, ORC_TYPE, HUMAN_TYPE, ELF_TYPE, DWARF_TYPE, TROLL_TYPE } from './humanoid.js';
import { DRAGON_TYPE, DRAGON_WHELP_TYPE, ANCIENT_DRAGON_TYPE } from './dragon.js';
import { DEMON_TYPE, DEMON_LORD_TYPE } from './demon.js';
import { ELEMENTAL_TYPE, FIRE_ELEMENTAL_TYPE, WATER_ELEMENTAL_TYPE, EARTH_ELEMENTAL_TYPE, WIND_ELEMENTAL_TYPE } from './elemental.js';

export const TYPE_TEMPLATES: Record<CreatureType, CreatureTypeTemplate> = {
  [CreatureType.BEAST]: BEAST_TYPE,
  [CreatureType.UNDEAD]: UNDEAD_TYPE,
  [CreatureType.DEMON]: DEMON_TYPE,
  [CreatureType.DRAGON]: DRAGON_TYPE,
  [CreatureType.ELEMENTAL]: ELEMENTAL_TYPE,
  [CreatureType.HUMANOID]: HUMANOID_TYPE,
  [CreatureType.CONSTRUCT]: HUMANOID_TYPE, // Fallback
  [CreatureType.GIANT]: TROLL_TYPE,
  [CreatureType.PLANT]: BEAST_TYPE, // Fallback
  [CreatureType.BUG]: SPIDER_TYPE,
  [CreatureType.SPIRIT]: GHOST_TYPE,
  [CreatureType.MECHANICAL]: HUMANOID_TYPE, // Fallback
  [CreatureType.CELESTIAL]: ELEMENTAL_TYPE, // Fallback
  [CreatureType.ABERRATION]: LICH_TYPE,
};

// Special type variants registry
export const TYPE_VARIANTS: Record<string, CreatureTypeTemplate> = {
  // Beast variants
  slime: SLIME_TYPE,
  wolf: WOLF_TYPE,
  spider: SPIDER_TYPE,
  
  // Undead variants
  skeleton: SKELETON_TYPE,
  zombie: ZOMBIE_TYPE,
  ghost: GHOST_TYPE,
  lich: LICH_TYPE,
  
  // Humanoid variants
  goblin: GOBLIN_TYPE,
  orc: ORC_TYPE,
  human: HUMAN_TYPE,
  elf: ELF_TYPE,
  dwarf: DWARF_TYPE,
  troll: TROLL_TYPE,
  
  // Dragon variants
  dragon: DRAGON_TYPE,
  dragon_whelp: DRAGON_WHELP_TYPE,
  ancient_dragon: ANCIENT_DRAGON_TYPE,
  
  // Demon variants
  demon: DEMON_TYPE,
  demon_lord: DEMON_LORD_TYPE,
  
  // Elemental variants
  fire_elemental: FIRE_ELEMENTAL_TYPE,
  water_elemental: WATER_ELEMENTAL_TYPE,
  earth_elemental: EARTH_ELEMENTAL_TYPE,
  wind_elemental: WIND_ELEMENTAL_TYPE,
};

/**
 * Get type template by type or variant name
 */
export function getTypeTemplate(typeOrVariant: string): CreatureTypeTemplate | undefined {
  // Try as variant first
  if (TYPE_VARIANTS[typeOrVariant]) {
    return TYPE_VARIANTS[typeOrVariant];
  }
  // Try as CreatureType
  if (TYPE_TEMPLATES[typeOrVariant as CreatureType]) {
    return TYPE_TEMPLATES[typeOrVariant as CreatureType];
  }
  return undefined;
}
