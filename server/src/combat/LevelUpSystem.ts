/**
 * Level Up System
 * 
 * Handles unit progression through XP gains and level ups.
 * - XP required increases exponentially per level
 * - Level up grants stat increases based on class and race
 * - Max level is 99
 */

import { Unit } from './TickCost.js';

// ========== LEVEL CONSTANTS ==========

export const MAX_LEVEL = 99;
export const MIN_LEVEL = 1;
export const BASE_XP_REQUIRED = 100;  // XP needed for level 1→2

// ========== XP CURVE TYPES ==========

export enum XPCurve {
  FAST = 'fast',       // Quick leveling (casual players)
  NORMAL = 'normal',   // Standard curve
  SLOW = 'slow',       // Slow leveling (hardcore)
  BOSS = 'boss',       // Boss monsters need more XP
}

// XP curve multipliers
export const XP_CURVE_MULTIPLIERS: Record<XPCurve, number> = {
  [XPCurve.FAST]: 0.8,     // 80% of normal XP
  [XPCurve.NORMAL]: 1.0,    // Standard
  [XPCurve.SLOW]: 1.3,      // 130% of normal XP
  [XPCurve.BOSS]: 2.0,      // Bosses need double XP
};

// ========== LEVEL UP INTERFACES ==========

export interface UnitProgression {
  level: number;
  currentXp: number;
  totalXp: number;       // Lifetime XP earned
  xpCurve: XPCurve;
}

export interface LevelUpResult {
  oldLevel: number;
  newLevel: number;
  xpGained: number;
  statIncreases: StatIncrease[];
}

export interface StatIncrease {
  stat: string;
  oldValue: number;
  newValue: number;
}

// ========== XP CALCULATIONS ==========

/**
 * Calculate XP required for a specific level
 * Uses exponential curve: XP = base * (level^curve) * curveMultiplier
 */
export function calculateXPForLevel(level: number, curve: XPCurve = XPCurve.NORMAL): number {
  if (level <= 1) return 0;
  if (level > MAX_LEVEL) level = MAX_LEVEL;
  
  const multiplier = XP_CURVE_MULTIPLIERS[curve];
  
  // Exponential curve: each level requires more XP
  // Level 2 = 100, Level 10 = ~1000, Level 50 = ~25000, Level 99 = ~500000
  const baseXP = BASE_XP_REQUIRED * multiplier;
  const curveExponent = 1.8;  // How steep the curve is
  
  return Math.floor(baseXP * Math.pow(level - 1, curveExponent));
}

/**
 * Calculate total XP required to reach a specific level from level 1
 */
export function calculateTotalXPForLevel(targetLevel: number, curve: XPCurve = XPCurve.NORMAL): number {
  if (targetLevel <= 1) return 0;
  
  let totalXP = 0;
  for (let lvl = 2; lvl <= targetLevel; lvl++) {
    totalXP += calculateXPForLevel(lvl, curve);
  }
  
  return totalXP;
}

/**
 * Get current level from total XP
 */
export function getLevelFromXP(totalXp: number, curve: XPCurve = XPCurve.NORMAL): number {
  let level = 1;
  
  while (level < MAX_LEVEL) {
    const xpForNextLevel = calculateXPForLevel(level + 1, curve);
    if (totalXp < xpForNextLevel) break;
    totalXp -= xpForNextLevel;
    level++;
  }
  
  return level;
}

/**
 * Calculate XP reward for defeating an enemy
 */
export function calculateXPReward(
  enemyLevel: number,
  enemyBaseXP: number,
  playerLevel: number,
  isBoss: boolean = false
): number {
  // Level difference bonus/penalty
  const levelDiff = enemyLevel - playerLevel;
  let levelMultiplier = 1.0;
  
  if (levelDiff > 0) {
    // Fighting higher level enemies gives bonus XP
    levelMultiplier = 1.0 + (levelDiff * 0.1);  // +10% per level higher
  } else if (levelDiff < -5) {
    // Fighting much lower level enemies gives reduced XP
    levelMultiplier = Math.max(0.1, 1.0 + (levelDiff * 0.05));  // -5% per level lower (min 10%)
  }
  
  // Boss bonus
  const bossMultiplier = isBoss ? 2.0 : 1.0;
  
  // Base XP from enemy
  let xpReward = enemyBaseXP * levelMultiplier * bossMultiplier;
  
  // Scale with enemy level
  xpReward *= (1 + (enemyLevel - 1) * 0.1);
  
  return Math.floor(xpReward);
}

// ========== LEVEL UP CALCULATIONS ==========

/**
 * Calculate stat increase on level up
 * Based on class growth rates and race bonuses
 */
export function calculateStatIncrease(
  currentStat: number,
  growthRate: number,
  level: number
): number {
  // Each level adds: baseGrowth * (1 + level * 0.01)
  // This creates a curve where higher levels give slightly more
  const levelBonus = 1 + (level * 0.01);
  const increase = Math.floor(growthRate * levelBonus);
  
  return Math.max(1, increase);  // Minimum 1 per level
}

/**
 * Apply level up to a unit
 * Returns the level up result with all stat changes
 */
export function levelUpUnit(
  unit: Unit,
  xpGained: number,
  classGrowth: {
    hp?: number;
    vit?: number;
    attack?: number;
    defense?: number;
    dex?: number;
    magic?: number;
    mana?: number;
  },
  raceGrowth: {
    vit?: number;
    attack?: number;
    defense?: number;
    dex?: number;
    magic?: number;
  } = {}
): LevelUpResult | null {
  // Initialize or get progression
  if (!unit.progression) {
    unit.progression = {
      level: 1,
      currentXp: 0,
      totalXp: 0,
      xpCurve: XPCurve.NORMAL,
    };
  }
  
  const progression = unit.progression;
  const oldLevel = progression.level;
  
  // Add XP
  progression.currentXp += xpGained;
  progression.totalXp += xpGained;
  
  // Check for level ups (can be multiple if gained enough XP)
  let newLevel = oldLevel;
  const statIncreases: StatIncrease[] = [];
  const xpCurve = (progression.xpCurve as XPCurve) || XPCurve.NORMAL;
  
  while (newLevel < MAX_LEVEL) {
    const xpForNextLevel = calculateXPForLevel(newLevel + 1, xpCurve);
    
    if (progression.currentXp >= xpForNextLevel) {
      // Level up!
      progression.currentXp -= xpForNextLevel;
      newLevel++;
      
      // Calculate stat increases (automatic from growth rates)
      const statChanges = applyLevelUpStats(unit, newLevel, classGrowth, raceGrowth);
      statIncreases.push(...statChanges);
    } else {
      break;
    }
  }
  
  // Update unit level
  progression.level = newLevel;
  
  // Check if actually leveled up
  if (newLevel === oldLevel) {
    return null;  // No level up occurred
  }
  
  // Sync HP/Mana with new max
  if (unit.maxHp > 0) {
    unit.hp = Math.min(unit.hp, unit.maxHp);
  }
  if (unit.maxMana > 0) {
    unit.mana = Math.min(unit.mana, unit.maxMana);
  }
  
  return {
    oldLevel,
    newLevel,
    xpGained,
    statIncreases,
  };
}

/**
 * Apply stat increases from level up
 */
function applyLevelUpStats(
  unit: Unit,
  newLevel: number,
  classGrowth: {
    hp?: number;
    vit?: number;
    attack?: number;
    defense?: number;
    dex?: number;
    magic?: number;
    mana?: number;
  },
  raceGrowth: {
    vit?: number;
    attack?: number;
    defense?: number;
    dex?: number;
    magic?: number;
  }
): StatIncrease[] {
  const increases: StatIncrease[] = [];
  
  // HP: from VIT growth + HP growth
  const hpIncrease = calculateStatIncrease(
    unit.maxHp,
    (classGrowth.hp || 10) + (raceGrowth.vit || 0) * 5,
    newLevel
  );
  if (hpIncrease > 0) {
    const oldHp = unit.maxHp;
    unit.maxHp += hpIncrease;
    unit.hp += hpIncrease;  // Heal the amount gained
    increases.push({ stat: 'maxHp', oldValue: oldHp, newValue: unit.maxHp });
  }
  
  // Mana: from MAG growth + mana growth
  const manaIncrease = calculateStatIncrease(
    unit.maxMana || 0,
    (classGrowth.mana || 0) + (raceGrowth.magic || 0) * 2,
    newLevel
  );
  if (manaIncrease > 0 && unit.maxMana > 0) {
    const oldMana = unit.maxMana;
    unit.maxMana += manaIncrease;
    unit.mana += manaIncrease;
    increases.push({ stat: 'maxMana', oldValue: oldMana, newValue: unit.maxMana });
  }
  
  // Attack
  const atkIncrease = calculateStatIncrease(
    unit.attack,
    (classGrowth.attack || 2) + (raceGrowth.attack || 0),
    newLevel
  );
  if (atkIncrease > 0) {
    const oldAtk = unit.attack;
    unit.attack += atkIncrease;
    increases.push({ stat: 'attack', oldValue: oldAtk, newValue: unit.attack });
  }
  
  // Defense
  const defIncrease = calculateStatIncrease(
    unit.defense,
    (classGrowth.defense || 1) + (raceGrowth.defense || 0),
    newLevel
  );
  if (defIncrease > 0) {
    const oldDef = unit.defense;
    unit.defense += defIncrease;
    increases.push({ stat: 'defense', oldValue: oldDef, newValue: unit.defense });
  }
  
  // DEX (Speed)
  const dexIncrease = calculateStatIncrease(
    unit.speed,
    (classGrowth.dex || 2) + (raceGrowth.dex || 0),
    newLevel
  );
  if (dexIncrease > 0) {
    const oldDex = unit.speed;
    unit.speed += dexIncrease;
    increases.push({ stat: 'speed', oldValue: oldDex, newValue: unit.speed });
  }
  
  // Magic
  const magIncrease = calculateStatIncrease(
    unit.magic,
    (classGrowth.magic || 2) + (raceGrowth.magic || 0),
    newLevel
  );
  if (magIncrease > 0) {
    const oldMag = unit.magic;
    unit.magic += magIncrease;
    increases.push({ stat: 'magic', oldValue: oldMag, newValue: unit.magic });
  }
  
  return increases;
}

/**
 * Get XP progress percentage for current level
 */
export function getXPProgress(progression: UnitProgression): number {
  const xpForNextLevel = calculateXPForLevel(progression.level + 1, progression.xpCurve);
  if (xpForNextLevel === 0) return 100;
  
  return Math.min(100, (progression.currentXp / xpForNextLevel) * 100);
}

/**
 * Format XP needed for next level as string
 */
export function formatXPProgress(progression: UnitProgression): string {
  const xpForNextLevel = calculateXPForLevel(progression.level + 1, progression.xpCurve);
  return `${progression.currentXp} / ${xpForNextLevel} XP`;
}

// ========== LEVEL UP CHECK ==========

/**
 * Quick check if unit can level up
 */
export function canLevelUp(progression: UnitProgression): boolean {
  if (progression.level >= MAX_LEVEL) return false;
  
  const xpForNextLevel = calculateXPForLevel(progression.level + 1, progression.xpCurve);
  return progression.currentXp >= xpForNextLevel;
}

/**
 * Get levels that would be gained from XP amount
 */
export function getPotentialLevels(progression: UnitProgression, xpAmount: number): number {
  let tempXp = progression.currentXp + xpAmount;
  let tempLevel = progression.level;
  
  while (tempLevel < MAX_LEVEL) {
    const xpForNextLevel = calculateXPForLevel(tempLevel + 1, progression.xpCurve);
    if (tempXp >= xpForNextLevel) {
      tempXp -= xpForNextLevel;
      tempLevel++;
    } else {
      break;
    }
  }
  
  return tempLevel - progression.level;
}
