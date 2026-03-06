/**
 * Grid Stats Interface
 * 
 * Reusable interface for grid-based combat stats.
 * Used by Unit, ClassTemplate, MonsterTemplate, etc.
 */

export interface GridStats {
  attackRange: number;   // Range in tiles (1 = melee)
  moveRange: number;     // Movement in tiles per action
  minRange: number;     // Minimum range for ranged attacks
}

// ========== GRID STAT LIMITS ==========

export const GRID_STAT_LIMITS = {
  ATTACK_RANGE: { MIN: 1, MAX: 20 },
  MOVE_RANGE: { MIN: 1, MAX: 10 },
  MIN_RANGE: { MIN: 0, MAX: 5 },
} as const;

// ========== DEFAULT GRID STATS ==========

export const DEFAULT_GRID_STATS: GridStats = {
  attackRange: 1,     // Melee range
  moveRange: 3,       // 3 tiles per move
  minRange: 0,       // No minimum range
};

// ========== FACTORY FUNCTIONS ==========

/**
 * Create GridStats with optional overrides
 */
export function createGridStats(
  attackRange?: number,
  moveRange?: number,
  minRange?: number
): GridStats {
  return {
    attackRange: Math.max(
      GRID_STAT_LIMITS.ATTACK_RANGE.MIN,
      Math.min(GRID_STAT_LIMITS.ATTACK_RANGE.MAX, attackRange ?? DEFAULT_GRID_STATS.attackRange)
    ),
    moveRange: Math.max(
      GRID_STAT_LIMITS.MOVE_RANGE.MIN,
      Math.min(GRID_STAT_LIMITS.MOVE_RANGE.MAX, moveRange ?? DEFAULT_GRID_STATS.moveRange)
    ),
    minRange: Math.max(
      GRID_STAT_LIMITS.MIN_RANGE.MIN,
      Math.min(GRID_STAT_LIMITS.MIN_RANGE.MAX, minRange ?? DEFAULT_GRID_STATS.minRange)
    ),
  };
}

/**
 * Clamp GridStats to valid ranges
 */
export function clampGridStats(stats: GridStats): GridStats {
  return {
    attackRange: Math.max(
      GRID_STAT_LIMITS.ATTACK_RANGE.MIN,
      Math.min(GRID_STAT_LIMITS.ATTACK_RANGE.MAX, stats.attackRange)
    ),
    moveRange: Math.max(
      GRID_STAT_LIMITS.MOVE_RANGE.MIN,
      Math.min(GRID_STAT_LIMITS.MOVE_RANGE.MAX, stats.moveRange)
    ),
    minRange: Math.max(
      GRID_STAT_LIMITS.MIN_RANGE.MIN,
      Math.min(GRID_STAT_LIMITS.MIN_RANGE.MAX, stats.minRange)
    ),
  };
}
