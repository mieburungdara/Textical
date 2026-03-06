/**
 * Grid-Based Combat System
 * 
 * Manages unit positions, movement, and range calculations
 * for grid-based tactical combat.
 */

import { Unit, Position } from './TickCost.js';

// ========== GRID CONFIGURATION ==========

export interface GridConfig {
  width: number;   // Number of columns
  height: number;  // Number of rows
  cellSize?: number; // Optional: size of each cell in pixels
}

export const DEFAULT_GRID_CONFIG: GridConfig = {
  width: 8,
  height: 8,
};

// ========== GRID SYSTEM ==========

export class GridSystem {
  private width: number;
  private height: number;
  private units: Map<string, Position>; // unitId -> position
  
  constructor(config: GridConfig = DEFAULT_GRID_CONFIG) {
    this.width = config.width;
    this.height = config.height;
    this.units = new Map();
  }
  
  // ========== POSITION MANAGEMENT ==========
  
  /**
   * Set unit position on grid
   */
  setPosition(unitId: string, position: Position): boolean {
    if (!this.isValidPosition(position)) {
      return false;
    }
    this.units.set(unitId, { ...position });
    return true;
  }
  
  /**
   * Get unit position
   */
  getPosition(unitId: string): Position | undefined {
    return this.units.get(unitId);
  }
  
  /**
   * Remove unit from grid
   */
  removeUnit(unitId: string): boolean {
    return this.units.delete(unitId);
  }
  
  /**
   * Get all units on grid
   */
  getAllUnits(): Map<string, Position> {
    return new Map(this.units);
  }
  
  // ========== POSITION VALIDATION ==========
  
  /**
   * Check if position is within grid bounds
   */
  isValidPosition(position: Position): boolean {
    return (
      position.x >= 0 &&
      position.x < this.width &&
      position.y >= 0 &&
      position.y < this.height
    );
  }
  
  /**
   * Check if position is occupied by another unit
   */
  isPositionOccupied(position: Position, excludeUnitId?: string): string | null {
    for (const [unitId, unitPos] of this.units) {
      if (excludeUnitId && unitId === excludeUnitId) continue;
      if (unitPos.x === position.x && unitPos.y === position.y) {
        return unitId;
      }
    }
    return null;
  }
  
  // ========== DISTANCE CALCULATIONS ==========
  
  /**
   * Calculate Manhattan distance (grid-based, no diagonal)
   */
  getManhattanDistance(pos1: Position, pos2: Position): number {
    return Math.abs(pos1.x - pos2.x) + Math.abs(pos1.y - pos2.y);
  }
  
  /**
   * Calculate Euclidean distance (straight line)
   */
  getEuclideanDistance(pos1: Position, pos2: Position): number {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2)
    );
  }
  
  /**
   * Calculate Chebyshev distance (allows diagonal movement)
   * Used when diagonal movement costs 1
   */
  getChebyshevDistance(pos1: Position, pos2: Position): number {
    return Math.max(
      Math.abs(pos1.x - pos2.x),
      Math.abs(pos1.y - pos2.y)
    );
  }
  
  // ========== MOVEMENT ==========
  
  /**
   * Get all valid move positions within range
   * Uses BFS for pathfinding (can be blocked by other units)
   */
  getValidMovePositions(
    unit: Unit,
    position: Position,
    moveRange: number
  ): Position[] {
    const validPositions: Position[] = [];
    const visited = new Set<string>();
    const queue: { pos: Position; distance: number }[] = [
      { pos: position, distance: 0 }
    ];
    
    while (queue.length > 0) {
      const current = queue.shift()!;
      const key = `${current.pos.x},${current.pos.y}`;
      
      if (visited.has(key)) continue;
      visited.add(key);
      
      // Don't include starting position
      if (current.distance > 0) {
        validPositions.push(current.pos);
      }
      
      if (current.distance >= moveRange) continue;
      
      // Check 4 directions (up, down, left, right)
      const directions = [
        { x: 0, y: -1 },
        { x: 0, y: 1 },
        { x: -1, y: 0 },
        { x: 1, y: 0 },
      ];
      
      for (const dir of directions) {
        const newPos: Position = {
          x: current.pos.x + dir.x,
          y: current.pos.y + dir.y,
        };
        
        // Check bounds
        if (!this.isValidPosition(newPos)) continue;
        
        // Check if occupied (can't move through units)
        const occupant = this.isPositionOccupied(newPos, unit.id);
        if (occupant) continue;
        
        queue.push({ pos: newPos, distance: current.distance + 1 });
      }
    }
    
    return validPositions;
  }
  
  /**
   * Move unit to new position
   */
  moveUnit(unitId: string, newPosition: Position): boolean {
    const currentPos = this.units.get(unitId);
    if (!currentPos) return false;
    
    if (!this.isValidPosition(newPosition)) return false;
    if (this.isPositionOccupied(newPosition, unitId)) return false;
    
    this.units.set(unitId, { ...newPosition });
    return true;
  }
  
  // ========== ATTACK RANGE ==========
  
  /**
   * Check if target is within attack range
   * Uses Manhattan distance by default
   */
  isInAttackRange(
    attackerPos: Position,
    targetPos: Position,
    attackRange: number,
    minRange: number = 0
  ): boolean {
    const distance = this.getManhattanDistance(attackerPos, targetPos);
    return distance >= minRange && distance <= attackRange;
  }
  
  /**
   * Get all units within attack range
   */
  getUnitsInAttackRange(
    attackerPos: Position,
    attackRange: number,
    minRange: number = 0,
    excludeUnitId?: string
  ): string[] {
    const inRange: string[] = [];
    
    for (const [unitId, position] of this.units) {
      if (excludeUnitId && unitId === excludeUnitId) continue;
      
      if (this.isInAttackRange(attackerPos, position, attackRange, minRange)) {
        inRange.push(unitId);
      }
    }
    
    return inRange;
  }
  
  // ========== GRID INFO ==========
  
  getWidth(): number {
    return this.width;
  }
  
  getHeight(): number {
    return this.height;
  }
  
  /**
   * Get grid size as string (e.g., "8x8")
   */
  getSizeString(): string {
    return `${this.width}x${this.height}`;
  }
}

// ========== HELPER FUNCTIONS ==========

/**
 * Create a position object
 */
export function createPosition(x: number, y: number): Position {
  return { x, y };
}

/**
 * Check if two positions are equal
 */
export function positionsEqual(pos1: Position, pos2: Position): boolean {
  return pos1.x === pos2.x && pos1.y === pos2.y;
}

/**
 * Get direction from one position to another
 * Returns: 'up', 'down', 'left', 'right', or 'diagonal'
 */
export function getDirection(from: Position, to: Position): string {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  
  if (dx === 0 && dy < 0) return 'up';
  if (dx === 0 && dy > 0) return 'down';
  if (dy === 0 && dx < 0) return 'left';
  if (dy === 0 && dx > 0) return 'right';
  
  // Diagonal
  if (dx < 0 && dy < 0) return 'up-left';
  if (dx > 0 && dy < 0) return 'up-right';
  if (dx < 0 && dy > 0) return 'down-left';
  if (dx > 0 && dy > 0) return 'down-right';
  
  return 'same';
}

/**
 * Initialize unit position on grid
 * Places unit in random empty position
 */
export function initializeUnitPosition(
  grid: GridSystem,
  unitId: string,
  preferredSide: 'left' | 'right' | 'random' = 'random'
): Position | null {
  const width = grid.getWidth();
  const height = grid.getHeight();
  
  // Define spawn zones
  let validX: number[];
  if (preferredSide === 'left') {
    validX = [0, 1, 2];
  } else if (preferredSide === 'right') {
    validX = [width - 3, width - 2, width - 1];
  } else {
    validX = Array.from({ length: width }, (_, i) => i);
  }
  
  // Try to find empty position
  const attempts = 50;
  for (let i = 0; i < attempts; i++) {
    const x = validX[Math.floor(Math.random() * validX.length)];
    const y = Math.floor(Math.random() * height);
    const pos = createPosition(x, y);
    
    if (!grid.isPositionOccupied(pos)) {
      grid.setPosition(unitId, pos);
      return pos;
    }
  }
  
  return null;
}
