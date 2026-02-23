# AoE Expansion Plan - Textical RPG

## Current State
- 5 AoE Patterns: SQUARE, CROSS, LINE, RING, DIAMOND, SECTOR, SPIRAL
- 9 AoE Skills: Fire Breath, Supernova, Gravity Anchor, Chain Overload, Line Storm, Divine Circle, Earthquake, Whirlwind, Mass Shield

## Proposed Advanced AoE Variations

### 1. Advanced Patterns

| Pattern | Description | Use Case |
|---------|-------------|----------|
| **DOUBLE_LINE** | Two parallel lines | Multi-target line attacks |
| **X_SHAPE** | Diagonal cross | Skewer attacks |
| **CHECKERBOARD** | Alternating tiles | Area denial |
| **WAVE** | Expanding arc | Pushback effects |
| **ALL_ALLIES** | All friendly units | Support skills |
| **ALL_ENEMIES** | All hostile units | Ultimate attacks |
| **RANDOM_SPREAD** | Random tiles in radius | Chaos magic |

### 2. Conditional Patterns

| Pattern | Condition | Dynamic Behavior |
|---------|-----------|-----------------|
| **NEAREST_ENEMY** | Auto-targets nearest | AoE centered on target |
| **LINE_OF_SIGHT** | Checks LoS | Damage through obstacles |
| **LOW_HP** | Targets lowest HP | Execute/finisher |
| **HIGH_DENSITY** | Most units | Maximize hits |

### 3. Progressive AoE

| Type | Behavior |
|------|----------|
| **EXPANDING_RINGS** | AoE grows each turn |
| **CHAIN_REACTION** | Jumps to nearby targets |
| **DELAYED_BURST** | Hit after delay |
| **CHARGING** | Gets stronger while channeling |

### 4. Combo/Tiered Skills

| Skill | Pattern | Behavior |
|-------|---------|----------|
| **Thunderstorm** | RING, size=5 | 3 hits, 1 turn apart |
| **Blade Dance** | CIRCLE, size=2 | 5 rapid slashes |
| **Meteor Swarm** | RANDOM_SPREAD | 5 meteors, random spots |
| **Chain Lightning** | NEAREST_ENEMY | Jumps 4 times |

## Implementation Tasks

### Phase 1: Advanced Patterns
- [ ] Add DOUBLE_LINE, X_SHAPE, CHECKERBOARD, WAVE to battleGrid.js
- [ ] Add ALL_ALLIES, ALL_ENEMIES pattern
- [ ] Add conditional targeting system
- [ ] Write tests for all patterns

### Phase 2: New Skills
- [ ] Add 5-10 advanced AoE skills
- [ ] Update seed_skills.js
- [ ] Add class skill tree mappings

### Phase 3: Progressive Effects
- [ ] Implement expanding rings logic
- [ ] Add chain reaction system
- [ ] Create delayed burst mechanics
- [ ] Add channeling system

## Examples

### Example: Double Line Pattern
```
Center (5,5) with DOUBLE_LINE size=2:
  Row 3: 3,4,5,6,7
  Row 7: 3,4,5,6,7
  (skips rows 4,5,6)
```

### Example: Chain Lightning
```
1. Target enemy at (5,5)
2. Find nearest unhit enemy within 4 tiles
3. Jump to new target
4. Repeat 4 times
```