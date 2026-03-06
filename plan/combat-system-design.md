# Combat System Design - Delay-Based Action System

## Overview

Textical RPG menggunakan **delay-based action system** dengan tick global. Setiap aksi memiliki tick cost, dan unit dengan stat yang lebih tinggi (DEX, speed modifiers) dapat melakukan aksi lebih cepat.

---

## Core Concepts

### 1. Tick Global Timeline

- **Tick Range**: 0 - 10,000+ (tergantung durasi battle)
- **Tick Increment**: +1 per tick
- **Global Clock**: Semua unit bergerak dalam timeline yang sama
- **Deterministic**: Hasil battle selalu sama untuk input yang sama

### 2. Action Delay System

**Universal Base Tick: Semua action memiliki base tick = 100**

Final tick cost dihitung dengan menggabungkan semua speed modifiers:

```
Final Tick Cost = 100 × (1 - TotalSpeedModifier)
TotalSpeedModifier = DEX_Bonus + Racial_Modifier + Affix_Modifier + Passive_Modifier
```

**Sumber Speed Modifier:**

#### A. DEX Stat
- 0.5% speed per DEX point
- Max 60% reduction (DEX 120)
- Contoh: DEX 40 = 20% speed bonus

#### B. Racial Traits
- **Human**: +5% all actions
- **Elf**: -15% movement, +10% magic
- **Dwarf**: -10% physical attack, +5% defense
- **Orc**: +10% physical attack, -5% magic
- **Halfling**: -20% movement, +5% item use
- **Gnome**: +15% magic, -10% physical attack
- **Tiefling**: +10% magic, +5% skill cast
- **Dragonborn**: +15% physical attack, -5% movement
- **Half-Elf**: -5% all actions
- **Half-Orc**: +10% physical attack, +5% movement
- **Aasimar**: +10% magic, +5% heal
- **Triton**: -10% movement (water), +10% water magic
- **Goliath**: +10% physical attack, +10% defense
- **Firbolg**: +5% heal, +10% nature magic
- **Kenku**: -15% movement, +10% skill cast

#### C. Item Affixes
- **Swift**: -15% all actions
- **Quick Strike**: -20% attack
- **Fleet Footed**: -25% movement
- **Haste**: -10% skill cast
- **Rapid Hands**: -20% item use
- **Arcane Haste**: -15% magic
- **Battle Ready**: -10% physical attack

#### D. Skill Passives
- **Quick Hands**: -20% item use
- **Swift Caster**: -15% skill cast
- **Agile Fighter**: -10% attack + movement
- **Lightning Reflexes**: -15% all actions
- **Battle Hardened**: -10% physical attack
- **Arcane Mastery**: -15% magic

**Contoh Perhitungan:**

Character dengan:
- DEX 60 → 30% speed
- Elf race → -15% movement, +10% magic
- Swift boots → -25% movement
- Quick Hands passive → -20% item use

| Action | Base | DEX | Race | Affix | Passive | Final |
|--------|------|-----|------|-------|---------|-------|
| Movement | 100 | -30% | -15% | -25% | - | **30** |
| Attack | 100 | -30% | - | - | - | **70** |
| Magic | 100 | -30% | +10% | - | - | **80** |
| Item Use | 100 | -30% | - | - | -20% | **50** |

### 3. Action Types & Base Tick

| Action Type | Base Tick | Modifier Categories |
|-------------|-----------|---------------------|
| Movement | 100 | DEX, racial_movement, affix_movement, passive_movement |
| Basic Attack | 100 | DEX, racial_attack, affix_attack, passive_attack |
| Skill Cast | 100 | DEX, racial_magic, affix_cast, passive_cast |
| Skill Cooldown | 100-500 | Skill-specific (independent of speed) |
| Item Use | 100 | DEX, racial_item, affix_item, passive_item |
| Defend | 100 | DEX, racial_defense, affix_defense, passive_defense |

### 4. Multiple Actions per Tick

- **No Limit**: Unit bisa melakukan multiple action di tick yang sama
- **Execution Order**: Berdasarkan speed (DEX) dan priority
- **Example**: Di tick 100, unit bisa:
  - Move (tick 100)
  - Attack (tick 100)
  - Use skill (tick 100)

---

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                    COMBAT ENGINE                            │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Tick Manager                                       │   │
│  │  - Global tick counter (0 - 10,000+)               │   │
│  │  - Tick increment logic                            │   │
│  │  - Battle duration tracking                        │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Action Queue System                                │   │
│  │  - Per-unit action queues                           │   │
│  │  - Action scheduling (next action tick)             │   │
│  │  - Priority sorting (speed-based)                   │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Action Executor                                    │   │
│  │  - Execute actions at current tick                  │   │
│  │  - Handle multiple actions per tick                 │   │
│  │  - Apply effects (damage, heal, status)             │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Damage Calculator                                  │   │
│  │  - STR/INT → Attack calculation                     │   │
│  │  - DEF → Damage mitigation                          │   │
│  │  - Elemental modifiers                              │   │
│  │  - Critical hit calculation                         │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Status Effect Manager                              │   │
│  │  - Apply/remove status effects                      │   │
│  │  - Tick-based duration tracking                     │   │
│  │  - Effect stacking                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  AI Decision System                                 │   │
│  │  - Target selection                                 │   │
│  │  - Action priority                                  │   │
│  │  - Behavior patterns                                │   │
│  └─────────────────────────────────────────────────────┘   │
│                          ↓                                  │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Replay Generator                                   │   │
│  │  - Record all actions                               │   │
│  │  - Compress replay data                             │   │
│  │  - Generate client-ready format                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## Data Structures

### Unit State

```javascript
{
  id: "unit_001",
  name: "Hero 1",
  type: "hero", // hero | enemy
  level: 10,
  race: "Human",
  class: "Fighter",
  
  // Stats
  stats: {
    str: 50,
    dex: 40,
    int: 20,
    def: 35
  },
  
  // Equipment (with affixes)
  equipment: [
    {
      id: "item_001",
      name: "Swift Boots",
      type: "boots",
      affixes: [
        { name: "Fleet Footed", value: -0.25, appliesTo: "movement" }
      ]
    },
    {
      id: "item_002",
      name: "Quick Strike Sword",
      type: "weapon",
      affixes: [
        { name: "Quick Strike", value: -0.20, appliesTo: "attack" }
      ]
    }
  ],
  
  // Skills (with passives)
  skills: [
    {
      id: "skill_001",
      name: "Fireball",
      type: "active",
      cooldown: 200,
      passives: []
    },
    {
      id: "skill_002",
      name: "Quick Hands",
      type: "passive",
      passives: [
        { name: "Quick Hands", value: -0.20, appliesTo: "item" }
      ]
    }
  ],
  
  // Current state
  currentTick: 0,           // Tick when unit can act next
  hp: 100,
  maxHp: 100,
  mp: 50,
  maxMp: 50,
  
  // Position
  position: { x: 0, y: 0 },
  
  // Status effects
  statusEffects: [
    {
      id: "poison",
      name: "Poison",
      type: "negative",
      duration: 50, // ticks
      effect: { damagePerTick: 2 }
    }
  ],
  
  // Skill cooldowns
  skillCooldowns: {
    "fireball": 0, // tick when skill becomes available
    "heal": 0
  },
  
  // Action queue
  actionQueue: [
    {
      type: "move",
      targetTick: 100,
      tickCost: 30, // Calculated based on modifiers
      targetPosition: { x: 5, y: 0 }
    },
    {
      type: "attack",
      targetTick: 100,
      tickCost: 70, // Calculated based on modifiers
      targetId: "enemy_001"
    }
  ]
}
```

### Action Definition

```javascript
{
  id: "action_001",
  unitId: "unit_001",
  type: "attack", // move | attack | skill | item | defend
  targetTick: 100,
  
  // Action-specific data
  data: {
    targetId: "enemy_001",
    skillId: null,
    itemId: null,
    targetPosition: null
  },
  
  // Execution result (filled after execution)
  result: {
    success: true,
    damage: 25,
    critical: false,
    effects: []
  }
}
```

### Battle State

```javascript
{
  id: "battle_001",
  currentTick: 0,
  maxTick: 10000,
  
  // Units
  heroes: [ /* hero units */ ],
  enemies: [ /* enemy units */ ],
  
  // All actions executed
  actionLog: [
    {
      tick: 100,
      actions: [ /* actions executed at tick 100 */ ]
    }
  ],
  
  // Battle result
  result: {
    winner: "heroes", // heroes | enemies | draw
    endedAtTick: 5432,
    reason: "all enemies defeated"
  }
}
```

---

## Core Algorithms

### 1. Tick Cost Calculation

```javascript
function calculateTickCost(unit, actionType) {
  // Universal base tick: 100 for all actions
  const baseCost = 100;
  
  // Calculate total speed modifier from all sources
  const totalSpeedModifier = calculateTotalSpeedModifier(unit, actionType);
  
  // Apply hard cap: max 60% reduction (min 40 tick)
  const cappedModifier = Math.min(totalSpeedModifier, 0.60);
  
  // Calculate final tick cost
  const finalCost = baseCost * (1 - cappedModifier);
  
  return Math.round(finalCost);
}

function calculateTotalSpeedModifier(unit, actionType) {
  let totalModifier = 0;
  
  // 1. DEX Stat Bonus (0.5% per DEX point)
  const dexBonus = unit.stats.dex * 0.005;
  totalModifier += dexBonus;
  
  // 2. Racial Trait Modifier
  const racialModifier = getRacialModifier(unit.race, actionType);
  totalModifier += racialModifier;
  
  // 3. Item Affix Modifiers (sum of all equipped items)
  const affixModifier = getAffixModifier(unit.equipment, actionType);
  totalModifier += affixModifier;
  
  // 4. Skill Passive Modifiers (sum of all learned passives)
  const passiveModifier = getPassiveModifier(unit.skills, actionType);
  totalModifier += passiveModifier;
  
  return totalModifier;
}

function getRacialModifier(race, actionType) {
  const racialTraits = {
    "Human": { all: 0.05 },
    "Elf": { movement: -0.15, magic: 0.10 },
    "Dwarf": { attack: -0.10, defense: 0.05 },
    "Orc": { attack: 0.10, magic: -0.05 },
    "Halfling": { movement: -0.20, item: 0.05 },
    "Gnome": { magic: 0.15, attack: -0.10 },
    "Tiefling": { magic: 0.10, cast: 0.05 },
    "Dragonborn": { attack: 0.15, movement: -0.05 },
    "Half-Elf": { all: -0.05 },
    "Half-Orc": { attack: 0.10, movement: 0.05 },
    "Aasimar": { magic: 0.10, heal: 0.05 },
    "Triton": { movement: -0.10, water_magic: 0.10 },
    "Goliath": { attack: 0.10, defense: 0.10 },
    "Firbolg": { heal: 0.05, nature_magic: 0.10 },
    "Kenku": { movement: -0.15, cast: 0.10 }
  };
  
  const traits = racialTraits[race] || {};
  
  // Check for specific action type modifier
  if (traits[actionType] !== undefined) {
    return traits[actionType];
  }
  
  // Check for category modifier
  if (actionType === "movement" && traits.movement !== undefined) {
    return traits.movement;
  }
  if (actionType === "attack" && traits.attack !== undefined) {
    return traits.attack;
  }
  if (actionType === "skill" && (traits.magic !== undefined || traits.cast !== undefined)) {
    return traits.magic || traits.cast || 0;
  }
  if (actionType === "item" && traits.item !== undefined) {
    return traits.item;
  }
  
  // Apply universal modifier if exists
  return traits.all || 0;
}

function getAffixModifier(equipment, actionType) {
  let totalModifier = 0;
  
  for (const item of equipment) {
    if (!item.affixes) continue;
    
    for (const affix of item.affixes) {
      const affixModifiers = {
        "Swift": { all: -0.15 },
        "Quick Strike": { attack: -0.20 },
        "Fleet Footed": { movement: -0.25 },
        "Haste": { cast: -0.10 },
        "Rapid Hands": { item: -0.20 },
        "Arcane Haste": { magic: -0.15 },
        "Battle Ready": { attack: -0.10 }
      };
      
      const modifiers = affixModifiers[affix.name];
      if (modifiers) {
        if (modifiers[actionType] !== undefined) {
          totalModifier += modifiers[actionType];
        } else if (modifiers.all !== undefined) {
          totalModifier += modifiers.all;
        }
      }
    }
  }
  
  return totalModifier;
}

function getPassiveModifier(skills, actionType) {
  let totalModifier = 0;
  
  for (const skill of skills) {
    if (!skill.passives) continue;
    
    for (const passive of skill.passives) {
      const passiveModifiers = {
        "Quick Hands": { item: -0.20 },
        "Swift Caster": { cast: -0.15 },
        "Agile Fighter": { attack: -0.10, movement: -0.10 },
        "Lightning Reflexes": { all: -0.15 },
        "Battle Hardened": { attack: -0.10 },
        "Arcane Mastery": { magic: -0.15 }
      };
      
      const modifiers = passiveModifiers[passive.name];
      if (modifiers) {
        if (modifiers[actionType] !== undefined) {
          totalModifier += modifiers[actionType];
        } else if (modifiers.all !== undefined) {
          totalModifier += modifiers.all;
        }
      }
    }
  }
  
  return totalModifier;
}

// Examples:
// Movement: DEX 60 (30%), Elf (-15%), Swift boots (-25%)
// → 100 × (1 - (0.30 + 0.15 + 0.25)) = 100 × 0.30 = 30 tick

// Attack: DEX 60 (30%), Human (+5%), Quick Strike sword (-20%)
// → 100 × (1 - (0.30 - 0.05 + 0.20)) = 100 × 0.55 = 55 tick

// Magic: DEX 60 (30%), Elf (+10%), Arcane Haste staff (-15%)
// → 100 × (1 - (0.30 - 0.10 + 0.15)) = 100 × 0.65 = 65 tick
```

### 2. Action Scheduling

```javascript
function scheduleAction(unit, actionType, data) {
  // Calculate tick cost using universal base tick 100
  const finalCost = calculateTickCost(unit, actionType);
  
  // Calculate next action tick
  const nextActionTick = Math.max(unit.currentTick, battle.currentTick) + finalCost;
  
  // Create action object
  const action = {
    id: generateActionId(),
    unitId: unit.id,
    type: actionType,
    targetTick: nextActionTick,
    data: data,
    tickCost: finalCost // Store for debugging/replay
  };
  
  // Add to unit's action queue
  unit.actionQueue.push(action);
  unit.currentTick = nextActionTick;
  
  return action;
}

// Example usage:
// scheduleAction(hero, "move", { targetPosition: { x: 5, y: 0 } })
// → Returns action with targetTick = currentTick + 30 (if hero has high speed)
```

### 3. Tick Execution Loop

```javascript
function executeBattleTick(battle) {
  const currentTick = battle.currentTick;
  
  // Get all actions scheduled for this tick
  const actionsAtTick = getAllActionsAtTick(battle, currentTick);
  
  // Sort by speed (DEX) for execution order
  actionsAtTick.sort((a, b) => {
    const unitA = getUnit(battle, a.unitId);
    const unitB = getUnit(battle, b.unitId);
    return unitB.stats.dex - unitA.stats.dex; // Higher DEX first
  });
  
  // Execute all actions
  for (const action of actionsAtTick) {
    executeAction(battle, action);
  }
  
  // Apply status effects
  applyStatusEffects(battle, currentTick);
  
  // Update skill cooldowns
  updateCooldowns(battle, currentTick);
  
  // Check win/lose conditions
  checkBattleEnd(battle);
  
  // Log actions for replay
  battle.actionLog.push({
    tick: currentTick,
    actions: actionsAtTick
  });
  
  // Increment tick
  battle.currentTick++;
}
```

### 4. Damage Calculation

```javascript
function calculateDamage(attacker, defender, actionType) {
  const isPhysical = actionType === "attack" || actionType === "skill_physical";
  const isMagical = actionType === "skill_magical";
  
  let attackStat, defenseStat;
  
  if (isPhysical) {
    attackStat = attacker.stats.str;
    defenseStat = defender.stats.def;
  } else if (isMagical) {
    attackStat = attacker.stats.int;
    defenseStat = defender.stats.def; // Or magic defense if implemented
  }
  
  // Base damage formula
  const baseDamage = attackStat * 0.5;
  const defenseReduction = defenseStat * 0.3;
  const rawDamage = Math.max(1, baseDamage - defenseReduction);
  
  // Apply elemental modifiers
  const elementalModifier = calculateElementalModifier(attacker, defender);
  
  // Apply critical hit (deterministic, counter-based)
  const criticalMultiplier = calculateCriticalHit(attacker);
  
  // Final damage
  const finalDamage = Math.round(rawDamage * elementalModifier * criticalMultiplier);
  
  return {
    damage: finalDamage,
    isCritical: criticalMultiplier > 1,
    elementalModifier: elementalModifier
  };
}
```

### 5. AI Decision Making

```javascript
function decideNextAction(unit, battle) {
  const enemies = battle.enemies.filter(e => e.hp > 0);
  const allies = battle.heroes.filter(h => h.hp > 0);
  
  // Priority 1: Attack if in range
  const targetInRange = findTargetInRange(unit, enemies);
  if (targetInRange) {
    return {
      type: "attack",
      data: { targetId: targetInRange.id }
    };
  }
  
  // Priority 2: Move towards nearest enemy
  const nearestEnemy = findNearestEnemy(unit, enemies);
  if (nearestEnemy) {
    const movePosition = calculateMovePosition(unit, nearestEnemy);
    return {
      type: "move",
      data: { targetPosition: movePosition }
    };
  }
  
  // Priority 3: Use skill if available
  const availableSkill = findAvailableSkill(unit);
  if (availableSkill) {
    return {
      type: "skill",
      data: { skillId: availableSkill.id, targetId: nearestEnemy?.id }
    };
  }
  
  // Default: Attack nearest enemy
  return {
    type: "attack",
    data: { targetId: enemies[0].id }
  };
}
```

---

## Replay System

### Replay Data Structure

```javascript
{
  battleId: "battle_001",
  duration: 5432, // ticks
  
  // Initial state
  initialState: {
    heroes: [ /* hero initial states */ ],
    enemies: [ /* enemy initial states */ ]
  },
  
  // Action log (compressed)
  actionLog: [
    {
      tick: 100,
      actions: [
        { unitId: "unit_001", type: "move", to: { x: 5, y: 0 } },
        { unitId: "unit_002", type: "attack", target: "enemy_001", damage: 25 }
      ]
    }
  ],
  
  // Final state
  finalState: {
    heroes: [ /* hero final states */ ],
    enemies: [ /* enemy final states */ ],
    winner: "heroes"
  }
}
```

### Replay Compression

- **Delta Encoding**: Only store changes, not full state
- **Action Batching**: Group actions by tick
- **Binary Format**: Use compact binary representation for transmission
- **Estimated Size**: ~10-50 KB per battle (depending on duration)

---

## Modifier Stacking Rules

### Stacking Order

Modifiers diaplikasikan dalam urutan berikut:

1. **DEX Stat Bonus** (base foundation)
2. **Racial Trait Modifier** (inherent characteristic)
3. **Item Affix Modifiers** (equipment bonuses)
4. **Skill Passive Modifiers** (learned abilities)

### Stacking Behavior

- **Additive**: Semua modifier dijumlahkan
- **No Diminishing Returns**: Tidak ada diminishing returns
- **Hard Cap**: Total modifier dibatasi max 60% reduction (min 40 tick)
- **Negative Modifiers**: Beberapa race/trait memberikan penalty (+ tick cost)

### Example Calculation

```
Unit: DEX 60, Elf, Swift Boots, Quick Hands Passive

Action: Movement

1. DEX Bonus: 60 × 0.5% = +30% speed
2. Racial (Elf): -15% movement (penalty)
3. Affix (Swift Boots): -15% all actions
4. Passive (Quick Hands): 0% (doesn't apply to movement)

Total Modifier = 30% - 15% - 15% = 0%
Final Tick Cost = 100 × (1 - 0) = 100 tick
```

### Edge Cases

#### Case 1: Over-Capping
```
DEX 120 (60%) + Swift (-15%) + Lightning Reflexes (-15%)
Total = 90% → Capped at 60%
Final = 40 tick (minimum)
```

#### Case 2: Negative Total
```
DEX 10 (5%) + Orc (+10% attack penalty)
Total = -5% (slower than base)
Final = 100 × (1 - (-0.05)) = 105 tick
```

#### Case 3: Mixed Modifiers
```
DEX 50 (25%) + Elf (-15% movement, +10% magic)

Movement: 25% - 15% = 10% → 90 tick
Magic: 25% + 10% = 35% → 65 tick
```

### Balance Implications

1. **Build Diversity**: Banyak kombinasi build yang mungkin
2. **Trade-offs**: Race yang bagus untuk satu action mungkin buruk untuk lainnya
3. **Progression**: DEX scaling linear, tidak exponential
4. **Item Value**: Affixes memberikan impact yang signifikan
5. **Skill Synergy**: Passives dapat mengkompensasi kelemahan race

---

## Balance Considerations

### Tick Cost Balance (Universal Base Tick 100)

| Action | Base | DEX 40 Only | DEX 80 Only | DEX 60 + Elf + Swift |
|--------|------|-------------|-------------|---------------------|
| Movement | 100 | 80 | 60 | 30 |
| Attack | 100 | 80 | 60 | 70 |
| Magic | 100 | 80 | 60 | 80 |
| Item Use | 100 | 80 | 60 | 50 |

### Speed Scaling

- **DEX 1-20**: 0-10% speed bonus
- **DEX 21-50**: 10-25% speed bonus
- **DEX 51-100**: 25-40% speed bonus
- **DEX 101-200**: 40-50% speed bonus
- **Max Reduction**: 60% (hard cap, min 40 tick)

### Build Diversity Examples

#### Build A: Speed Demon (DEX-focused)
- DEX 100 → 50% speed
- Halfling race → -20% movement
- Swift armor → -15% all
- Lightning Reflexes → -15% all
- **Total**: 100% (capped at 60%)
- **Result**: All actions = 40 tick

#### Build B: Tactical Mage (INT-focused)
- DEX 40 → 20% speed
- Elf race → +10% magic, -15% movement
- Arcane Haste staff → -15% magic
- Arcane Mastery → -15% magic
- **Magic**: 20% - 10% + 15% + 15% = 40% → 60 tick
- **Movement**: 20% + 15% = 35% → 65 tick
- **Attack**: 20% → 80 tick

#### Build C: Tanky Fighter (STR/DEF-focused)
- DEX 30 → 15% speed
- Goliath race → +10% attack, +10% defense
- Battle Ready armor → -10% attack
- Battle Hardened → -10% attack
- **Attack**: 15% + 10% - 10% - 10% = 5% → 95 tick
- **Defense**: 15% + 10% = 25% → 75 tick
- **Movement**: 15% → 85 tick

### Battle Duration Estimation

- **Short Battle**: ~1,000-2,000 ticks (1-2 heroes vs 1-2 enemies)
- **Medium Battle**: ~3,000-5,000 ticks (5-10 heroes vs 5-10 enemies)
- **Long Battle**: ~7,000-10,000 ticks (20-50 heroes vs 20-50 enemies)

---

## Implementation Phases

### Phase 1: Core Engine
- [ ] Tick Manager
- [ ] Action Queue System
- [ ] Basic Action Executor (move, attack)
- [ ] Simple AI (attack nearest)

### Phase 2: Combat Mechanics
- [ ] Damage Calculator
- [ ] Status Effect Manager
- [ ] Skill System
- [ ] Cooldown System

### Phase 3: Advanced Features
- [ ] Elemental System
- [ ] Weather System
- [ ] Advanced AI
- [ ] Replay Generator

### Phase 4: Optimization
- [ ] Action batching
- [ ] Replay compression
- [ ] Performance profiling
- [ ] Balance tuning

---

## Next Steps

1. Review and approve this design
2. Create detailed technical specification
3. Implement Phase 1 (Core Engine)
4. Test with simple scenarios
5. Iterate based on feedback