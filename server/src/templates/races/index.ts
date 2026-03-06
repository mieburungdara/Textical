/**
 * Race Templates Index
 * 
 * Central export point for all race templates.
 */

import { RaceTemplate, RaceType, RaceStatModifier } from '../RaceTemplate.js';

// Import all races
import { human } from './human.js';
import { elf } from './elf.js';
import { dwarf } from './dwarf.js';
import { orc } from './orc.js';

// ========== RACE REGISTRY ==========

export const RACE_TEMPLATES: Record<string, RaceTemplate> = {
  human,
  elf,
  dwarf,
  orc,
};

// ========== RE-EXPORT FOR CONVENIENCE ==========

export { RaceType, RaceStatModifier };
export type { RaceTemplate } from '../RaceTemplate.js';
