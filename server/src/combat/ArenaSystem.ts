/**
 * Arena System
 * 
 * Dynamic grid-based combat arena that automatically sizes
 * based on the number of fighting units.
 * 
 * Supports:
 * - 50v50 battles (50x50)
 * - 50v1 boss battles
 * - 10x10, 5x5, or any size
 * - Flexible spawn zones
 */

import { GridSystem, GridConfig, createPosition } from './GridSystem.js';
import { Position } from './TickCost.js';

// ========== ARENA CONFIG ==========

export interface ArenaConfig {
  gridSize: GridConfig;
  spawnZones: SpawnZoneConfig;
  teamCount: number;
}

export interface SpawnZoneConfig {
  team1: { xMin: number; xMax: number; yMin: number; yMax: number };
  team2: { xMin: number; xMax: number; yMin: number; yMax: number };
  boss?: { xMin: number; xMax: number; yMin: number; yMax: number };
}

export interface UnitCountConfig {
  playerCount: number;
  enemyCount: number;
  isBossBattle: boolean;
}

// ========== GRID SIZE CALCULATOR ==========

/**
 * Calculate optimal grid size based on unit count
 * 
 * Rules:
 * - Each unit needs ~1-2 cells for comfortable movement
 * - Add padding for tactical space
 * - Min 5x5, Max 50x50
 */
export function calculateGridSize(
  playerCount: number, 
  enemyCount: number,
  isBossBattle: boolean = false
): GridConfig {
  const totalUnits = playerCount + enemyCount;
  
  // Minimum arena sizes
  const MIN_SIZE = 5;
  const MAX_SIZE = 50;
  
  let size: number;
  
  if (isBossBattle) {
    // Boss battles: 50x50 for big battles, smaller for solo boss
    if (playerCount >= 20) {
      size = 50; // Large party vs boss
    } else if (playerCount >= 10) {
      size = 30;
    } else {
      size = 20;
    }
  } else {
    // Regular battles
    // Formula: sqrt(totalUnits) * 2 for comfortable spacing
    // Then round up to nearest odd number for symmetry
    const calculated = Math.ceil(Math.sqrt(totalUnits) * 1.5);
    size = Math.max(MIN_SIZE, Math.min(MAX_SIZE, calculated));
    
    // Ensure odd number for center spawning
    if (size % 2 === 0) size++;
  }
  
  // Cap at MAX_SIZE
  size = Math.min(size, MAX_SIZE);
  
  return {
    width: size,
    height: size
  };
}

/**
 * Calculate spawn zones based on grid size
 */
export function calculateSpawnZones(
  gridSize: GridConfig,
  playerCount: number,
  enemyCount: number,
  isBossBattle: boolean = false
): SpawnZoneConfig {
  const width = gridSize.width;
  const height = gridSize.height;
  
  if (isBossBattle) {
    // Boss spawns in center, players spawn around edges
    const centerX = Math.floor(width / 2);
    const centerY = Math.floor(height / 2);
    const bossZone = 3; // Boss spawns in 3x3 center
    
    return {
      team1: {
        // Player team - spawn on left half
        xMin: 0,
        xMax: Math.floor(width / 2) - 2,
        yMin: 0,
        yMax: height - 1
      },
      team2: {
        // Boss zone - center
        xMin: centerX - bossZone,
        xMax: centerX + bossZone,
        yMin: centerY - bossZone,
        yMax: centerY + bossZone
      }
    };
  } else {
    // Normal battle: left vs right
    const margin = Math.max(1, Math.floor(width * 0.05)); // 5% margin
    const halfWidth = Math.floor(width / 2);
    
    // Ensure minimum zone width of 1 for small grids
    const team1RightEdge = Math.max(margin, halfWidth - 1);
    const team2LeftEdge = Math.min(width - 1 - margin, halfWidth + 1);
    
    return {
      team1: {
        // Player team - left side
        xMin: margin,
        xMax: team1RightEdge,
        yMin: margin,
        yMax: height - 1 - margin
      },
      team2: {
        // Enemy team - right side
        xMin: team2LeftEdge,
        xMax: width - 1 - margin,
        yMin: margin,
        yMax: height - 1 - margin
      }
    };
  }
}

// ========== ARENA CLASS ==========

export class Arena {
  private grid: GridSystem;
  private config: ArenaConfig;
  private spawnZones: SpawnZoneConfig;
  
  constructor(unitConfig: UnitCountConfig) {
    // Calculate optimal grid size
    const gridSize = calculateGridSize(
      unitConfig.playerCount,
      unitConfig.enemyCount,
      unitConfig.isBossBattle
    );
    
    // Calculate spawn zones
    const spawnZones = calculateSpawnZones(
      gridSize,
      unitConfig.playerCount,
      unitConfig.enemyCount,
      unitConfig.isBossBattle
    );
    
    this.config = {
      gridSize,
      spawnZones,
      teamCount: unitConfig.enemyCount > 1 ? 2 : 1
    };
    
    this.spawnZones = spawnZones;
    this.grid = new GridSystem(gridSize);
  }
  
  /**
   * Get the grid system
   */
  getGrid(): GridSystem {
    return this.grid;
  }
  
  /**
   * Get arena config
   */
  getConfig(): ArenaConfig {
    return this.config;
  }
  
  /**
   * Get spawn zones
   */
  getSpawnZones(): SpawnZoneConfig {
    return this.spawnZones;
  }
  
  /**
   * Get arena dimensions
   */
  getDimensions(): { width: number; height: number } {
    return {
      width: this.config.gridSize.width,
      height: this.config.gridSize.height
    };
  }
  
  /**
   * Spawn unit in appropriate zone
   * Supports dynamic team IDs (e.g., team0, team1, team2, etc.)
   */
  spawnUnit(
    unitId: string,
    team: string,  // Dynamic team ID
    preferredPosition?: Position
  ): Position | null {
    let zone: { xMin: number; xMax: number; yMin: number; yMax: number };
    
    if (team === 'boss' && this.spawnZones.boss) {
      zone = this.spawnZones.boss;
    } else if (team === 'team1') {
      zone = this.spawnZones.team1;
    } else if (team === 'team2') {
      zone = this.spawnZones.team2;
    } else {
      return null;
    }
    
    // If preferred position provided and valid, use it
    if (preferredPosition && this.isInZone(preferredPosition, zone)) {
      if (!this.grid.isPositionOccupied(preferredPosition)) {
        this.grid.setPosition(unitId, preferredPosition);
        return preferredPosition;
      }
    }
    
    // Find random empty position in zone
    const position = this.findEmptyPositionInZone(zone);
    if (position) {
      this.grid.setPosition(unitId, position);
      return position;
    }
    
    return null;
  }
  
  /**
   * Check if position is within zone
   */
  private isInZone(
    pos: Position, 
    zone: { xMin: number; xMax: number; yMin: number; yMax: number }
  ): boolean {
    return (
      pos.x >= zone.xMin && pos.x <= zone.xMax &&
      pos.y >= zone.yMin && pos.y <= zone.yMax
    );
  }
  
  /**
   * Find empty position in zone
   */
  private findEmptyPositionInZone(
    zone: { xMin: number; xMax: number; yMin: number; yMax: number }
  ): Position | null {
    const attempts = 50;
    
    for (let i = 0; i < attempts; i++) {
      const x = Math.floor(Math.random() * (zone.xMax - zone.xMin + 1)) + zone.xMin;
      const y = Math.floor(Math.random() * (zone.yMax - zone.yMin + 1)) + zone.yMin;
      const pos = createPosition(x, y);
      
      if (!this.grid.isPositionOccupied(pos)) {
        return pos;
      }
    }
    
    return null;
  }
  
  /**
   * Get arena info as string
   */
  toString(): string {
    return `Arena(${this.config.gridSize.width}x${this.config.gridSize.height})`;
  }
}

// ========== FACTORY FUNCTIONS ==========

/**
 * Create arena for specific battle types
 */
export function createArena(playerCount: number, enemyCount: number): Arena {
  return new Arena({
    playerCount,
    enemyCount,
    isBossBattle: enemyCount === 1
  });
}

/**
 * Create 50v50 battle arena
 */
export function create50v50Arena(): Arena {
  return createArena(50, 50);
}

/**
 * Create boss battle arena
 */
export function createBossArena(playerCount: number): Arena {
  return new Arena({
    playerCount,
    enemyCount: 1,
    isBossBattle: true
  });
}

/**
 * Create small arena (5v5 or less)
 */
export function createSmallArena(playerCount: number, enemyCount: number): Arena {
  return new Arena({
    playerCount: Math.min(playerCount, 5),
    enemyCount: Math.min(enemyCount, 5),
    isBossBattle: false
  });
}

/**
 * Get recommended grid size description
 */
export function getRecommendedGridSize(unitCount: number): string {
  const sizes = [
    { units: 2, size: '5x5', desc: 'Duel' },
    { units: 6, size: '7x7', desc: 'Small skirmish' },
    { units: 10, size: '9x9', desc: 'Small team battle' },
    { units: 20, size: '15x15', desc: 'Medium battle' },
    { units: 30, size: '21x21', desc: 'Large battle' },
    { units: 50, size: '25x25', desc: 'Massive battle' },
    { units: 100, size: '50x50', desc: 'Epic war' },
  ];
  
  for (const s of sizes) {
    if (unitCount <= s.units) {
      return `${s.size} - ${s.desc}`;
    }
  }
  
  return '50x50 - Maximum';
}
