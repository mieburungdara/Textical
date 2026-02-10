# Hero UI Enhancement Plan

## Overview
- **Goal:** Transform HeroProfileScreen dari simple list menjadi attractive split-panel UI dengan hero grid dan detail panel
- **User Requirements:**
  - Hero grid dengan gambar/icons untuk setiap hero
  - Rarity color coding (Common, Rare, Epic, Legendary)
  - Split panels: Kiri=Grid, Kanan=Detail Profile
  - Click hero untuk show detail + equipment modification

## UI Structure

```
┌─────────────────────┬──────────────────────┐
│   HERO GRID        │   HERO DETAIL        │
│  ┌───┐ ┌───┐ ┌───┐│  ┌─────────────────┐ │
│  │ H │ │ H │ │ H ││  │    PORTRAIT     │ │
│  │ 1 │ │ 2 │ │ 3 ││  │   (Large)      │ │
│  └───┘ └───┘ └───┘│  └─────────────────┘ │
│  ┌───┐ ┌───┐      │  ┌─────────────────┐ │
│  │ H │ │ H │      │  │  NAME (Level)   │ │
│  │ 4 │ │ 5 │      │  │  Rarity Color   │ │
│  └───┘ └───┘      │  └─────────────────┘ │
│                     │  ┌─────────────────┐ │
│                     │  │   STATS GRID    │ │
│                     │  │ HP | MP | ATK   │ │
│                     │  │ DEF | MAG | SPD │ │
│                     │  └─────────────────┘ │
│                     │  ┌─────────────────┐ │
│                     │  │  EQUIPMENT      │ │
│                     │  │ [W] [A] [R]    │ │
│                     │  │ [N] [A]        │ │
│                     │  └─────────────────┘ │
└─────────────────────┴──────────────────────┘
```

## Data Requirements

### Hero Grid Card
- `hero.id` - hero ID
- `hero.name` - display name
- `hero.rarity` - Common/Rare/Epic/Legendary
- `hero.class` - Warrior/Mage/Archer
- `hero.level` - current level
- `hero.portrait` - emoji/icon based on class
- `hero.hp` / `hero.maxHp` - HP bar
- `hero.totalStats` - stats data

### Detail Panel
- Hero portrait (large)
- Name + Level + Class
- Stats breakdown
- Elemental affinities (fire, water, earth, wind, light, dark)
- Equipment slots (Weapon, Armor, Ring, Necklace, Accessory)
- Active traits
- Set bonuses

## Rarity Colors (from InventoryScreen reference)
```gdscript
func _get_rarity_color(rarity) -> Color:
    match rarity:
        "COMMON": return Color(0.4, 0.6, 0.8)      # Abu-biru
        "RARE": return Color(1.0, 0.8, 0.2)        # Gold/Kuning
        "EPIC": return Color(0.8, 0.4, 1.0)        # Purple
        "LEGENDARY": return Color(1.0, 0.4, 0.2)    # Orange/Red
```

## Checklist

### Phase 1: Scene Structure (HeroProfileScreen.tscn)
- [ ] Create split HBoxContainer layout
- [ ] Left Panel: ScrollContainer with GridContainer
- [ ] Right Panel: VBoxContainer for details
- [ ] Add background gradient panel
- [ ] Add styling constants for cards and borders

### Phase 2: Hero Grid (Left Panel)
- [ ] Create HeroGridItem scene/template
- [ ] Implement `_create_hero_grid()` method
- [ ] Add rarity border color to cards
- [ ] Add hover animations (scale + glow)
- [ ] Add click selection handler
- [ ] Connect to `GameState.current_heroes` data

### Phase 3: Detail Panel (Right Panel)
- [ ] Hero portrait section with class emoji
- [ ] Name + Level + Class display
- [ ] Rarity indicator with color
- [ ] Stats grid (HP, MP, Attack, Defense, Magic, Speed)
- [ ] Progress bars for stats

### Phase 4: Equipment Section
- [ ] Equipment slot grid
- [ ] 5 slots: Weapon, Armor, Ring, Necklace, Accessory
- [ ] Empty state with "+" button
- [ ] Equipped item display with rarity border
- [ ] Click to unequip or open inventory

### Phase 5: Elemental & Traits
- [ ] Elemental affinity icons with values
- [ ] Active traits list
- [ ] Set bonuses indicator

### Phase 6: Integration
- [ ] Connect signals between grid and detail panel
- [ ] Update detail panel on hero selection
- [ ] Handle empty state (no heroes)
- [ ] Add animation transitions

## Files to Modify
1. `client/src/ui/HeroProfileScreen.tscn` - Complete redesign
2. `client/src/ui/HeroProfileScreen.gd` - Add grid logic, selection handler

## Files to Create
1. `client/src/ui/HeroGridItem.tscn` - Reusable hero card template

## Testing
- [ ] Verify grid displays all heroes from GameState
- [ ] Verify click selection updates detail panel
- [ ] Verify rarity colors render correctly
- [ ] Verify equipment slots show equipped items
- [ ] Verify empty states handled
