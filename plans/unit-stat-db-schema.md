# Unit Stat System - Database Schema Enhancement

## Overview
Database schema changes untuk mendukung sistem stat yang lebih lengkap.

---

## New Models

### Elemental Type & Affinity
```prisma
model ElementalType {
  id          String   @id // FIRE, WATER, EARTH, WIND, LIGHT, DARK
  name        String
  weaknessTo  String?
  resistOf    String?
  heroes      HeroElementalAffinity[]
}

model HeroElementalAffinity {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  elementTypeId   String
  elementType     ElementalType @relation(fields: [elementTypeId], references: [id])
  resistance      Float    @default(0)
  bonusDamage     Float    @default(0)
  @@unique([heroId, elementTypeId])
}
```

### Equipment Set Bonuses
```prisma
model EquipmentSetTemplate {
  id              Int      @id
  name            String   @unique
  description     String
  setBonuses      EquipmentSetBonus[]
  setItems        EquipmentSetItem[]
}

model EquipmentSetBonus {
  id              Int      @id @default(autoincrement())
  setId           Int
  set             EquipmentSetTemplate @relation(fields: [setId], references: [id])
  requiredPieces  Int
  description     String
  bonusStats      Json
  bonusSkillId    Int?
  @@unique([setId, requiredPieces])
}
```

### Stat Allocation
```prisma
model HeroStatAllocation {
  id              Int      @id @default(autoincrement())
  heroId          Int      @unique
  hero            Hero     @relation(fields: [heroId], references: [id])
  availablePoints Int      @default(0)
  strAllocated    Int      @default(0)
  dexAllocated    Int      @default(0)
  intAllocated    Int      @default(0)
  vitAllocated    Int      @default(0)
  statCaps        Json     @default("{}")
  totalSpent      Int      @default(0)
  lastResetAt     DateTime?
}
```

### Stat History
```prisma
model HeroStatHistory {
  id              Int      @id @default(autoincrement())
  heroId          Int
  hero            Hero     @relation(fields: [heroId], references: [id])
  recordedAt      DateTime @default(now())
  primaryStats    Json
  secondaryStats  Json
  level           Int
  equippedItems   Json
  activeBuffs     Json
  @@index([heroId, recordedAt])
}
```

## Hero Model Updates
```prisma
model Hero {
  // ... existing fields ...
  
  // New primary attributes
  luk             Int      @default(5)
  
  // Elemental damage bases
  fire_damage     Int      @default(0)
  water_damage    Int      @default(0)
  earth_damage    Int      @default(0)
  wind_damage     Int      @default(0)
  light_damage    Int      @default(0)
  dark_damage     Int      @default(0)
  
  // New secondary stat bases
  defense_base    Int      @default(0)
  speed_base      Int      @default(5)
  range_base      Int      @default(1)
  
  // Combat stat bases
  dodge_chance    Float    @default(0.05)
  crit_chance     Float    @default(0.05)
  crit_damage     Float    @default(1.5)
  block_chance    Float    @default(0)
  parry_chance    Float    @default(0)
  
  // Regen bases
  hp_regen        Float    @default(0)
  mana_regen      Float    @default(2)
  
  // New derived stat bases
  accuracy_base   Int      @default(100)
  armor_penetration Int    @default(0)
  skill_power_base Int     @default(10)
  tenacity_base   Float    @default(0)
  block_power_base Float   @default(0.5)
  initiative_base Int      @default(0)
  lifesteal_base  Float    @default(0)
  spell_vamp      Float    @default(0)
  cooldown_reduction Float @default(0)
  move_speed      Float    @default(100)
  attack_speed    Float    @default(1.0)
}
```

## Seed Data
```sql
INSERT INTO ElementalType (id, name, weaknessTo, resistOf) VALUES
('FIRE', 'Fire', 'WATER', 'WIND'),
('WATER', 'Water', 'EARTH', 'FIRE'),
('EARTH', 'Earth', 'WIND', 'WATER'),
('WIND', 'Wind', 'FIRE', 'EARTH'),
('LIGHT', 'Light', 'DARK', 'DARK'),
('DARK', 'Dark', 'LIGHT', 'LIGHT');
```
