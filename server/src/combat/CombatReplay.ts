/**
 * Combat Replay System
 * 
 * Creates Godot-compatible replay data for visualizing combat.
 * Only records IMPORTANT events to keep file size small.
 * 
 * Events recorded:
 * - Combat start/end
 * - Actions (attack, skill, move)
 * - Deaths
 * - Level ups
 * - Significant HP changes
 * 
 * NOT recorded (to save space):
 * - Tick position if no action happened
 * - Idle ticks
 */

import { Unit, UnitState, Position } from './TickCost.js';

// ========== REPLAY UNIT DEFINITION ==========

export interface ReplayUnit {
  id: string;
  name: string;
  level: number;
  maxHp: number;
  attack: number;
  defense: number;
  speed: number;
  magic: number;
  attackRange: number;
  moveRange: number;
  team: string;  // Dynamic team ID (e.g., "team0", "team1", "player_1")
}

// ========== REPLAY EVENT TYPES ==========

export enum ReplayEventType {
  // Combat events
  COMBAT_START = 'combat_start',
  COMBAT_END = 'combat_end',
  
  // Action events (what actor did)
  ATTACK = 'attack',
  SKILL = 'skill',
  MOVE = 'move',
  WAIT = 'wait',
  ITEM_USE = 'item_use',
  
  // Projectile events (optional - for visual effects)
  PROJECTILE_START = 'projectile_start',
  PROJECTILE_HIT = 'projectile_hit',
  
  // Result events (what happened to target)
  DAMAGE_DEALT = 'damage_dealt',
  DAMAGE_TAKEN = 'damage_taken',
  HEAL_RECEIVED = 'heal_received',
  
  // Status effect events
  BUFF_APPLIED = 'buff_applied',
  DEBUFF_APPLIED = 'debuff_applied',
  BUFF_EXPIRED = 'buff_expired',
  
  // State events
  UNIT_DEATH = 'unit_death',
  SPAWN_UNIT = 'spawn_unit',
  KNOCKBACK = 'knockback',
  
  // Progression events
  LEVEL_UP = 'level_up',
}

// ========== REPLAY EVENT ==========

// ========== HIT RESULT ENUM ==========
// 0 = normal hit, 1 = crit, 2 = miss, 3 = dodge
export enum HitResult {
  NORMAL = 0,
  CRIT = 1,
  MISS = 2,
  DODGE = 3,
}

export interface ReplayEvent {
  tick: number;
  eventType: ReplayEventType;
  
  // Who/what is involved (ID only - name lookup in units array)
  unitId?: string;
  
  // Target(s) - can be array for AOE
  targetId?: string;
  targetIds?: string[];    // For AOE effects
  
  // Action data (what actor did)
  actionType?: string;
  skillId?: string;
  itemId?: string;
  
  // Damage/Heal data (result to target)
  damage?: number;
  heal?: number;
  effect?: string;
  
  // Delta HP - Change in HP (negative = damage, positive = heal)
  // Godot can use this for floating number display
  deltaHp?: number;
  
  // Hit result: 0=normal, 1=crit, 2=miss, 3=dodge
  result?: HitResult;
  
  // Position data
  position?: { x: number; y: number };
  oldPosition?: { x: number; y: number };
  targetPosition?: { x: number; y: number };  // For AOE center
  
  // Knockback data (forced displacement)
  knockbackDistance?: number;      // Tiles pushed
  knockbackDirection?: { x: number; y: number };  // Push direction vector
  
  // Projectile data (optional - for arrows, bullets, etc.)
  projectileType?: string;      // "arrow", "fireball", "magic_bolt"
  projectileSpeed?: number;      // Duration in ticks to reach target
  projectileStartPos?: { x: number; y: number };  // Where projectile starts
  projectileEndPos?: { x: number; y: number };      // Where projectile lands
  
  // HP tracking
  hp?: number;
  hpBefore?: number;
  hpAfter?: number;
  maxHp?: number;
  
  // Level tracking
  level?: number;
  oldLevel?: number;
  
  // Status effect data
  statusEffectId?: string;
  statusEffectName?: string;
  statusDuration?: number;
  statusStacks?: number;
  
  // Spawn data (for minions/summons)
  spawnerId?: string;
  spawnerName?: string;
  unitTemplateId?: string;
  
  // Combat result
  winner?: 'player' | 'enemy' | 'draw';
  
  // Metadata (camelCase)
  isCrit?: boolean;
  isMiss?: boolean;
  isDodge?: boolean;
  isKill?: boolean;
  isAOE?: boolean;        // Is this an AOE effect?
  isMultiHit?: boolean;   // Is this multiple hits?
  hitCount?: number;       // Number of targets hit
  
  // Metadata (snake_case) - For Godot compatibility
  is_crit?: boolean;
  is_miss?: boolean;
  is_dodge?: boolean;
  is_kill?: boolean;
  is_aoe?: boolean;
  is_multi_hit?: boolean;
  hit_count?: number;
}

// ========== COMPACT REPLAY FORMAT ==========

export interface CombatReplay {
  version: string;
  winner: 'player' | 'enemy' | 'draw';
  totalTicks: number;
  seed: string;
  
  // Unit definitions (static)
  units: ReplayUnit[];
  
  // Initial positions
  initialPositions: Record<string, { x: number; y: number }>;
  
  // Events (only important ones)
  events: ReplayEvent[];
  
  // Final states (compact)
  finalState: {
    playerTeam: ReplayUnitState[];
    enemyTeam: ReplayUnitState[];
  };
  
  // Rewards
  rewards?: {
    experience: number;
    gold: number;
    drops: string[];
    levelUps: {
      unitId: string;
      oldLevel: number;
      newLevel: number;
    }[];
  };
}

export interface ReplayUnitState {
  id: string;
  hp: number;
  alive: boolean;
  level: number;
}

// ========== REPLAY BUILDER ==========

export class ReplayBuilder {
  private units: ReplayUnit[] = [];
  private initialPositions: Record<string, { x: number; y: number }> = {};
  private events: ReplayEvent[] = [];
  private seed: string = '';
  
  // Track previous HP for death events
  private prevHp: Map<string, number> = new Map();
  
  /**
   * Set the seed used for deterministic combat
   */
  setSeed(seed: string): void {
    this.seed = seed;
  }
  
  /**
   * Add initial units (legacy method for 2 teams)
   */
  addUnits(playerTeam: Unit[], enemyTeam: Unit[]): void {
    // Add player units
    for (const unit of playerTeam) {
      this.units.push(this.createReplayUnit(unit, 'player'));
    }
    
    // Add enemy units
    for (const unit of enemyTeam) {
      this.units.push(this.createReplayUnit(unit, 'enemy'));
    }
  }
  
  /**
   * Add team units - supports N teams
   * @param teamUnits - Array of units in this team
   * @param teamId - Unique team identifier (e.g., "team0", "team1", "player_1")
   */
  addTeam(teamUnits: Unit[], teamId: string): void {
    for (const unit of teamUnits) {
      this.units.push(this.createReplayUnit(unit, teamId));
    }
  }
  
  /**
   * Set initial positions
   */
  setInitialPositions(units: UnitState[]): void {
    for (const unit of units) {
      if (unit.position) {
        this.initialPositions[unit.id] = {
          x: unit.position.x,
          y: unit.position.y
        };
        // Track initial HP
        this.prevHp.set(unit.id, unit.currentHp);
      }
    }
  }
  
  /**
   * Record combat start event
   */
  recordCombatStart(): void {
    this.events.push({
      tick: 0,
      eventType: ReplayEventType.COMBAT_START
    });
  }
  
  /**
   * Record an important event (action, death, level up)
   */
  recordEvent(event: ReplayEvent): void {
    this.events.push(event);
    
    // Track HP for death detection
    if (event.unitId && event.hp !== undefined) {
      this.prevHp.set(event.unitId, event.hp);
    }
  }
  
  /**
   * Record position change (only when unit actually moves)
   */
  recordPositionChange(
    tick: number,
    unitId: string,
    oldPos: { x: number; y: number },
    newPos: { x: number; y: number }
  ): void {
    this.events.push({
      tick,
      eventType: ReplayEventType.MOVE,
      unitId,
      oldPosition: oldPos,
      position: newPos
    });
  }
  
  /**
   * Record death event
   * Optimized: no name
   */
  recordDeath(tick: number, unitId: string, killerId?: string): void {
    this.events.push({
      tick,
      eventType: ReplayEventType.UNIT_DEATH,
      unitId,
      isKill: true
    });
  }
  
  /**
   * Record attack action
   * Optimized: no names, single result field
   */
  recordAttack(
    tick: number,
    actorId: string,
    targetId: string,
    damage?: number,
    isCrit: boolean = false,
    isMiss: boolean = false,
    isDodge: boolean = false
  ): void {
    // Calculate result enum
    let result = HitResult.NORMAL;
    if (isMiss) result = HitResult.MISS;
    else if (isDodge) result = HitResult.DODGE;
    else if (isCrit) result = HitResult.CRIT;
    
    this.events.push({
      tick,
      eventType: ReplayEventType.ATTACK,
      unitId: actorId,
      targetId,
      damage,
      deltaHp: damage ? -damage : 0, // Negative for damage
      result
    });
  }
  
  /**
   * Record skill usage
   * Optimized: no names
   */
  recordSkill(
    tick: number,
    actorId: string,
    skillId: string,
    targetId: string,
    damage?: number,
    heal?: number
  ): void {
    // Calculate deltaHp: negative for damage, positive for heal
    const deltaHp = heal ? heal : (damage ? -damage : 0);
    
    this.events.push({
      tick,
      eventType: ReplayEventType.SKILL,
      unitId: actorId,
      targetId,
      skillId,
      damage,
      heal,
      deltaHp
    });
  }
  
  /**
   * Record move action
   */
  recordMove(
    tick: number,
    unitId: string,
    fromPos: { x: number; y: number },
    toPos: { x: number; y: number }
  ): void {
    this.events.push({
      tick,
      eventType: ReplayEventType.MOVE,
      unitId,
      oldPosition: fromPos,
      position: toPos
    });
  }

  /**
   * Record projectile/arrow flying from source to target
   * Use this for ranged attacks, magic projectiles, arrows, etc.
   */
  recordProjectileStart(
    tick: number,
    actorId: string,
    targetId: string,
    projectileType: string,  // "arrow", "fireball", "magic_bolt", etc.
    startPos: { x: number; y: number },
    endPos: { x: number; y: number },
    projectileSpeed: number = 10  // Ticks until impact
  ): void {
    // Projectile start event
    this.events.push({
      tick,
      eventType: ReplayEventType.PROJECTILE_START,
      unitId: actorId,
      targetId,
      projectileType,
      projectileSpeed,
      projectileStartPos: startPos,
      projectileEndPos: endPos,
      position: startPos,
      targetPosition: endPos
    });

    // Schedule projectile hit event
    const hitTick = tick + projectileSpeed;
    this.events.push({
      tick: hitTick,
      eventType: ReplayEventType.PROJECTILE_HIT,
      unitId: actorId,
      targetId,
      projectileType,
      position: endPos,
      targetPosition: endPos
    });
  }
  
  /**
   * Record projectile hit (automatic when using recordProjectileStart)
   * But can be called manually if needed
   * Optimized: no names
   */
  recordProjectileHit(
    tick: number,
    actorId: string,
    targetId: string,
    projectileType: string,
    hitPos: { x: number; y: number }
  ): void {
    this.events.push({
      tick,
      eventType: ReplayEventType.PROJECTILE_HIT,
      unitId: actorId,
      targetId,
      projectileType,
      position: hitPos,
      targetPosition: hitPos
    });
  }

  /**
   * Record knockback - forced position displacement
   * When an attack or skill pushes the target backward
   * Optimized: no names
   */
  recordKnockback(
    tick: number,
    unitId: string,
    sourceId: string,
    fromPos: { x: number; y: number },
    toPos: { x: number; y: number },
    distance: number,
    damage?: number
  ): void {
    // Calculate direction vector
    const direction = {
      x: toPos.x - fromPos.x,
      y: toPos.y - fromPos.y
    };

    this.events.push({
      tick,
      eventType: ReplayEventType.KNOCKBACK,
      unitId,
      targetId: sourceId,
      oldPosition: fromPos,
      position: toPos,
      knockbackDistance: distance,
      knockbackDirection: direction,
      damage,
      deltaHp: damage ? -damage : undefined
    });
  }
  
  /**
   * Record damage dealt (attacker perspective)
   * Optimized: no names, single result field
   */
  recordDamageDealt(
    tick: number,
    actorId: string,
    targetId: string,
    damage: number,
    isCrit: boolean = false,
    isMiss: boolean = false,
    isDodge: boolean = false
  ): void {
    // Calculate result enum
    let result = HitResult.NORMAL;
    if (isMiss) result = HitResult.MISS;
    else if (isDodge) result = HitResult.DODGE;
    else if (isCrit) result = HitResult.CRIT;
    
    this.events.push({
      tick,
      eventType: ReplayEventType.DAMAGE_DEALT,
      unitId: actorId,
      targetId,
      damage,
      deltaHp: -damage, // Negative for damage
      result
    });
  }
  
  /**
   * Record damage taken (target perspective)
   * Optimized: no names, single result field
   */
  recordDamageTaken(
    tick: number,
    targetId: string,
    sourceId: string,
    damage: number,
    hpBefore: number,
    hpAfter: number,
    isCrit: boolean = false,
    isMiss: boolean = false,
    isDodge: boolean = false
  ): void {
    // Calculate result enum
    let result = HitResult.NORMAL;
    if (isMiss) result = HitResult.MISS;
    else if (isDodge) result = HitResult.DODGE;
    else if (isCrit) result = HitResult.CRIT;
    
    this.events.push({
      tick,
      eventType: ReplayEventType.DAMAGE_TAKEN,
      unitId: targetId,
      targetId: sourceId,
      damage,
      deltaHp: -damage, // Negative for damage
      hpBefore,
      hpAfter,
      result
    });
  }
  
  /**
   * Record heal received
   * Optimized: no names
   */
  recordHealReceived(
    tick: number,
    targetId: string,
    healerId: string,
    healAmount: number,
    hpBefore: number,
    hpAfter: number
  ): void {
    this.events.push({
      tick,
      eventType: ReplayEventType.HEAL_RECEIVED,
      unitId: targetId,
      targetId: healerId,
      heal: healAmount,
      deltaHp: healAmount, // Positive for heal
      hpBefore,
      hpAfter
    });
  }
  
  /**
   * Record buff/debuff applied
   * Optimized: no names
   */
  recordStatusApplied(
    tick: number,
    targetId: string,
    sourceId: string,
    effectId: string,
    isDebuff: boolean = false,
    duration: number = 0,
    stacks: number = 1
  ): void {
    this.events.push({
      tick,
      eventType: isDebuff ? ReplayEventType.DEBUFF_APPLIED : ReplayEventType.BUFF_APPLIED,
      unitId: targetId,
      targetId: sourceId,
      effect: effectId,
      statusDuration: duration,
      statusStacks: stacks
    });
  }
  
  /**
   * Record buff/debuff expired
   * Optimized: no names
   */
  recordStatusExpired(
    tick: number,
    unitId: string,
    effectId: string
  ): void {
    this.events.push({
      tick,
      eventType: ReplayEventType.BUFF_EXPIRED,
      unitId,
      effect: effectId
    });
  }
  
  /**
   * Record item use (potions, consumables)
   * Optimized: no names
   */
  recordItemUse(
    tick: number,
    userId: string,
    itemId: string,
    healAmount?: number,
    effect?: string
  ): void {
    this.events.push({
      tick,
      eventType: ReplayEventType.ITEM_USE,
      unitId: userId,
      itemId,
      heal: healAmount,
      deltaHp: healAmount || 0, // Positive for heal
      effect
    });
  }
  
  /**
   * Record spawn unit (minions, summons)
   * Optimized: no names
   */
  recordSpawnUnit(
    tick: number,
    spawnedUnitId: string,
    spawnerId: string,
    unitTemplateId: string,
    position: { x: number; y: number }
  ): void {
    this.events.push({
      tick,
      eventType: ReplayEventType.SPAWN_UNIT,
      unitId: spawnedUnitId,
      targetId: spawnerId,
      effect: unitTemplateId,
      position
    });
  }
  
  /**
   * Record level up
   * Optimized: no name
   */
  recordLevelUp(
    tick: number,
    unitId: string,
    oldLevel: number,
    newLevel: number
  ): void {
    this.events.push({
      tick,
      eventType: ReplayEventType.LEVEL_UP,
      unitId,
      oldLevel,
      level: newLevel
    });
  }
  
  /**
   * Build final replay object
   */
  build(
    winner: 'player' | 'enemy' | 'draw',
    totalTicks: number,
    finalPlayerState: UnitState[],
    finalEnemyState: UnitState[],
    rewards?: {
      experience: number;
      gold: number;
      drops: string[];
      levelUps: { unitId: string; oldLevel: number; newLevel: number }[];
    }
  ): CombatReplay {
    // Add combat end event
    this.events.push({
      tick: totalTicks,
      eventType: ReplayEventType.COMBAT_END,
      winner
    });
    
    return {
      version: '1.0',
      winner,
      totalTicks,
      seed: this.seed,
      units: this.units,
      initialPositions: this.initialPositions,
      events: this.events,
      finalState: {
        playerTeam: finalPlayerState.map(u => ({
          id: u.id,
          hp: u.currentHp,
          alive: u.isAlive,
          level: u.level
        })),
        enemyTeam: finalEnemyState.map(u => ({
          id: u.id,
          hp: u.currentHp,
          alive: u.isAlive,
          level: u.level
        }))
      },
      rewards: rewards ? {
        experience: rewards.experience,
        gold: rewards.gold,
        drops: rewards.drops,
        levelUps: rewards.levelUps
      } : undefined
    };
  }
  
  /**
   * Convert to compact JSON for network
   */
  toJSON(): string {
    return JSON.stringify({
      version: '1.0',
      winner: this.events.find(e => e.eventType === ReplayEventType.COMBAT_END)?.winner || 'draw',
      totalTicks: this.events.reduce((max, e) => Math.max(max, e.tick), 0),
      seed: this.seed,
      units: this.units,
      initialPositions: this.initialPositions,
      events: this.events,
    });
  }
  
  /**
   * Reset builder for new replay
   */
  reset(): void {
    this.units = [];
    this.initialPositions = {};
    this.events = [];
    this.seed = '';
    this.prevHp.clear();
  }
  
  private createReplayUnit(unit: Unit, team: string): ReplayUnit {
    return {
      id: unit.id,
      name: unit.name,
      level: unit.level,
      maxHp: unit.maxHp,
      attack: unit.attack,
      defense: unit.defense,
      speed: unit.speed,
      magic: unit.magic,
      attackRange: unit.attackRange ?? 1,
      moveRange: unit.moveRange ?? 3,
      team
    };
  }
}

// ========== HELPER FUNCTIONS FOR EVENT-BASED REPLAY ==========

/**
 * Get all events at a specific tick
 */
export function getEventsAtTick(replay: CombatReplay, tick: number): ReplayEvent[] {
  return replay.events.filter(e => e.tick === tick);
}

/**
 * Get events by type
 */
export function getEventsByType(replay: CombatReplay, eventType: ReplayEventType): ReplayEvent[] {
  return replay.events.filter(e => e.eventType === eventType);
}

/**
 * Get unit position at a specific tick
 * Uses initial position + any position changes before this tick
 */
export function getUnitPosition(replay: CombatReplay, unitId: string, tick: number): { x: number; y: number } | null {
  // Start with initial position
  let position = replay.initialPositions[unitId] || null;
  
  // Find latest position change before this tick
  for (const event of replay.events) {
    if (event.tick > tick) break;
    if (event.unitId === unitId) {
      if (event.eventType === ReplayEventType.MOVE && event.position) {
        position = event.position;
      }
    }
  }
  
  return position;
}

/**
 * Get unit HP at a specific tick
 * Tracks HP from damage/heal events
 */
export function getUnitHP(replay: CombatReplay, unitId: string, tick: number): number | null {
  const unit = replay.units.find(u => u.id === unitId);
  if (!unit) return null;
  
  let hp = unit.maxHp;
  
  // Apply damage/heal events before this tick
  for (const event of replay.events) {
    if (event.tick > tick) break;
    
    if (event.targetId === unitId) {
      if (event.damage) {
        hp = Math.max(0, hp - event.damage);
      }
      if (event.heal) {
        hp = Math.min(unit.maxHp, hp + event.heal);
      }
    }
    
    // Unit died
    if (event.unitId === unitId && event.eventType === ReplayEventType.UNIT_DEATH) {
      return 0;
    }
  }
  
  return hp;
}

/**
 * Get all attack events
 */
export function getAttackEvents(replay: CombatReplay): ReplayEvent[] {
  return getEventsByType(replay, ReplayEventType.ATTACK);
}

/**
 * Get all death events
 */
export function getDeathEvents(replay: CombatReplay): ReplayEvent[] {
  return getEventsByType(replay, ReplayEventType.UNIT_DEATH);
}

/**
 * Get all level up events
 */
export function getLevelUpEvents(replay: CombatReplay): ReplayEvent[] {
  return getEventsByType(replay, ReplayEventType.LEVEL_UP);
}

/**
 * Get total event count
 */
export function getTotalEvents(replay: CombatReplay): number {
  return replay.events.length;
}

/**
 * Estimate replay file size in bytes
 */
export function estimateReplaySize(replay: CombatReplay): number {
  return JSON.stringify(replay).length;
}

// ========== FILE OPERATIONS ==========

import * as fs from 'fs';
import * as path from 'path';

/**
 * Save replay to JSON file
 */
export function saveReplayToFile(replay: CombatReplay, filename: string, outputDir: string = './replays'): string {
  // Create directory if not exists
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }
  
  const filepath = path.join(outputDir, filename);
  const json = JSON.stringify(replay, null, 2);
  
  fs.writeFileSync(filepath, json, 'utf-8');
  
  return filepath;
}

/**
 * Load replay from JSON file
 */
export function loadReplayFromFile(filepath: string): CombatReplay {
  const json = fs.readFileSync(filepath, 'utf-8');
  return JSON.parse(json) as CombatReplay;
}

/**
 * Save replay with auto-generated filename
 */
export function saveReplay(replay: CombatReplay, prefix: string = 'combat'): string {
  const timestamp = Date.now();
  const filename = `${prefix}_${timestamp}.json`;
  return saveReplayToFile(replay, filename);
}

/**
 * Get list of saved replays
 */
export function getSavedReplays(outputDir: string = './replays'): string[] {
  if (!fs.existsSync(outputDir)) {
    return [];
  }
  
  return fs.readdirSync(outputDir)
    .filter(f => f.endsWith('.json'))
    .map(f => path.join(outputDir, f));
}

/**
 * Delete a replay file
 */
export function deleteReplay(filepath: string): boolean {
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
    return true;
  }
  return false;
}
