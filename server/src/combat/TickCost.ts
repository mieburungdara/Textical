/**
 * Tick-Based Combat System
 * 
 * Setiap action memiliki TICK COST - jumlah tick yang dibutuhkan untuk menyelesaikan action
 * 
 * ========== TICK COST AGREEMENT ==========
 * 
 * BASE ACTIONS:
 * - Attack (basic):     10 ticks
 * - Heavy Attack:       15 ticks
 * - Quick Attack:        5 ticks
 * - Skill (basic):      20 ticks
 * - Skill (ultimate):   40 ticks
 * - Move/Position:      15 ticks
 * - Defend:             8 ticks
 * - Use Item:           12 ticks
 * - Wait/Ready:          5 ticks
 * 
 * MAGIC ACTIONS:
 * - Fireball:           25 ticks
 * - Heal:               20 ticks
 * - Buff:               15 ticks
 * - Debuff:             15 ticks
 * - Teleport:           30 ticks
 * 
 * BUFFS/DEBUFFS:
 * - Duration:           tick duration (not time-based)
 * - Tick Applied:        when buff was applied
 * - Expires:            tickApplied + duration
 * 
 * ========== DEX (Dexterity) MODIFIER ==========
 * - DEX affects tick needed: tickNeeded = 100 - DEX
 * - Higher DEX = faster actions (lower tick needed)
 * 
 * ========== TURN ORDER ==========
 * - Units act when: tick % (100 - dex) == 0
 * - Higher DEX = lebih sering bertindak
 */

import { StatusEffectInstance } from '../templates/status_effects/StatusEffect.js';

export interface Unit {
  id: string;
  name: string;
  level: number;
  
  // Primary Stats
  vit: number;        // Vitality - determines Max HP
  hp: number;         // Current HP
  maxHp: number;      // Max HP = vit * 10
  mana: number;       // Current Mana
  maxMana: number;    // Max Mana = magic * 10
  
  attack: number;     // Based on ATK
  defense: number;   // Based on DEF
  speed: number;      // Based on DEX
  magic: number;      // Based on MAG
  
  // Secondary Stats - Combat
  critRate: number;   // 0-50 (percentage)
  critDamage: number; // 1.5 = 150%
  evasion: number;    // Based on DEX (0-40%)
  accuracy: number;   // Based on DEX (50-100%)
  block: number;      // Based on DEF (0-30%)
  
  // Secondary Stats - Defense
  resistance: number;          // Magic/elemental damage reduction (0-50%)
  damageReduction: number;      // All damage reduction (0-75%)
  statusResistance: number;     // Resistance to debuffs/CC (0-50%)
  tenacity: number;             // Reduces CC duration (0-50%)
  
  // Secondary Stats - Offense
  attackSpeed: number;          // Attack speed multiplier (0.5-3.0)
  lifeSteal: number;            // Damage converted to heal (0-50%)
  
  // Status Effects
  statusEffects?: StatusEffectInstance[];
}

export interface StatusEffect {
  id: string;
  type: string;
  name: string;
  value?: number;
  duration: number;
  tickApplied: number;
}

// UnitState now uses StatusEffectInstance from the status effects system
export interface UnitState extends Unit {
  currentHp: number;
  isAlive: boolean;
}

export interface CombatAction {
  tick: number;
  actorId: string;
  actorName: string;
  targetId: string;
  targetName: string;
  actionType: string;
  damage?: number;
  heal?: number;
  effect?: string;
  isCrit: boolean;
  isMiss: boolean;
  isDodge: boolean;
}

export interface CombatResult {
  winner: 'player' | 'enemy' | 'draw';
  totalTicks: number;
  logs: CombatAction[];
  finalState: {
    playerTeam: UnitState[];
    enemyTeam: UnitState[];
  };
  rewards?: CombatRewards;
}

export interface CombatRewards {
  experience: number;
  gold: number;
  drops: string[];
}

// ========== ACTION TYPES ==========

export enum ActionType {
  // Basic
  ATTACK = 'attack',
  HEAVY_ATTACK = 'heavy_attack',
  QUICK_ATTACK = 'quick_attack',
  DEFEND = 'defend',
  MOVE = 'move',
  WAIT = 'wait',
  USE_ITEM = 'use_item',
  
  // Magic
  FIREBALL = 'fireball',
  HEAL = 'heal',
  BUFF = 'buff',
  DEBUFF = 'debuff',
  TELEPORT = 'teleport',
  
  // Skill
  SKILL_BASIC = 'skill_basic',
  SKILL_ULTIMATE = 'skill_ultimate',
}

export interface ActionDefinition {
  type: ActionType;
  name: string;
  baseTickCost: number;
  damageMultiplier?: number;
  healAmount?: number;
  manaCost?: number;
  description: string;
}

// ========== ACTION DEFINITIONS ==========

export const ACTION_DEFINITIONS: Record<ActionType, ActionDefinition> = {
  // Basic Actions
  [ActionType.ATTACK]: {
    type: ActionType.ATTACK,
    name: 'Attack',
    baseTickCost: 10,
    damageMultiplier: 1.0,
    description: 'Basic melee attack'
  },
  
  [ActionType.HEAVY_ATTACK]: {
    type: ActionType.HEAVY_ATTACK,
    name: 'Heavy Attack',
    baseTickCost: 15,
    damageMultiplier: 1.5,
    description: 'Stronger attack with longer cooldown'
  },
  
  [ActionType.QUICK_ATTACK]: {
    type: ActionType.QUICK_ATTACK,
    name: 'Quick Attack',
    baseTickCost: 5,
    damageMultiplier: 0.7,
    description: 'Fast but weaker attack'
  },
  
  [ActionType.DEFEND]: {
    type: ActionType.DEFEND,
    name: 'Defend',
    baseTickCost: 8,
    description: 'Reduces incoming damage for next turn'
  },
  
  [ActionType.MOVE]: {
    type: ActionType.MOVE,
    name: 'Move',
    baseTickCost: 15,
    description: 'Change position in battle'
  },
  
  [ActionType.WAIT]: {
    type: ActionType.WAIT,
    name: 'Wait',
    baseTickCost: 5,
    description: 'Skip turn to ready next action'
  },
  
  [ActionType.USE_ITEM]: {
    type: ActionType.USE_ITEM,
    name: 'Use Item',
    baseTickCost: 12,
    description: 'Use consumable item'
  },
  
  // Magic Actions
  [ActionType.FIREBALL]: {
    type: ActionType.FIREBALL,
    name: 'Fireball',
    baseTickCost: 25,
    damageMultiplier: 1.8,
    manaCost: 20,
    description: 'Fire magic attack'
  },
  
  [ActionType.HEAL]: {
    type: ActionType.HEAL,
    name: 'Heal',
    baseTickCost: 20,
    healAmount: 30,
    manaCost: 15,
    description: 'Restore HP'
  },
  
  [ActionType.BUFF]: {
    type: ActionType.BUFF,
    name: 'Buff',
    baseTickCost: 15,
    manaCost: 10,
    description: 'Apply buff to ally'
  },
  
  [ActionType.DEBUFF]: {
    type: ActionType.DEBUFF,
    name: 'Debuff',
    baseTickCost: 15,
    manaCost: 12,
    description: 'Apply debuff to enemy'
  },
  
  [ActionType.TELEPORT]: {
    type: ActionType.TELEPORT,
    name: 'Teleport',
    baseTickCost: 30,
    manaCost: 25,
    description: 'Teleport to new position'
  },
  
  // Skill Actions
  [ActionType.SKILL_BASIC]: {
    type: ActionType.SKILL_BASIC,
    name: 'Skill',
    baseTickCost: 20,
    description: 'Basic skill usage'
  },
  
  [ActionType.SKILL_ULTIMATE]: {
    type: ActionType.SKILL_ULTIMATE,
    name: 'Ultimate',
    baseTickCost: 40,
    description: 'Ultimate skill - powerful but slow'
  },
};

// ========== TICK COST TABLE ==========

export const TICK_COST_TABLE = {
  // Name: { baseTickCost, damageMult, manaCost, description }
  
  // --- BASIC MELEE ---
  'basic_attack':    { ticks: 10, damage: 1.0,  mana: 0,  desc: 'Normal attack' },
  'quick_attack':    { ticks: 5,  damage: 0.7,  mana: 0,  desc: 'Fast, weak attack' },
  'heavy_attack':    { ticks: 15, damage: 1.5,  mana: 0,  desc: 'Slow, strong attack' },
  'double_strike':   { ticks: 12, damage: 0.9,  mana: 0,  desc: 'Two quick attacks' },
  
  // --- DEFENSE ---
  'defend':          { ticks: 8,  damage: 0.0,  mana: 0,  desc: 'Reduce incoming damage' },
  'block':           { ticks: 10, damage: 0.0,  mana: 0,  desc: 'Block next attack' },
  'counter':         { ticks: 12, damage: 0.8,  mana: 0,  desc: 'Counterattack after being hit' },
  
  // --- MOVEMENT ---
  'move':            { ticks: 15, damage: 0.0,  mana: 0,  desc: 'Change position' },
  'dash':            { ticks: 8,  damage: 0.3,  mana: 0,  desc: 'Move and attack' },
  'retreat':         { ticks: 10, damage: 0.0,  mana: 0,  desc: 'Move backward safely' },
  
  // --- ITEMS ---
  'use_potion':      { ticks: 12, damage: 0.0,  mana: 0,  desc: 'Use health potion' },
  'use_scroll':      { ticks: 15, damage: 0.0,  mana: 0,  desc: 'Use scroll item' },
  
  // --- WAIT ---
  'wait':            { ticks: 5,  damage: 0.0,  mana: 0,  desc: 'Skip turn' },
  'ready':           { ticks: 3,  damage: 0.0,  mana: 0,  desc: 'Prepare next action' },
  
  // --- MAGIC - FIRE ---
  'fireball':        { ticks: 25, damage: 1.8,  mana: 20, desc: 'Fire magic ball' },
  'flame_strike':    { ticks: 30, damage: 2.2,  mana: 30, desc: 'Powerful fire attack' },
  'ignite':          { ticks: 15, damage: 1.0,  mana: 12, desc: 'Fire DoT' },
  
  // --- MAGIC - ICE ---
  'ice_shard':       { ticks: 20, damage: 1.4,  mana: 15, desc: 'Ice projectile' },
  'freeze':          { ticks: 25, damage: 1.6,  mana: 22, desc: 'Freeze enemy' },
  'blizzard':        { ticks: 35, damage: 2.5,  mana: 40, desc: 'Area ice attack' },
  
  // --- MAGIC - HEALING ---
  'heal':            { ticks: 20, damage: 0.0,  mana: 15, desc: 'Restore HP' },
  'greater_heal':    { ticks: 28, damage: 0.0,  mana: 25, desc: 'Restore more HP' },
  'group_heal':     { ticks: 35, damage: 0.0,  mana: 35, desc: 'Heal all allies' },
  'regeneration':    { ticks: 15, damage: 0.0,  mana: 10, desc: 'HoT (Heal over Time)' },
  
  // --- MAGIC - BUFF ---
  'power_up':        { ticks: 15, damage: 0.0,  mana: 10, desc: 'Increase attack' },
  'shield':          { ticks: 18, damage: 0.0,  mana: 12, desc: 'Add shield' },
  'haste':           { ticks: 15, damage: 0.0,  mana: 10, desc: 'Increase speed' },
  'invisibility':    { ticks: 20, damage: 0.0,  mana: 18, desc: 'Become invisible' },
  
  // --- MAGIC - DEBUFF ---
  'poison':          { ticks: 15, damage: 0.8,  mana: 8,  desc: 'DoT poison' },
  'slow':            { ticks: 12, damage: 0.5,  mana: 10, desc: 'Reduce enemy speed' },
  'silence':         { ticks: 15, damage: 0.0,  mana: 12, desc: 'Prevent magic' },
  'weakness':        { ticks: 18, damage: 0.0,  mana: 15, desc: 'Reduce attack' },
  
  // --- MAGIC - TELEPORT ---
  'teleport':        { ticks: 30, damage: 0.0,  mana: 25, desc: 'Teleport anywhere' },
  'blink':           { ticks: 15, damage: 0.5,  mana: 15, desc: 'Short range teleport' },
  
  // --- SKILLS - BASIC ---
  'slash':           { ticks: 12, damage: 1.2,  mana: 5,  desc: 'Sword slash' },
  'thrust':          { ticks: 10, damage: 1.1,  mana: 3,  desc: 'Precise thrust' },
  'spin':            { ticks: 18, damage: 1.4,  mana: 8,  desc: 'Area attack' },
  'shield_bash':     { ticks: 14, damage: 1.0,  mana: 5,  desc: 'Shield + attack' },
  
  // --- SKILLS - ULTIMATE ---
  'ultimateStrike':  { ticks: 40, damage: 3.0,  mana: 50, desc: 'Powerful finishing move' },
  'armageddon':      { ticks: 50, damage: 3.5,  mana: 80, desc: 'Massive area damage' },
  'divine_shield':   { ticks: 45, damage: 0.0,  mana: 60, desc: 'Full immunity' },
  'meteor':          { ticks: 45, damage: 2.8,  mana: 70, desc: 'Meteor strike' },
};

// ========== SPEED MODIFIER ==========

export const BASE_SPEED = 100;  // Reference speed for tick cost calculation

/**
 * Calculate actual tick cost based on unit speed
 * Formula: actualTickCost = baseTickCost * (BASE_SPEED / unitSpeed)
 * 
 * Faster units (lower speed number) get reduced tick cost
 * Example:
 * - Unit with speed 10: 10 * (100/10) = 100 ticks (slower)
 * - Unit with speed 20: 10 * (100/20) = 50 ticks (faster)
 * - Unit with speed 50: 10 * (100/50) = 20 ticks (fastest)
 */
export function calculateTickCost(baseTickCost: number, unitSpeed: number): number {
  return Math.floor(baseTickCost * (BASE_SPEED / unitSpeed));
}

// ========== QUICK REFERENCE ==========

export const QUICK_REFERENCE = `
╔══════════════════════════════════════════════════════════════╗
║            TICK COST QUICK REFERENCE                        ║
╠══════════════════════════════════════════════════════════════╣
║  BASIC ACTIONS (Physical)                                    ║
║  ├─ Attack:        10 ticks                               ║
║  ├─ Quick Attack:   5 ticks  (weak, fast)                 ║
║  ├─ Heavy Attack:  15 ticks  (strong, slow)               ║
║  ├─ Defend:          8 ticks                               ║
║  ├─ Move:          15 ticks                               ║
║  ├─ Use Item:      12 ticks                               ║
║  └─ Wait:           5 ticks                               ║
╠══════════════════════════════════════════════════════════════╣
║  MAGIC ACTIONS                                              ║
║  ├─ Fireball:      25 ticks (20 mana)                     ║
║  ├─ Heal:          20 ticks (15 mana)                     ║
║  ├─ Buff:          15 ticks (10 mana)                     ║
║  ├─ Debuff:        15 ticks (12 mana)                     ║
║  └─ Teleport:      30 ticks (25 mana)                     ║
╠══════════════════════════════════════════════════════════════╣
║  SKILLS                                                     ║
║  ├─ Basic Skill:   20 ticks                               ║
║  └─ Ultimate:      40 ticks (powerful)                    ║
╠══════════════════════════════════════════════════════════════╣
║  SPEED MODIFIER: tickCost = baseTick * (100 / unitSpeed)  ║
║  Lower speed number = Faster (more actions per tick)      ║
╚══════════════════════════════════════════════════════════════╝
`;
