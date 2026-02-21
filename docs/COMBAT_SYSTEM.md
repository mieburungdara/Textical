# Dokumentasi Sistem Combat Textical (v3.0 - Expert Combat Reference)

## Daftar Isi
1. [Arsitektur Battle System](#1-arsitektur-battle-system)
2. [Battle Simulation](#2-battle-simulation)
3. [Battle Rules & Damage Calculation](#3-battle-rules--damage-calculation)
4. [Battle Unit](#4-battle-unit)
5. [Battle Grid & Tile Patterns](#5-battle-grid--tile-patterns)
6. [Battle Logger & Replay](#6-battle-logger--replay)
7. [AI Decision Engine](#7-ai-decision-engine)
8. [Movement System](#8-movement-system)
9. [Status Effects](#9-status-effects)
10. [Traits System](#10-traits-system)
11. [Elemental System](#11-elemental-system)
12. [Stat Processor](#12-stat-processor)
13. [Environment System](#13-environment-system)
14. [Design Patterns](#14-design-patterns)
15. [Edge Cases & Optimizations](#15-edge-cases--optimizations)

---

## 1. Arsitektur Battle System

### 1.1 Struktur Folder Combat
```
server/src/logic/
├── battleSimulation.js    # Main orchestrator
├── battleRules.js         # Combat rules
├── battleUnit.js          # Unit state
├── battleAI.js           # AI decisions
├── battleGrid.js         # Grid & pathfinding
├── battleLogger.js       # Combat logging
├── combatRules.js        # Static combat formulas
├── statProcessor.js      # Stat calculation
├── statSystem.js         # Stat system
├── battle/
│   └── UnitPotionHandler.js  # Potion system
├── movement/
│   ├── AStarMovement.js       # Pathfinding movement
│   └── MovementStrategy.js    # Movement interface
├── status/
│   ├── BaseStatus.js
│   ├── StunStatus.js
│   ├── ShieldStatus.js
│   ├── StealthStatus.js
│   ├── WetStatus.js
│   └── LeadenStatus.js
├── traits/
│   ├── BaseTrait.js
│   └── definitions/  # Trait implementations
└── world/
    └── EnvironmentalResolver.js
```

### 1.2 Komponen Utama

| Komponen | File | Responsibility |
| :--- | :--- | :--- |
| **BattleSimulation** | `battleSimulation.js` | Orchestrator - lifecycle battle |
| **BattleGrid** | `battleGrid.js` | Pathfinding, tile patterns |
| **BattleLogger** | `battleLogger.js` | Event logging, replay |
| **BattleRules** | `battleRules.js` | Combat rules - delegates ke sub-systems |
| **BattleAI** | `battleAI.js` | AI decision making |
| **BattleUnit** | `battleUnit.js` | Unit state management |

---

## 2. Battle Simulation

### 2.1 Core Properties

```javascript
class BattleSimulation {
    constructor(width, height, regionType = "FOREST") {
        this.battleId = uuidv4();
        this.width = width;
        this.height = height;
        this.regionType = regionType.toUpperCase();
        this.units = [];
        this.currentTick = 0;
        this.isFinished = false;
        this.winnerTeam = -1;
        this.MAX_TICKS = 10000;
        
        // Battle Registry
        this.startTick = 0;
        this.userId = null;
        this.battleType = "SOLO"; // SOLO, HORDE, PVP
        
        // Components
        this.grid = new BattleGrid(width, height);
        this.logger = new BattleLogger();
        this.rules = new BattleRules(this);
        this.ai = new BattleAI(this);
        
        // Simulation Components
        this.unitManager = new SimUnitManager(this);
        this.environment = new SimEnvironmentSystem(this);
        this.loop = new SimLoopProcessor(this);
    }
}
```

### 2.2 Simulation Components Composition

```
BattleSimulation
    ├── SimUnitManager    → Manajemen unit & adjacency
    ├── SimEnvironmentSystem → Environment (DAY/NIGHT, weather)
    └── SimLoopProcessor  → Tick processing
```

---

## 3. Battle Rules & Damage Calculation

### 3.1 Sub-Systems Composition

```
BattleRules (v4.5)
    ├── TacticalSensor         → Relative position, Cover, Direction
    ├── SkillResolver          → Skill execution
    ├── DeathResolver          → Death handling
    ├── CombatFormulaResolver  → Hit/Crit/Block/Parry
    ├── CombatEventBroadcaster → Ally broadcast
    └── MovementResolver       → Knockback
```

### 3.2 Complete Damage Flow

```
performAttack(attacker, defender)
    │
    ├─► 1. Pre-Action Hook (trait: onPreAction)
    ├─► 2. Range Safeguard (double-check)
    ├─► 3. Reveal stealthed unit
    ├─► 4. Tactical Sensing → Relative Position (BACK/SIDE/FRONT)
    ├─► 5. Cover Check → Defense bonus +15
    ├─► 6. Pre-Attack Hooks (onPreAttack, onPreDefend)
    ├─► 7. Record durability loss (MAIN_HAND)
    ├─► 8. Hit Chance Calculation → Roll
    ├─► 9. Block/Parry Resolution
    ├─► 10. Critical Hit Calculation
    ├─► 11. Damage: (Atk * Mult * ElemMult) - EffectiveDef
    ├─► 12. Mitigation Hooks (onTakeDamage)
    ├─► 13. Apply Damage → takeDamage()
    ├─► 14. Record durability loss (CHEST, LEGS, HEAD, ACCESSORY)
    ├─► 15. Broadcast ally event (onAllyDamage)
    ├─► 16. Post-Hit Hooks (onCrit, onPostHit, onLifesteal)
    ├─► 17. Knockback (MovementResolver)
    └─► 18. Check Death → onKill Hook
```

### 3.3 Directional Combat Bonuses

| Posisi | Damage | Accuracy | Crit Bonus | Bypass Block |
| :--- | :---: | :---: | :---: | :---: |
| **BACK** | 1.5x | +20 | +25% | Yes |
| **SIDE** | 1.1x | +5 | +10% | No |
| **FRONT** | 1.0x | +0 | +0% | No |

### 3.4 CombatRules Static Methods

```javascript
// combatRules.js
static calculateDamage(attacker, defender, dmgMult, element, sim) {
    // 1. Elemental effectiveness
    // 2. Hit check
    // 3. Armor penetration vs defense
    // 4. Base damage
    // 5. Critical hit
    // 6. Block/Parry
    return { damage, isCrit, isMiss, isBlocked, isParried, debug };
}
```

---

## 4. Battle Unit

### 4.1 Timeline-Based Action Readiness

Sistem AP diganti dengan timeline berbasis tick:

```javascript
class BattleUnit {
    // Timeline properties
    nextActionTick = 0;      // Tick when unit can act
    skillCooldowns = {};     // { skillId: readyAtTick }
    stuckTicks = 0;          // Stuck detection counter
    waitTicks = 0;           // Wait delay
    moveCooldownTicks = 0;  // Movement cooldown
    posHistory = [];         // Position history
    
    isReady(sim) {
        // STUN atau CRYSTALLIZED = cannot act
        if (this.activeEffects.some(e => e.type === "STUN" || e.type === "CRYSTALLIZED"))
            return false;
        return sim.currentTick >= this.nextActionTick;
    }
    
    setActionDelay(delay, sim) {
        this.nextActionTick = sim.currentTick + delay;
    }
    
    setSkillCooldown(skillId, duration, sim) {
        this.skillCooldowns[skillId] = sim.currentTick + duration;
    }
}
```

### 4.2 Unit Properties

```javascript
// Identity
instanceId, heroId, teamId, race, behavior

// Position & Facing
gridPos: { x, y }
facing: "NORTH" | "SOUTH" | "EAST" | "WEST"

// Resources
currentHealth, currentMana, currentRage, currentEnergy

// Combat
activeSkills, passiveSkills, equippedItems, traits
isDead, isStealthed, activeEffects
```

### 4.3 Resource Types

```javascript
// Resource type: MANA, RAGE, ENERGY
getResourceValue(type)
getMaxResourceValue(type)
consumeResource(amount, type, sim)
gainResource(amount, type, sim)
```

### 4.4 Effect System

```javascript
applyEffect(statusInstance, sim)
removeEffect(type, sim)
applyStatusDamage(sim)  // Tick all effects
```

---

## 5. Battle Grid & Tile Patterns

### 5.1 Grid Features

```javascript
class BattleGrid {
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.terrainGrid = Array(height).fill().map(() => Array(width).fill(0));
        this.unitGrid = Array(height).fill().map(() => Array(width).fill(null));
        
        // EasyStar pathfinding
        this.easystar = new EasyStar.js();
    }
}
```

### 5.2 Tile Patterns (12 Types)

| Pattern | Deskripsi | Uso |
| :--- | :--- | :--- |
| **SQUARE** | Kotak penuh sekeliling center | AOE Damage |
| **CROSS** | 4 arah (UP/DOWN/LEFT/RIGHT) | Line skill |
| **LINE** | Horizontal/Vertical through center | Beam |
| **RING** | Lingkaran kosong (hollow) | Nova |
| **DIAMOND** | Manhattan distance | Cone area |
| **SECTOR** | 90° cone (front-facing) | Conal skill |
| **SPIRAL** | Spiral outward | Expanding trap |
| **DOUBLE_LINE** | Cross shape | X-pattern |
| **X_SHAPE** | Diagonal cross | Diagonal blast |
| **CHECKERBOARD** | Alternating tiles | Selective AOE |
| **WAVE** | Arc shape | Wave skill |
| **RANDOM_SPREAD** | Random dalam radius | Scatter |

### 5.3 Grid Methods

```javascript
findPath(start, target)     // EasyStar pathfinding
hasLineOfSight(p1, p2)     // Bresenham's algorithm
getNeighbors(pos)           // 4 cardinal directions
getDistance(p1, p2)         // Manhattan distance
isTileOccupied(x, y)
isWalkable(x, y)           // Check boundary + terrain + unit
```

---

## 6. Battle Logger & Replay

### 6.1 Event Types

```javascript
// MOVE, ATTACK, HEAL, TRAIT, AI, STATUS, MISS, PARRY, CRIT, ENGINE, MASTERY
addEvent(type, msg, data = {}, isInternal = false)
```

### 6.2 Sparse Logging

Tick disimpan HANYA jika:
- Ada event terjadi
- Ada perubahan penting
- Tick 0 atau milestone (500 tick interval)

```javascript
commitTick(units) {
    const hasMoved = lastState.pos !== currentState.pos;
    const hasStatusChange = lastState.hp !== currentState.hp;
    const isMilestone = tickNum % 500 === 0;
    
    if (hasMoved || hasStatusChange || isMilestone) {
        this.ticks.push(this.currentTick);
    }
}
```

### 6.3 Replay Data

```javascript
getReplayData(debug = false) {
    // Filter internal events jika debug=false
    return { metadata, ticks[] };
}
```

---

## 7. AI Decision Engine

### 7.1 Stuck Detection & Retarget

```javascript
if (actor.stuckTicks >= 3) {
    this.sim.logger.addEvent("ENGINE", `[AI_RETARGET] ${actor.data.name} searching for new path.`, 
        { unit_id: actor.instanceId }, true);
    
    const blackboard = btManager.blackboards[actor.instanceId];
    if (blackboard) blackboard.set('target', null);
}
```

### 7.2 Target Acquisition

```javascript
findTarget(actor) {
    // Filter: bukan team sendiri, bukan dead
    let targets = units.filter(u => {
        if (!u || u.teamId === actor.teamId || u.isDead) return false;
        
        // Stealth detection dengan TrueSight
        if (u.isStealthed && !hasTrueSight) {
            const dist = this.sim.grid.getDistance(actor.gridPos, u.gridPos);
            if (dist > 1) return false; // Reveal range 1 tile
        }
        return true;
    });
    
    // Priority: lowest HP jika target_priority=2, else closest
}
```

### 7.3 Potion AI

- **HP Threshold**: 35%
- Extracted ke `PotionDecisionEngine` terpisah

### 7.4 Skill Usage

- **Chance**: 30% jika dalam range

### 7.5 Behavior Tree Integration

```javascript
const treeName = actor.data.bt_tree || null; 
if (treeName) {
    const success = btManager.execute(treeName, actor, this.sim);
    return success; 
}
```

---

## 8. Movement System

### 8.1 AStarMovement

```javascript
class AStarMovement extends MovementStrategy {
    execute(actor, target) {
        // 1. Move Cooldown
        if (actor.moveCooldownTicks > 0) {
            actor.moveCooldownTicks--;
            return false;
        }
        
        // 2. Wait Check
        if (actor.waitTicks > 0) {
            actor.waitTicks--;
            return false;
        }
        
        // 3. Distance Check
        if (currentDist <= attackRange) return false;
        
        // 4. Slipstream trait
        if (canSlipstream) this.sim.grid.easystar.stopAvoidingAllAdditionalPoints();
        
        // 5. Local Obstacle Memory
        if (actor.localObstacles) { ... }
        
        // 6. Find path dan execute
    }
}
```

### 8.2 MovementStrategy Base

```javascript
_teleport(actor, pos) {
    // Safety: Enforce 1-tile movement limit
    const dx = Math.abs(pos.x - actor.gridPos.x);
    const dy = Math.abs(pos.y - actor.gridPos.y);
    if (dx > 1 || dy > 1) { /* reject */ }
    
    // Atomic move
    sim.notifyAdjacencyLost(actor);
    // Update grid...
    sim.notifyAdjacencyGained(actor);
}
```

---

## 9. Status Effects

### 9.1 BaseStatus Architecture

```javascript
class BaseStatus {
    constructor(type, duration, power, options = {}) {
        this.type = type;
        this.duration = duration;
        this.power = power;
        this.options = {
            priority: 0,
            stackable: false,
            maxStacks: 1,
            canDispel: true,
            isBuff: false,
            statModifiers: [],
            ...options
        };
    }
}
```

### 9.2 Status Types

| Status | Efek Teknis | Durasi | Stackable |
| :--- | :--- | :--- | :--- |
| **STUN** | `isReady()` = false | 1-2 | No |
| **LEADEN** | Speed -30% | 3 | Yes (max 5) |
| **WET** | Water vuln +25% | 3 | Yes (max 3) |
| **SHIELD** | Damage absorption | Variable | No |
| **STEALTH** | +50 stealth level | 2 | No |
| **LINKED** | Damage transfer | 3 | No |

### 9.3 Status Implementations

```javascript
// StunStatus - Action denial
class StunStatus extends BaseStatus {
    isReady(sim) {
        return false; // Can't act
    }
}

// ShieldStatus - Damage absorption
class ShieldStatus extends BaseStatus {
    absorbDamage(amount, unit, sim) {
        const absorbed = Math.min(this.shieldAmount, amount);
        this.shieldAmount -= absorbed;
        return absorbed;
    }
}

// StealthStatus - Invisibility
class StealthStatus extends BaseStatus {
    breakStealth(unit, sim) {
        unit.isStealthed = false;
        this.duration = 0;
    }
}
```

---

## 10. Traits System

### 10.1 BaseTrait Hooks (30+ hooks)

```javascript
class BaseTrait {
    // Lifecycle
    onBattleStart(unit, sim) {}
    onRoundStart(unit, sim) {}    // Every 100 ticks
    onBattleEnd(unit, sim) {}
    
    // Turn phases
    onTurnStart(unit, sim) {}
    onPreAction(unit, sim) { return true; }
    onPostAction(unit, sim) {}
    
    // Movement
    onBeforeMove(unit, sim) { return true; }
    onMoveEnd(unit, sim) {}
    onAdjacencyGained(unit, neighbor, sim) {}
    
    // Combat initiation
    onPreAttack(attacker, target, sim) { return {}; }
    onAttackMissed(attacker, target, sim) {}
    onCrit(attacker, target, damage, sim) {}
    onPostAttack(attacker, target, damage, sim) {}
    onKill(attacker, victim, sim) {}
    onLifesteal(attacker, damage, sim) {}
    
    // Combat reaction
    onPreDefend(defender, attacker, sim) { return {}; }
    onDodge(defender, attacker, sim) {}
    onBlock(defender, attacker, sim) {}
    onTakeDamage(defender, attacker, amount, sim) { return {}; }
    onPostHit(defender, attacker, damage, sim) {}
    
    // Status
    onStatusApplied(unit, effect, sim) { return true; }
    onStatusTick(unit, effect, sim) {}
    onStatusExpired(unit, effect, sim) {}
    
    // Resource
    onManaGain(unit, amount, sim) {}
    onManaSpend(unit, amount, sim) {}
    onHealthRegen(unit, amount, sim) {}
    onBeforeDeath(unit, sim) { return false; }
    
    // Team synergy
    onAllyDamage(unit, ally, amount, sim) {}
    onAllyKill(unit, ally, victim, sim) {}
    onAllyDeath(unit, ally, sim) {}
    
    // Calculation hooks
    onCalculateHitChance(attacker, defender) { return {}; }
    onCalculateDodgeChance(defender, attacker) { return {}; }
    onCalculateCrit(attacker, defender) { return {}; }
    onCalculateBlock(defender, attacker) { return {}; }
}
```

### 10.2 Trait Examples

```javascript
// VampireTrait - Lifesteal
class VampireTrait extends BaseTrait {
    onLifesteal(attacker, damage, sim) {
        const heal = Math.floor(damage * 0.30);
        attacker.currentHealth = Math.min(attacker.stats.health_max, attacker.currentHealth + heal);
    }
}

// VanguardTrait - Guardian stance
class VanguardTrait extends BaseTrait {
    onAllyDamage(unit, sim, ally, amount) {
        if (dist <= 1) { // Adjacent
            const absorbed = Math.floor(amount * 0.5);
            unit.takeDamage(absorbed, sim);
        }
    }
}
```

### 10.3 Condition Types

```javascript
const ConditionType = {
    ENEMY_TYPE: 'ENEMY_TYPE',
    SELF_HP_BELOW: 'SELF_HP_BELOW',
    SELF_HP_ABOVE: 'SELF_HP_ABOVE',
    ENEMY_HP_BELOW: 'ENEMY_HP_BELOW',
    IN_COMBAT: 'IN_COMBAT',
    HAS_STATUS: 'HAS_STATUS',
    NO_STATUS: 'NO_STATUS'
};
```

---

## 11. Elemental System

### 11.1 Element Types

```javascript
const Element = {
    NEUTRAL: 'neutral',
    FIRE: 'fire',
    WATER: 'water',
    EARTH: 'earth',
    WIND: 'wind',
    LIGHTNING: 'lightning',
    LIGHT: 'light',
    DARK: 'dark'
};
```

### 11.2 Element Relationships

```javascript
const INTERACTIONS = {
    fire: { weakAgainst: 'water', strongAgainst: 'nature' },
    water: { weakAgainst: 'lightning', strongAgainst: 'fire' },
    lightning: { weakAgainst: 'earth', strongAgainst: 'water' },
    light: { weakAgainst: 'dark', typeBonus: { undead: 1.5, demon: 1.5 } },
    dark: { weakAgainst: 'light', isDoTElement: true, debuffBonus: 0.25 }
};
```

### 11.3 Weather Effects

```javascript
// EnvironmentalResolver.js
resolveModifiers(hour, weather, moonPhase) {
    // Time-Based
    if (isNight) {
        mods.combat.atkMult = 1.1;
        // Moon phase effects...
    }
    
    // Weather-Based
    switch (weather) {
        case "RAIN":   fireMult=0.8, waterMult=1.2;
        case "STORM":  atkMult=0.9, fireMult=0.5, waterMult=1.5;
        case "HEATWAVE": fireMult=1.3, waterMult=0.7;
    }
}
```

---

## 12. Stat Processor

### 12.1 Supported Stats

| Kategori | Stats |
| :--- | :--- |
| **Health/Resources** | health_max, mana_max, rage_max, energy_max |
| **Primary** | str, dex, int, vit |
| **Combat** | attack_damage, defense, speed, attack_range |
| **Critical** | crit_chance (max 1.0), crit_damage (max 5.0) |
| **Block** | block_chance (max 0.75), parry_chance (max 0.5) |
| **Elemental** | fire_damage, water_damage, fire_resistance, etc. |

### 12.2 Stat Calculation Layers

```
Layer 1: BASE         → Initialize stats
Layer 2: GROWTH       → Apply growth curves
Layer 3: TRAITS       → Apply trait stat bonuses
Layer 4: EQUIPMENT     → Apply equipment stats
Layer 5: SET_BONUS    → Apply set bonuses
Layer 6: ELEMENTAL    → Apply elemental modifiers
Layer 7: SKILLS       → Apply skill modifiers
Layer 8: BUFFS        → Apply active buffs
Layer 9: GUILD        → Apply guild facility buffs
Layer 10: FACTION     → Apply faction perks
Layer 11: WORLD_EVENTS → Apply world event modifiers
Layer 12: SCALING     → Apply attribute scaling
Layer 13: FINALIZE    → Apply caps
```

---

## 13. Environment System

### 13.1 EnvironmentalResolver

```javascript
resolveModifiers(hour, weather, moonPhase) {
    // Day/Night: 6:00-20:00 = DAY, else NIGHT
    const isNight = hour < 6 || hour >= 20;
    
    // Weather: CLEAR, RAIN, STORM, HEATWAVE
    // Moon Phase: NEW, WAXING, FULL, WANING
    
    return {
        combat: { atkMult, defMult, fireMult, waterMult },
        gathering: { yieldMult, speedMult, fishingYieldMult },
        travel: { speedMult },
        statModifiers: []
    };
}
```

---

## 14. Design Patterns

### 14.1 Patterns Used in Combat System

| Pattern | Usage |
| :--- | :--- |
| **Composition** | BattleRules delegating to sub-systems |
| **Strategy** | MovementStrategy, PotionDecisionEngine |
| **Observer** | Trait hooks system |
| **Factory** | Status effects, Traits |
| **Singleton** | Services |
| **Layered Architecture** | Stat calculation pipeline |
| **Caching** | BattleLogger sparse logging |

---

## 15. Edge Cases & Optimizations

### 15.1 Edge Cases

| Case | Handling |
| :--- | :--- |
| **Stuck Detection** | ≥3 stuck ticks → force retarget |
| **Stealth + TrueSight** | Reveal range 1 tile jika tidak ada TrueSight |
| **Durability 0** | 50% stat penalty applied |
| **Death Timing** | onBeforeDeath return true → survive at 1 HP |

### 15.2 Optimizations

| Optimization | Location |
| :--- | :--- |
| **Sparse Logging** | BattleLogger - only log changes |
| **Milestone Sync** | Every 500 ticks for safety |
| **Level-based Caps** | Scale dengan level |
| **Soft Caps** | Diminishing returns |
| **Memory-based Detour** | AStarMovement localObstacles |

---

*Dokumentasi Combat System v3.0 - Fokus pada engine pertarungan Textical.*
