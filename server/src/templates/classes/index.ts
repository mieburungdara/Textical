/**
 * Class Templates Index
 * 
 * Central export point for all class templates.
 * Import individual classes here for customization.
 */

import { ClassTemplate, JobTier, JobCategory } from '../ClassTemplate.js';

// Import all class templates
import { novice } from './novice.js';
import { swordsman } from './swordsman.js';
import { mage } from './mage.js';
import { archer } from './archer.js';
import { thief } from './thief.js';
import { healer } from './healer.js';
import { knight } from './knight.js';
import { wizard } from './wizard.js';

// ========== CLASS REGISTRY ==========

export const CLASS_TEMPLATES: Record<string, ClassTemplate> = {
  novice,
  swordsman,
  mage,
  archer,
  thief,
  healer,
  knight,
  wizard,
};

// ========== JOB PROGRESSION ==========

export const JOB_PROGRESSION: Record<string, string[]> = {
  // Novice
  novice: ['swordsman', 'mage', 'archer', 'thief', 'healer'],
  
  // Physical
  swordsman: ['knight', 'berserker'],
  knight: ['grandmaster_sword', 'paladin'],
  
  // Ranged
  archer: ['ranger'],
  
  // Assassin
  thief: ['assassin', 'acrobat'],
  
  // Magic
  mage: ['wizard', 'warlock'],
  wizard: ['grandmaster_mage'],
  
  // Healer
  healer: ['priest', 'paladin'],
};

// ========== RE-EXPORT FOR CONVENIENCE ==========

export { JobTier, JobCategory };
export type { ClassTemplate, ClassStatGrowth } from '../ClassTemplate.js';
