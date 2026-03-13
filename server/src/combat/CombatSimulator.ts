 /**
  * Tick-Based Combat Engine v2.0
  * 
  * Core combat system for Textical RPG.
  * Handles turn-based combat with tick-based mechanics.
  *
  * Stats per GDD:
  * - STR → Physical Attack
  * - DEX → Speed, Attack Speed, Accuracy, Evasion
  * - INT → Spell Damage, Cast Speed
  * - DEF → Damage Mitigation
  * 
  * Tick System:
  * - All units need 100 tick BASE to act
  * - DEX reduces tick: tickNeeded = 100 - DEX
  * 
  * Features:
  * - Action Modifier Plugins: Dynamic modification of actions
  * - Event Hook System: Intercept and modify combat events
  * - Combat Phase System: Structured phases with hooks
  * - Conditional Skill Effects: Condition-based skill effects
  * - Multi-team Support: Up to N teams
  * - Multiple Win Conditions: Last Standing, Annihilation, King Hill, etc.
  */

import { 
  Unit, 
  CombatAction, 
  CombatResult, 
  UnitState, 
  CombatRewards,
  StatusEffect,
  TICK_COST_TABLE,
  TeamStats,
  BattleConfig,
  WinCondition
} from './TickCost.js';

import { 
  getAllStatusEffects, 
  getStatusEffect,
  StatusEffectTemplate 
} from '../templates/status_effects/index.js';

import logger from '../utils/logger.js';

// Import Flexible Combat System
import {
  FlexibleCombatSystem,
  ActionType,
  CombatEventType,
  CombatPhase,
  createCriticalStrikeModifier,
  createBerserkModifier,
  createFirstHitModifier,
  CombatContext
} from './FlexibleCombatSystem.js';

export const BASE_TICK_COST = 100;

// ========== STATUS TYPES ==========

export enum StatusType {
  // Negative (Debuff)
  POISON = 'poison',
  BURN = 'burn',
  FREEZE = 'freeze',
  STUN = 'stun',
  SLEEP = 'sleep',
  BLEED = 'bleed',
  BLIND = 'blind',
  SILENCE = 'silence',
  ROOT = 'root',
  SLOW = 'slow',
  CURSE = 'curse',
  WEAKNESS = 'weakness',
  VULNERABILITY = 'vulnerability',
  
  // Positive (Buff)
  SHIELD = 'shield',
  HASTE = 'haste',
  REGEN = 'regen',
  BARRIER = 'barrier',
  BUFF = 'buff',
  REFLECT = 'reflect',
  STEALTH = 'stealth',
  BERSERK = 'berserk',
  FOCUS = 'focus',
  INVULNERABILITY = 'invulnerability',
  MANA_REGEN = 'mana_regen',
  LIFESTEAL = 'lifesteal',
}

// ========== STATUS DEFINITIONS ==========

function buildStatusDefinitions(): Record<StatusType, {name: string, duration: number, value?: number, description: string}> {
  const result: Record<string, {name: string, duration: number, value?: number, description: string}> = {};
  
  const templates = getAllStatusEffects();
  
  for (const template of templates) {
    const statusTypeKey = template.id.toUpperCase() as string;
    if (Object.values(StatusType).map(s => s.toString()).includes(statusTypeKey)) {
      result[statusTypeKey] = {
        name: template.name,
        duration: template.duration,
        value: template.damage ?? template.heal ?? template.statValue,
        description: template.description,
      };
    }
  }
  
  const additionalStatuses: Record<string, {name: string, duration: number, value?: number, description: string}> = {
    SLOW: { name: 'Slow', duration: 5, value: -30, description: 'Speed reduced by 30%' },
    WEAKNESS: { name: 'Weakness', duration: 4, value: -40, description: 'Damage output reduced by 40%' },
    VULNERABILITY: { name: 'Vulnerability', duration: 5, value: 35, description: 'Damage taken increased by 35%' },
    BARRIER: { name: 'Barrier', duration: 5, value: 50, description: 'Elemental protection' },
    BUFF: { name: 'Buff', duration: 8, value: 20, description: 'Stat boost' },
    REFLECT: { name: 'Reflect', duration: 4, value: 25, description: 'Reflects 25% damage' },
    STEALTH: { name: 'Stealth', duration: 3, value: 80, description: '80% evasion' },
    BERSERK: { name: 'Berserk', duration: 5, value: 60, description: 'Attack +60%, Defense -40%' },
    FOCUS: { name: 'Focus', duration: 4, value: 30, description: 'Crit +30%, Accuracy +40%' },
    INVULNERABILITY: { name: 'Invulnerability', duration: 2, value: 0, description: 'Immune to all damage' },
    MANA_REGEN: { name: 'Mana Regen', duration: 6, value: 5, description: 'MP restored per tick' },
    LIFESTEAL: { name: 'Lifesteal', duration: 5, value: 20, description: 'Heals 20% of damage' },
  };
  
  for (const [key, value] of Object.entries(additionalStatuses)) {
    result[key] = value;
  }
  
  return result as Record<StatusType, {name: string, duration: number, value?: number, description: string}>;
}

export const STATUS_DEFINITIONS = buildStatusDefinitions();

// ========== COMBAT SIMULATOR ==========

export class CombatEngine {
  /**
   * Flexible combat system for plugins, hooks, and conditional effects
   * This provides:
   * - Action Modifier Plugins
   * - Event Hook System
   * - Combat Phase System
   * - Conditional Skill Effects
   */
  readonly flexible: FlexibleCombatSystem;
  
  constructor() {
    // Initialize flexible combat system
    this.flexible = new FlexibleCombatSystem();
    
    // Register default modifier plugins
    this.flexible.registerModifier(createCriticalStrikeModifier());
    this.flexible.registerModifier(createBerserkModifier());
    this.flexible.registerModifier(createFirstHitModifier());
    
    // Register default event hooks for combat integration
    this.registerDefaultEventHooks();
  }
  
  /**
   * Register default event hooks that integrate with combat logic
   */
  private registerDefaultEventHooks(): void {
    // Hook: Before damage is dealt - apply modifiers
    this.flexible.registerEventHook({
      id: 'pre_damage_modifiers',
      name: 'Pre-Damage Modifiers',
      events: [CombatEventType.PRE_DAMAGE],
      priority: 10,
      callback: (event) => {
        return {}; // Allow modifiers to modify via plugin system
      }
    });
    
    // Hook: After damage - track kills and apply lifesteal
    this.flexible.registerEventHook({
      id: 'post_damage_effects',
      name: 'Post-Damage Effects',
      events: [CombatEventType.POST_DAMAGE],
      priority: 0,
      callback: (event) => {
        return {};
      }
    });
    
    // Hook: On-crit - could add effects like +damage
    this.flexible.registerEventHook({
      id: 'crit_bonus',
      name: 'Critical Hit Bonus',
      events: [CombatEventType.ON_CRIT],
      priority: 5,
      callback: (event) => {
        return {};
      }
    });
    
    // Hook: On-kill - could trigger effects
    this.flexible.registerEventHook({
      id: 'on_kill_trigger',
      name: 'On Kill Trigger',
      events: [CombatEventType.ON_KILL],
      priority: 0,
      callback: (event) => {
        return {};
      }
    });
    
    // Hook: Turn start - could apply effects
    this.flexible.registerEventHook({
      id: 'turn_start_effects',
      name: 'Turn Start Effects',
      events: [CombatEventType.TURN_START],
      priority: 0,
      callback: (event) => {
        return {};
      }
    });
  }
  
  /**
   * Main combat simulation - GLOBAL TICK BASED dengan DEX
   */
  async simulate(
    playerTeam: Unit[], 
    enemyTeam: Unit[], 
    maxTicks: number = 500
  ): Promise<CombatResult> {
    this.log('info', `Starting tick-based combat: ${playerTeam.length} vs ${enemyTeam.length}`);
    
    let playerState = this.initializeUnits(playerTeam);
    let enemyState = this.initializeUnits(enemyTeam);
    
    const logs: CombatAction[] = [];
    let tick = 0;
    let winner: 'player' | 'enemy' | 'draw' = 'draw';
    
    // Emit combat start event
    this.flexible.eventHooks.emit({
      type: CombatEventType.COMBAT_START,
      tick: 0,
      data: { teams: [playerTeam.length, enemyTeam.length] }
    });
    
    while (tick < maxTicks) {
      tick++;
      
      // Emit turn start event
      this.flexible.eventHooks.emit({
        type: CombatEventType.TURN_START,
        tick,
        data: { turnNumber: Math.floor(tick / 100) }
      });
      
      playerState = this.processStatusEffects(playerState, tick, logs);
      enemyState = this.processStatusEffects(enemyState, tick, logs);
      
      const playerAlive = playerState.filter(u => u.isAlive);
      const enemyAlive = enemyState.filter(u => u.isAlive);
      
      if (playerAlive.length === 0 && enemyAlive.length === 0) {
        winner = 'draw';
        break;
      } else if (playerAlive.length === 0) {
        winner = 'enemy';
        break;
      } else if (enemyAlive.length === 0) {
        winner = 'player';
        break;
      }
      
      const allUnits = [...playerState, ...enemyState]
        .filter(u => u.isAlive)
        .filter(u => !this.isUnitStunned(u.statusEffects, tick))
        .sort((a, b) => {
          const aSpeed = this.getEffectiveSpeed(a, tick);
          const bSpeed = this.getEffectiveSpeed(b, tick);
          return aSpeed - bSpeed;
        });
      
      for (const unit of allUnits) {
        const effectiveDex = this.getEffectiveSpeed(unit, tick);
        const tickNeeded = Math.max(1, BASE_TICK_COST - effectiveDex);
        
        if (tick % tickNeeded !== 0) continue;
        
        const isPlayerUnit = playerState.some(p => p.id === unit.id);
        const targets = isPlayerUnit ? enemyState : playerState;
        const aliveTargets = targets.filter(t => t.isAlive);
        
        if (aliveTargets.length === 0) break;
        
        const targetIndex = Math.floor(
          this.seededRandom(`${unit.id}_target_${tick}`) * aliveTargets.length
        );
        const target = aliveTargets[targetIndex];
        
        // Create combat context for flexible system
        const context: CombatContext = this.flexible.createContext(
          tick,
          Math.floor(tick / 100),
          unit,
          target,
          ActionType.ATTACK
        );
        
        // Process action through flexible system
        const actionResult = await this.flexible.processAction(context, async () => {
          return this.executeActionInternal(unit, target, tick, 'basic_attack', TICK_COST_TABLE['basic_attack']);
        });
        
        const action = actionResult.action;
        logs.push(action);
        
        // Emit post-action event
        this.flexible.eventHooks.emit({
          type: CombatEventType.POST_ACTION,
          tick,
          source: unit,
          target,
          action
        });
        
        if (!action.isMiss && !action.isDodge && action.damage && action.damage > 0) {
          // Emit pre-damage event
          const preDamageResult = this.flexible.eventHooks.emitAggregated({
            type: CombatEventType.PRE_DAMAGE,
            tick,
            source: unit,
            target,
            action,
            data: { damage: action.damage }
          });
          
          let finalDamage = action.damage;
          if (preDamageResult.modifiedValues?.damage) {
            finalDamage = preDamageResult.modifiedValues.damage;
          }
          
          target.currentHp -= finalDamage;
          
          // Emit post-damage event
          this.flexible.eventHooks.emit({
            type: CombatEventType.POST_DAMAGE,
            tick,
            source: unit,
            target,
            action,
            data: { damage: finalDamage }
          });
          
          // Handle lifesteal (attacker has lifesteal buff, heals attacker)
          const lifestealEffect = unit.statusEffects?.find((s: StatusEffect) => s.type === StatusType.LIFESTEAL);
          if (lifestealEffect && lifestealEffect.value) {
            const healAmount = Math.floor(finalDamage * lifestealEffect.value / 100);
            unit.currentHp = Math.min(unit.maxHp, unit.currentHp + healAmount);
          }
          
          // Handle critical hit events
          if (action.isCrit) {
            this.flexible.eventHooks.emit({
              type: CombatEventType.ON_CRIT,
              tick,
              source: unit,
              target,
              action,
              data: { damage: finalDamage }
            });
          }
          
          // Handle kill events
          if (target.currentHp <= 0) {
            target.currentHp = 0;
            target.isAlive = false;
            
            // Update the action to mark as kill
            action.isKill = true;
            
            this.flexible.eventHooks.emit({
              type: CombatEventType.ON_KILL,
              tick,
              source: unit,
              target,
              action,
              data: { killerId: unit.id }
            });
            
            this.flexible.eventHooks.emit({
              type: CombatEventType.ON_DEATH,
              tick,
              source: unit,
              target,
              action
            });
          }
        }
        
        // Handle miss events
        if (action.isMiss) {
          this.flexible.eventHooks.emit({
            type: CombatEventType.ON_MISS,
            tick,
            source: unit,
            target,
            action
          });
        }
        
        // Handle dodge events
        if (action.isDodge) {
          this.flexible.eventHooks.emit({
            type: CombatEventType.ON_DODGE,
            tick,
            source: unit,
            target,
            action
          });
        }
      }
      
      // Emit turn end event
      this.flexible.eventHooks.emit({
        type: CombatEventType.TURN_END,
        tick,
        data: { turnNumber: Math.floor(tick / 100) }
      });
    }
    
    if (tick >= maxTicks) {
      const playerTotalHp = playerState.reduce((sum, u) => sum + u.currentHp, 0);
      const enemyTotalHp = enemyState.reduce((sum, u) => sum + u.currentHp, 0);
      
      if (playerTotalHp > enemyTotalHp) winner = 'player';
      else if (enemyTotalHp > playerTotalHp) winner = 'enemy';
      else winner = 'draw';
    }
    
    // Emit combat end event
    this.flexible.eventHooks.emit({
      type: CombatEventType.COMBAT_END,
      tick,
      data: { winner, totalTicks: tick }
    });
    
    const rewards = this.calculateRewards(winner, playerState, enemyState);
    
    this.log('info', `Finished: ${winner} in ${tick} ticks`);
    
    return {
      winner,
      totalTicks: tick,
      logs,
      finalState: {
        playerTeam: playerState,
        enemyTeam: enemyState
      },
      rewards
    };
  }

  private log(level: 'info' | 'warn' | 'error', message: string, ...args: any[]): void {
    const meta = args.length > 0 ? args : undefined;
    if (level === 'error') {
      logger.error(message, meta);
    } else if (level === 'warn') {
      logger.warn(message, meta);
    } else {
      logger.info(message, meta);
    }
  }

  private initializeUnits(units: Unit[], teamIndex?: number): UnitState[] {
    return units.map((u, idx) => ({
      ...u,
      currentHp: u.hp,
      statusEffects: [],
      isAlive: true,
      teamIndex: teamIndex ?? idx
    }));
  }

  private processStatusEffects(
    units: UnitState[], 
    tick: number,
    logs: CombatAction[]
  ): UnitState[] {
    return units.map(unit => {
      if (!unit.statusEffects || unit.statusEffects.length === 0) {
        return unit;
      }
      
      let currentHp = unit.currentHp;
      
      const newStatusEffects = unit.statusEffects.filter(effect => {
        const remaining = effect.tickApplied + effect.duration - tick;
        if (remaining <= 0) return false;
        
        const statusDef = STATUS_DEFINITIONS[effect.type as StatusType];
        if (!statusDef || !statusDef.value) return true;
        
        // DOT damage
        const dotTypes = [StatusType.POISON, StatusType.BURN, StatusType.BLEED];
        if (dotTypes.includes(effect.type as StatusType)) {
          currentHp -= statusDef.value;
          logs.push({
            tick,
            actorId: unit.id,
            actorName: unit.name,
            targetId: unit.id,
            targetName: unit.name,
            actionType: 'status_damage',
            damage: statusDef.value,
            effect: statusDef.name,
            isCrit: false,
            isMiss: false,
            isDodge: false
          });
          
          // Emit status tick event
          this.flexible.eventHooks.emit({
            type: CombatEventType.STATUS_TICK,
            tick,
            source: unit,
            target: unit,
            data: { effect: effect.type, damage: statusDef.value }
          });
        }
        
        // HOT heal
        if (effect.type === StatusType.REGEN) {
          const maxHeal = unit.maxHp - currentHp;
          const healAmount = Math.min(statusDef.value, maxHeal);
          currentHp += healAmount;
          logs.push({
            tick,
            actorId: unit.id,
            actorName: unit.name,
            targetId: unit.id,
            targetName: unit.name,
            actionType: 'status_heal',
            heal: healAmount,
            effect: statusDef.name,
            isCrit: false,
            isMiss: false,
            isDodge: false
          });
        }
        
        return true;
      });
      
      const isAlive = currentHp > 0;
      
      return {
        ...unit,
        currentHp: Math.max(0, currentHp),
        statusEffects: newStatusEffects,
        isAlive
      };
    });
  }

  private isUnitStunned(statusEffects: StatusEffect[] | undefined, tick: number): boolean {
    if (!statusEffects) return false;
    
    const stunTypes = [StatusType.STUN, StatusType.FREEZE, StatusType.SLEEP];
    return statusEffects.some(effect => 
      stunTypes.includes(effect.type as StatusType) &&
      effect.tickApplied + effect.duration > tick
    );
  }

  private getEffectiveSpeed(unit: UnitState, tick: number): number {
    let baseDex = unit.speed;
    
    if (unit.statusEffects) {
      for (const effect of unit.statusEffects) {
        if (effect.tickApplied + effect.duration > tick) {
          const statusDef = STATUS_DEFINITIONS[effect.type as StatusType];
          if (!statusDef || !statusDef.value) continue;
          
          if (effect.type === StatusType.SLOW) {
            baseDex = Math.floor(baseDex * (1 + statusDef.value / 100));
          }
          if (effect.type === StatusType.HASTE) {
            baseDex = Math.floor(baseDex * (1 - statusDef.value / 100));
          }
        }
      }
    }
    
    return Math.max(1, baseDex);
  }

  private executeActionInternal(
    attacker: UnitState, 
    target: UnitState, 
    tick: number,
    actionName: string,
    actionDef: any
  ): CombatAction {
    const rand = this.seededRandom(`${attacker.id}_${target.id}_${tick}`);
    
    const isBlinded = target.statusEffects?.some(
      e => e.type === StatusType.BLIND && e.tickApplied + e.duration > tick
    );
    
    let hitChance = 95 - (target.evasion || 0);
    if (isBlinded) hitChance -= 50;
    const isMiss = rand < (100 - hitChance) / 100;
    
    const dodgeRand = this.seededRandom(`${attacker.id}_${target.id}_${tick}_dodge`);
    const isDodge = !isMiss && dodgeRand < ((target.evasion || 0) / 100);
    
    const isSilenced = attacker.statusEffects?.some(
      e => e.type === StatusType.SILENCE && e.tickApplied + e.duration > tick
    );
    
    let damage = 0;
    let isCrit = false;
    
    if (!isMiss && !isDodge && actionDef.damage && actionDef.damage > 0 && !isSilenced) {
      let attackStat = attacker.attack || 0;
      
      const isWeakened = attacker.statusEffects?.some(
        e => e.type === StatusType.WEAKNESS && e.tickApplied + e.duration > tick
      );
      if (isWeakened && attacker.statusEffects) {
        const weakness = attacker.statusEffects.find(e => e.type === StatusType.WEAKNESS);
        if (weakness && weakness.value) {
          attackStat = Math.floor(attackStat * (1 + weakness.value / 100));
        }
      }
      
      const isBerserk = attacker.statusEffects?.some(
        e => e.type === StatusType.BERSERK && e.tickApplied + e.duration > tick
      );
      if (isBerserk && attacker.statusEffects) {
        const berserk = attacker.statusEffects.find(e => e.type === StatusType.BERSERK);
        if (berserk && berserk.value) {
          attackStat = Math.floor(attackStat * (1 + berserk.value / 100));
        }
      }
      
      damage = Math.max(1, Math.floor(attackStat * actionDef.damage));
      
      const critRand = this.seededRandom(`${attacker.id}_${target.id}_${tick}_crit`);
      const critChance = 10 + attacker.critRate;
      
      const isFocused = attacker.statusEffects?.some(
        e => e.type === StatusType.FOCUS && e.tickApplied + e.duration > tick
      );
      const effectiveCritChance = isFocused ? critChance + 30 : critChance;
      
      isCrit = critRand < (effectiveCritChance / 100);
      
      if (isCrit) {
        damage = Math.floor(damage * attacker.critDamage);
      }
      
      damage = Math.max(1, damage - target.defense);
      
      const isVulnerable = target.statusEffects?.some(
        e => e.type === StatusType.VULNERABILITY && e.tickApplied + e.duration > tick
      );
      if (isVulnerable && target.statusEffects) {
        const vuln = target.statusEffects.find(e => e.type === StatusType.VULNERABILITY);
        if (vuln && vuln.value) {
          damage = Math.floor(damage * (1 + vuln.value / 100));
        }
      }
      
      const variance = 0.9 + (this.seededRandom(`${attacker.id}_${tick}_var`) * 0.2);
      damage = Math.floor(damage * variance);
    }
    
    return {
      tick,
      actorId: attacker.id,
      actorName: attacker.name,
      targetId: target.id,
      targetName: target.name,
      actionType: actionName,
      damage: isMiss || isDodge ? 0 : damage,
      targetCurrentHp: target.currentHp - (isMiss || isDodge ? 0 : damage),  // ✅ Absolute HP after damage
      targetMaxHp: target.maxHp,
      actorCurrentHp: attacker.currentHp,
      animationTrigger: actionName,  // ✅ Animation trigger matches action type
      skillId: actionDef.skillId,
      isCrit,
      isMiss,
      isDodge,
      isKill: false  // Will be set by caller when target dies
    };
  }

  private seededRandom(seed: string): number {
    let hash = 0;
    for (let i = 0; i < seed.length; i++) {
      const char = seed.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(Math.sin(hash) * 10000) % 1;
  }

  private calculateRewards(
    winner: 'player' | 'enemy' | 'draw',
    playerTeam: UnitState[],
    enemyTeam: UnitState[]
  ): CombatRewards {
    if (winner !== 'player') {
      return { experience: 0, gold: 0, drops: [] };
    }
    
    const totalEnemyLevel = enemyTeam.reduce((sum, u) => sum + u.level, 0);
    const experience = Math.floor(totalEnemyLevel * 10);
    const gold = Math.floor(totalEnemyLevel * 5);
    
    const drops: string[] = [];
    for (const enemy of enemyTeam) {
      if (this.seededRandom(`drop_${enemy.id}`) < 0.3) {
        drops.push(`${enemy.name.toLowerCase()}_material`);
      }
    }
    
    return { experience, gold, drops };
  }

  // ========== N-TEAM COMBAT SIMULATION ==========
  
  async simulateTeams(
    teamConfigs: Unit[][],
    maxTicks: number = 500,
    winCondition: WinCondition = WinCondition.LAST_STANDING
  ): Promise<CombatResult> {
    if (typeof teamConfigs === 'object' && !Array.isArray(teamConfigs)) {
      const config = teamConfigs as BattleConfig;
      return this.battle(config);
    }
    
    return this._simulateTeamsWithConfig(
      teamConfigs, 
      { maxTicks, winCondition }
    );
  }
  
  async battle(config: BattleConfig): Promise<CombatResult> {
    return this._simulateTeamsWithConfig(config.teams, {
      maxTicks: config.maxTicks || 500,
      winCondition: config.winCondition || WinCondition.LAST_STANDING,
      capturePoint: config.capturePoint,
      captureRadius: config.captureRadius || 2,
      minKillsToWin: config.minKillsToWin,
      seed: config.seed
    });
  }
  
  private async _simulateTeamsWithConfig(
    teamConfigs: Unit[][],
    config: {
      maxTicks: number;
      winCondition: WinCondition;
      capturePoint?: { x: number; y: number };
      captureRadius?: number;
      minKillsToWin?: number;
      seed?: string;
    }
  ): Promise<CombatResult> {
    const numTeams = teamConfigs.length;
    const winCond = config.winCondition;
    
    this.log('info', `Starting ${numTeams}-team combat (${winCond}): ${teamConfigs.map(t => t.length).join(' vs ')}`);
    
    const teams: UnitState[][] = teamConfigs.map(units => this.initializeUnits(units));
    
    const teamStats: TeamStats[] = teamConfigs.map(() => ({
      kills: 0,
      deaths: 0,
      damageDealt: 0,
      damageTaken: 0,
      capturePoints: 0,
      highestKillTick: -1
    }));
    
    const prevHp: Map<string, number> = new Map();
    for (const team of teams) {
      for (const unit of team) {
        prevHp.set(unit.id, unit.currentHp);
      }
    }
    
    const logs: CombatAction[] = [];
    let tick = 0;
    let winningTeamIndices: number[] = [];
    let firstKillTick = -1;
    let firstKillTeam = -1;
    
    const capturePoint = config.capturePoint || { x: 5, y: 5 };
    const captureRadius = config.captureRadius || 2;
    
    while (tick < config.maxTicks) {
      tick++;
      
      for (let i = 0; i < teams.length; i++) {
        teams[i] = this.processStatusEffects(teams[i], tick, logs);
      }
      
      for (let i = 0; i < teams.length; i++) {
        for (const unit of teams[i]) {
          const prev = prevHp.get(unit.id) || unit.maxHp;
          if (prev > 0 && unit.currentHp <= 0 && unit.isAlive) {
            unit.isAlive = false;
            teamStats[i].deaths++;
          }
          prevHp.set(unit.id, unit.currentHp);
        }
      }
      
      const aliveCounts = teams.map(team => team.filter(u => u.isAlive).length);
      
      if (winCond === WinCondition.LAST_STANDING || winCond === WinCondition.ANNIHILATION) {
        const teamsWithAlive = aliveCounts.filter(c => c > 0).length;
        
        if (teamsWithAlive === 0) {
          winningTeamIndices = [];
          break;
        } else if (teamsWithAlive === 1) {
          winningTeamIndices = [aliveCounts.findIndex(c => c > 0)];
          break;
        }
      }
      
      if (winCond === WinCondition.TIME_LIMIT && tick >= config.maxTicks) {
        const maxAlive = Math.max(...aliveCounts);
        winningTeamIndices = aliveCounts
          .map((count, idx) => count === maxAlive ? idx : -1)
          .filter(idx => idx >= 0);
        break;
      }
      
      if (winCond === WinCondition.SURVIVAL && tick >= config.maxTicks) {
        const hpPercentages = teams.map((team) => {
          const alive = team.filter(u => u.isAlive);
          if (alive.length === 0) return 0;
          const totalHpPercent = alive.reduce((sum, u) => sum + (u.currentHp / u.maxHp), 0);
          return totalHpPercent;
        });
        const maxHp = Math.max(...hpPercentages);
        winningTeamIndices = hpPercentages
          .map((pct, idx) => pct === maxHp ? idx : -1)
          .filter(idx => idx >= 0);
        break;
      }
      
      if (winCond === WinCondition.TOTAL_KILLS && config.minKillsToWin) {
        const winningTeam = teamStats.findIndex(s => s.kills >= config.minKillsToWin!);
        if (winningTeam >= 0) {
          winningTeamIndices = [winningTeam];
          break;
        }
      }
      
      if (winCond === WinCondition.KING_HILL) {
        for (let i = 0; i < teams.length; i++) {
          const team = teams[i];
          for (const unit of team) {
            if (unit.isAlive && unit.position) {
              const dist = Math.abs(unit.position.x - capturePoint.x) + 
                          Math.abs(unit.position.y - capturePoint.y);
              if (dist <= captureRadius) {
                teamStats[i].capturePoints++;
              }
            }
          }
        }
      }
      
      if (winCond === WinCondition.TOTAL_DAMAGE) {
        const maxDamage = Math.max(...teamStats.map(s => s.damageDealt));
        const totalDamage = teamStats.reduce((sum, s) => sum + s.damageDealt, 0);
        if (totalDamage > 0 && maxDamage > totalDamage * 0.7) {
          const dominantTeam = teamStats.findIndex(s => s.damageDealt === maxDamage);
          if (dominantTeam >= 0 && aliveCounts[dominantTeam] > 0) {
            winningTeamIndices = [dominantTeam];
            break;
          }
        }
      }
      
      const eligibleUnits: { unit: UnitState; teamIndex: number }[] = [];
      
      for (let i = 0; i < teams.length; i++) {
        const teamEligible = teams[i].filter(u => 
          u.isAlive && !u.statusEffects?.some(s => s.type === StatusType.STUN)
        );
        
        for (const unit of teamEligible) {
          const dex = unit.speed || 10;
          const tickNeeded = Math.max(1, 100 - dex);
          
          if (tick % tickNeeded === 0) {
            eligibleUnits.push({ unit, teamIndex: i });
          }
        }
      }
      
      if (eligibleUnits.length === 0) continue;
      
      for (const { unit, teamIndex } of eligibleUnits) {
        const currentUnit = teams[teamIndex].find(u => u.id === unit.id);
        if (!currentUnit || !currentUnit.isAlive) continue;
        
        const enemyUnits: UnitState[] = [];
        for (let i = 0; i < teams.length; i++) {
          if (i !== teamIndex) {
            enemyUnits.push(...teams[i].filter(u => u.isAlive));
          }
        }
        
        if (enemyUnits.length === 0) continue;
        
        let nearestEnemy = enemyUnits[0];
        let nearestDist = Infinity;
        
        if (currentUnit.position) {
          for (const enemy of enemyUnits) {
            if (enemy.position) {
              const dist = Math.abs(enemy.position.x - currentUnit.position.x) + 
                          Math.abs(enemy.position.y - currentUnit.position.y);
              if (dist < nearestDist) {
                nearestDist = dist;
                nearestEnemy = enemy;
              }
            }
          }
        }
        
        const attackRange = currentUnit.attackRange || 1;
        let canAttack = false;
        
        if (currentUnit.position && nearestEnemy.position) {
          const dist = Math.abs(nearestEnemy.position.x - currentUnit.position.x) + 
                      Math.abs(nearestEnemy.position.y - currentUnit.position.y);
          canAttack = dist <= attackRange;
        }
        
        if (canAttack && nearestEnemy) {
          const action = this.executeActionInternal(currentUnit, nearestEnemy, tick, 'basic_attack', {
            damage: currentUnit.attack || 10,
            accuracy: currentUnit.accuracy ? currentUnit.accuracy / 100 : 0.9,
            critRate: currentUnit.critRate ? currentUnit.critRate / 100 : 0.1,
            critMultiplier: currentUnit.critDamage || 1.5
          });
          
          logs.push(action);
          
          if (!action.isMiss && !action.isDodge && action.damage && action.damage > 0) {
            teamStats[teamIndex].damageDealt += action.damage;
            teamStats[nearestEnemy.teamIndex || 0].damageTaken += action.damage;
            
            nearestEnemy.currentHp -= action.damage;
            
            if (nearestEnemy.currentHp <= 0) {
              nearestEnemy.currentHp = 0;
              nearestEnemy.isAlive = false;
              teamStats[teamIndex].kills++;
              
              if (firstKillTick < 0) {
                firstKillTick = tick;
                firstKillTeam = teamIndex;
              }
              teamStats[teamIndex].highestKillTick = tick;
            }
          }
        }
      }
    }
    
    const aliveCounts = teams.map(team => team.filter(u => u.isAlive).length);
    
    if (winCond === WinCondition.FIRST_BLOOD && firstKillTeam >= 0) {
      winningTeamIndices = [firstKillTeam];
    }
    
    if (winCond === WinCondition.KING_HILL) {
      const maxCapture = Math.max(...teamStats.map(s => s.capturePoints));
      winningTeamIndices = teamStats
        .map((s, idx) => s.capturePoints === maxCapture && aliveCounts[idx] > 0 ? idx : -1)
        .filter(idx => idx >= 0);
    }
    
    if (winCond === WinCondition.TOTAL_KILLS) {
      const maxKills = Math.max(...teamStats.map(s => s.kills));
      winningTeamIndices = teamStats
        .map((s, idx) => s.kills === maxKills && aliveCounts[idx] > 0 ? idx : -1)
        .filter(idx => idx >= 0);
    }
    
    if (winCond === WinCondition.TOTAL_DAMAGE) {
      const maxDamage = Math.max(...teamStats.map(s => s.damageDealt));
      winningTeamIndices = teamStats
        .map((s, idx) => s.damageDealt === maxDamage && aliveCounts[idx] > 0 ? idx : -1)
        .filter(idx => idx >= 0);
    }
    
    let winner: string = 'draw';
    if (winningTeamIndices.length === 1) {
      if (numTeams === 2) {
        winner = winningTeamIndices[0] === 0 ? 'player' : 'enemy';
      } else {
        winner = `team${winningTeamIndices[0] + 1}`;
      }
    } else if (winningTeamIndices.length > 1) {
      winner = `teams ${winningTeamIndices.map(i => i + 1).join(', ')}`;
    }
    
    const rewards = this.calculateRewards(winner as 'player' | 'enemy' | 'draw', teams[0] || [], teams[1] || []);
    
    this.log('info', `Finished: ${winner} in ${tick} ticks (winning: ${winningTeamIndices.join(', ')})`);
    
    return {
      winner: winner as 'player' | 'enemy' | 'draw',
      totalTicks: tick,
      logs,
      finalState: {
        teams,
        teamStats
      },
      rewards,
      winningTeams: winningTeamIndices
    };
  }
}

// ========== BACKWARD COMPATIBILITY ALIAS ==========
/**
 * @deprecated Use CombatEngine instead. This alias is provided for backward compatibility.
 */
export const CombatSimulator = CombatEngine;
