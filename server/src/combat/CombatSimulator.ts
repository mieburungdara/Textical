/**
 * Tick-Based Combat Simulator v2.0
 * 
 * Sesuai dengan GDD:
 * - STR → Physical Attack
 * - DEX → Speed, Attack Speed, Accuracy, Evasion
 * - INT → Spell Damage, Cast Speed
 * - DEF → Damage Mitigation
 * 
 * Tick System:
 * - Semua unit butuh 100 tick BASE untuk bergerak
 * - DEX mengurangi tick: tickNeeded = 100 - DEX
 */

import { 
  Unit, 
  CombatAction, 
  CombatResult, 
  UnitState, 
  CombatRewards,
  StatusEffect,
  TICK_COST_TABLE 
} from './TickCost.js';

import { 
  getAllStatusEffects, 
  getStatusEffect,
  StatusEffectTemplate 
} from '../templates/status_effects/index.js';

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
// Now built from centralized status_effects templates (DRY)

// Build STATUS_DEFINITIONS from templates + additional statuses
// Initialize with all StatusType keys to avoid TS error
const _statusDefs: Record<string, {name: string, duration: number, value?: number, description: string}> = {};

// Build complete STATUS_DEFINITIONS
function buildStatusDefinitions(): Record<StatusType, {name: string, duration: number, value?: number, description: string}> {
  const result: Record<string, {name: string, duration: number, value?: number, description: string}> = {};
  
  // Get templates from status_effects system
  const templates = getAllStatusEffects();
  
  for (const template of templates) {
    // Map template ID to StatusType enum value (uppercase)
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
  
  // Add additional statuses not in templates
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
  
  // Merge additional statuses
  for (const [key, value] of Object.entries(additionalStatuses)) {
    result[key] = value;
  }
  
  return result as Record<StatusType, {name: string, duration: number, value?: number, description: string}>;
}

// Initialize on module load
export const STATUS_DEFINITIONS = buildStatusDefinitions();

// ========== COMBAT SIMULATOR ==========

export class CombatSimulator {
  /**
   * Main combat simulation - GLOBAL TICK BASED dengan DEX
   */
  async simulate(
    playerTeam: Unit[], 
    enemyTeam: Unit[], 
    maxTicks: number = 500
  ): Promise<CombatResult> {
    console.log(`[Combat] Starting tick-based combat: ${playerTeam.length} vs ${enemyTeam.length}`);
    
    let playerState = this.initializeUnits(playerTeam);
    let enemyState = this.initializeUnits(enemyTeam);
    
    const logs: CombatAction[] = [];
    let tick = 0;
    let winner: 'player' | 'enemy' | 'draw' = 'draw';
    
    while (tick < maxTicks) {
      tick++;
      
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
        
        const actionName = 'basic_attack';
        const actionDef = TICK_COST_TABLE[actionName];
        
        const action = this.executeAction(unit, target, tick, actionName, actionDef);
        logs.push(action);
        
        if (!action.isMiss && !action.isDodge && action.damage && action.damage > 0) {
          target.currentHp -= action.damage;
          
          const lifestealEffect = target.statusEffects?.find(s => s.type === StatusType.LIFESTEAL);
          if (lifestealEffect && lifestealEffect.value) {
            const healAmount = Math.floor(action.damage * lifestealEffect.value / 100);
            target.currentHp = Math.min(target.maxHp, target.currentHp + healAmount);
          }
          
          if (target.currentHp <= 0) {
            target.currentHp = 0;
            target.isAlive = false;
          }
        }
      }
    }
    
    if (tick >= maxTicks) {
      const playerTotalHp = playerState.reduce((sum, u) => sum + u.currentHp, 0);
      const enemyTotalHp = enemyState.reduce((sum, u) => sum + u.currentHp, 0);
      
      if (playerTotalHp > enemyTotalHp) winner = 'player';
      else if (enemyTotalHp > playerTotalHp) winner = 'enemy';
      else winner = 'draw';
    }
    
    const rewards = this.calculateRewards(winner, playerState, enemyState);
    
    console.log(`[Combat] Finished: ${winner} in ${tick} ticks`);
    
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

  private initializeUnits(units: Unit[]): UnitState[] {
    return units.map(u => ({
      ...u,
      currentHp: u.hp,
      statusEffects: [],
      isAlive: true
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

  private executeAction(
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
    
    let hitChance = 95 - target.evasion;
    if (isBlinded) hitChance -= 50;
    const isMiss = rand < (100 - hitChance) / 100;
    
    const dodgeRand = this.seededRandom(`${attacker.id}_${target.id}_${tick}_dodge`);
    const isDodge = !isMiss && dodgeRand < (target.evasion / 100);
    
    const isSilenced = attacker.statusEffects?.some(
      e => e.type === StatusType.SILENCE && e.tickApplied + e.duration > tick
    );
    
    let damage = 0;
    let isCrit = false;
    
    if (!isMiss && !isDodge && actionDef.damage && actionDef.damage > 0 && !isSilenced) {
      let attackStat = attacker.attack;
      
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
      isCrit,
      isMiss,
      isDodge
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
}
