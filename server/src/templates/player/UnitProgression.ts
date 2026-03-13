/**
 * Unit Progression System
 * 
 * Handles XP, leveling, and attribute points for units.
 * Each unit can level up independently (max 50 units per party).
 * Uses exponential XP curves to make higher levels harder to reach.
 * 
 * Level 1 → 2: 752 XP
 * Level 10 → 11: ~15k XP
 * Level 100 → 101: ~860k XP
 * Level 200: ~3,000,000 XP
 */

import { Unit } from '../../combat/TickCost.js';

// ========== LEVEL CONSTANTS ==========

export const MAX_UNIT_LEVEL = 200;
export const MAX_UNITS_PER_PARTY = 50;
export const BASE_XP_REQUIRED = 216; // 216 * 200^1.8 ≈ 3,000,000 XP for level 200
export const XP_CURVE_EXPONENT = 1.8;

// Attribute points are automatic based on class/race growth rates
// See ClassTemplate.createUnitFromClass() for details

// ========== XP CURVE ==========

/**
 * Calculate XP required for a specific level
 * Formula: baseXP * level^exponent
 * 
 * @param level - The target level (1-200)
 * @returns XP needed to reach that level from level 1
 */
export function getXpRequiredForLevel(level: number): number {
  if (level <= 1) return 0;
  if (level > MAX_UNIT_LEVEL) level = MAX_UNIT_LEVEL;
  
  // Exponential curve: 216 * level^1.8
  return Math.floor(BASE_XP_REQUIRED * Math.pow(level, XP_CURVE_EXPONENT));
}

/**
 * Calculate XP needed to go from current level to next level
 * 
 * @param currentLevel - Current unit level (1-199)
 * @returns XP needed to level up
 */
export function getXpForNextLevel(currentLevel: number): number {
  if (currentLevel < 1) currentLevel = 1;
  if (currentLevel >= MAX_UNIT_LEVEL) return 0;
  
  const nextLevel = currentLevel + 1;
  const currentRequired = getXpRequiredForLevel(currentLevel);
  const nextRequired = getXpRequiredForLevel(nextLevel);
  
  return nextRequired - currentRequired;
}

/**
 * Calculate level from total XP
 * 
 * @param totalXp - Total XP accumulated
 * @returns Current level (1-200)
 */
export function getLevelFromXp(totalXp: number): number {
  if (totalXp < 0) return 1;
  
  for (let level = MAX_UNIT_LEVEL; level >= 1; level--) {
    const requiredXp = getXpRequiredForLevel(level);
    if (totalXp >= requiredXp) {
      return level;
    }
  }
  
  return 1;
}

/**
 * Calculate XP progress towards next level
 * 
 * @param totalXp - Total XP accumulated
 * @returns Progress (0.0 - 1.0)
 */
export function getXpProgress(totalXp: number): number {
  const currentLevel = getLevelFromXp(totalXp);
  if (currentLevel >= MAX_UNIT_LEVEL) return 1.0;
  
  const currentLevelXp = getXpRequiredForLevel(currentLevel);
  const nextLevelXp = getXpRequiredForLevel(currentLevel + 1);
  const xpIntoLevel = totalXp - currentLevelXp;
  const xpNeeded = nextLevelXp - currentLevelXp;
  
  return Math.max(0, Math.min(1, xpIntoLevel / xpNeeded));
}

// ========== UNIT PROGRESSION ==========

export interface UnitProgression {
  unitId: string;
  level: number;
  experience: number;
  totalXpEarned: number;
  
  // Level history
  levelUpHistory: LevelUpRecord[];
}

export interface LevelUpRecord {
  level: number;
  xpRequired: number;
  timestamp: number;
}

// ========== LEVEL UP ==========

export interface LevelUpResult {
  leveledUp: boolean;
  newLevel: number;
  xpRemaining: number;
}

/**
 * Add XP to unit and process level ups
 * 
 * @param progression - Unit progression object
 * @param xpGained - XP to add
 * @param autoLevelUp - If true, automatically level up. If false, just add XP.
 * @returns LevelUpResult with details
 */
export function addXpAndLevelUp(
  progression: UnitProgression,
  xpGained: number,
  autoLevelUp: boolean = true
): LevelUpResult {
  const result: LevelUpResult = {
    leveledUp: false,
    newLevel: progression.level,
    xpRemaining: 0,
  };
  
  if (xpGained <= 0) {
    return result;
  }
  
  // Add XP
  progression.experience += xpGained;
  progression.totalXpEarned += xpGained;
  
  // Calculate new level
  const newLevel = getLevelFromXp(progression.experience);
  
  // Check for level up
  if (newLevel > progression.level && autoLevelUp) {
    progression.level = newLevel;
    
    result.leveledUp = true;
    result.newLevel = newLevel;
  }
  
  result.xpRemaining = progression.experience - getXpRequiredForLevel(progression.level);
  
  return result;
}

/**
 * Create initial unit progression
 * 
 * @param unitId - The unit's unique ID
 * @param startingLevel - Starting level (default: 1)
 * @returns UnitProgression object
 */
export function createUnitProgression(unitId: string, startingLevel: number = 1): UnitProgression {
  const level = Math.max(1, Math.min(startingLevel, MAX_UNIT_LEVEL));
  const startingXp = getXpRequiredForLevel(level);
  
  return {
    unitId,
    level,
    experience: startingXp,
    totalXpEarned: startingXp,
    levelUpHistory: [],
  };
}

// ========== STAT DISTRIBUTION ==========

// Stats are now automatic based on class/race growth rates
// See ClassTemplate.createUnitFromClass() for automatic stat calculation
// and LevelUpSystem.applyLevelUpStats() for combat-based growth

// ========== PROGRESSION SUMMARY ==========

/**
 * Get detailed progression info
 */
export function getProgressionSummary(progression: UnitProgression): {
  level: number;
  xpToNext: number;
  xpProgress: number;
  totalXp: number;
} {
  const xpToNext = getXpForNextLevel(progression.level);
  const xpProgress = getXpProgress(progression.experience);
  
  return {
    level: progression.level,
    xpToNext,
    xpProgress,
    totalXp: progression.totalXpEarned,
  };
}

// ========== UNIT INTEGRATION ==========

// Stats are automatic based on class/race growth rates
// Use ClassTemplate.createUnitFromClass() to create units with proper growth
// For level-up stat increases, use LevelUpSystem.applyLevelUpStats()
