# Foreign Key Constraint Issues Report

## Summary
Found **13 models** with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction

### 7. SetBonusCondition - missing relation for bonusId
- **Location**: `server/prisma/schema.prisma:1680`
- **Field**: `bonusId Int`
- **Expected**: Should have `@relation` to `EquipmentSetBonus`

### 8. HeroEquipmentSet - missing relations
- **Location**: `server/prisma/schema.prisma:1688-1690`
- **Fields**:
  - `setId Int` - missing `@relation` to EquipmentSetTemplate
  - `activeBonusId Int?` - missing `@relation` to EquipmentSetBonus

### 9. RegionalDailyTask - missing relation for targetId
- **Location**: `server/prisma/schema.prisma:443`
- **Field**: `targetId Int`
- **Expected**: Context-dependent relation

### 10. QuestObjective - missing relation for targetId
- **Location**: `server/prisma/schema.prisma:1228`
- **Field**: `targetId Int`
- **Expected**: Context-dependent relation

### 11. LoginAttempt - missing relation for userId
- **Location**: `server/prisma/schema.prisma:1988`
- **Field**: `userId Int?`
- **Expected**: Should have `@relation` to `User`

### 12. Wagon - missing relations
- **Location**: `server/prisma/schema.prisma:1556-1557`
- **Fields**:
  - `originRegionId Int?` - missing `@relation` to RegionTemplate
  - `targetRegionId Int?` - missing `@relation` to RegionTemplate

### 13. NPCEventReaction - missing relation for overrideDialogueId
- **Location**: `server/prisma/schema.prisma:734`
- **Field**: `overrideDialogueId Int?`
- **Expected**: Should have `@relation` to `DialogueNode`

---

## Impact
- No referential integrity enforcement at database level
- No cascading deletes
- Prisma cannot properly navigate these relations in queries
- Potential for orphaned records

## Summary
Found **13 models** with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction

### 7. SetBonusCondition - missing relation for bonusId
- **Location**: `server/prisma/schema.prisma:1680`
- **Field**: `bonusId Int`
- **Expected**: Should have `@relation` to `EquipmentSetBonus`

### 8. HeroEquipmentSet - missing relations
- **Location**: `server/prisma/schema.prisma:1688-1690`
- **Fields**:
  - `setId Int` - missing `@relation` to EquipmentSetTemplate
  - `activeBonusId Int?` - missing `@relation` to EquipmentSetBonus

### 9. RegionalDailyTask - missing relation for targetId
- **Location**: `server/prisma/schema.prisma:443`
- **Field**: `targetId Int`
- **Expected**: Context-dependent relation

### 10. QuestObjective - missing relation for targetId
- **Location**: `server/prisma/schema.prisma:1228`
- **Field**: `targetId Int`
- **Expected**: Context-dependent relation

### 11. LoginAttempt - missing relation for userId
- **Location**: `server/prisma/schema.prisma:1988`
- **Field**: `userId Int?`
- **Expected**: Should have `@relation` to `User`

### 12. Wagon - missing relations
- **Location**: `server/prisma/schema.prisma:1556-1557`
- **Fields**:
  - `originRegionId Int?` - missing `@relation` to RegionTemplate
  - `targetRegionId Int?` - missing `@relation` to RegionTemplate

### 13. NPCEventReaction - missing relation for overrideDialogueId
- **Location**: `server/prisma/schema.prisma:734`
- **Field**: `overrideDialogueId Int?`
- **Expected**: Should have `@relation` to `DialogueNode`

---

## Impact
- No referential integrity enforcement at database level
- No cascading deletes
- Prisma cannot properly navigate these relations in queries
- Potential for orphaned records

- **Issue**: Foreign key exists but no relation defined

---

## Impact
These missing relations mean:
- No referential integrity enforcement at database level
- No cascading deletes
- Prisma cannot properly navigate these relations in queries
- Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field.

## Summary
Found **12 models** with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode
- **Issue**: Multiple foreign keys without relations

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

### 7. SetBonusCondition - missing relation for bonusId
- **Location**: `server/prisma/schema.prisma:1680`
- **Field**: `bonusId Int`
- **Expected**: Should have `@relation` to `EquipmentSetBonus`
- **Issue**: Foreign key exists but no relation defined

### 8. HeroEquipmentSet - missing relations
- **Location**: `server/prisma/schema.prisma:1688-1690`
- **Fields**:
  - `setId Int` - missing `@relation` to EquipmentSetTemplate
  - `activeBonusId Int?` - missing `@relation` to EquipmentSetBonus
- **Issue**: Two foreign keys without relations

### 9. RegionalDailyTask - missing relation for targetId
- **Location**: `server/prisma/schema.prisma:443`
- **Field**: `targetId Int`
- **Expected**: Should have `@relation` (context-dependent, possibly MonsterTemplate or ItemTemplate)
- **Issue**: Foreign key exists but no relation defined

### 10. QuestObjective - missing relation for targetId
- **Location**: `server/prisma/schema.prisma:1228`
- **Field**: `targetId Int`
- **Expected**: Should have `@relation` (context-dependent, possibly MonsterTemplate or RegionTemplate)
- **Issue**: Foreign key exists but no relation defined

### 11. LoginAttempt - missing relation for userId
- **Location**: `server/prisma/schema.prisma:1988`
- **Field**: `userId Int?`
- **Expected**: Should have `@relation` to `User`
- **Issue**: Foreign key exists but no relation defined

### 12. Wagon - missing relations
- **Location**: `server/prisma/schema.prisma:1556-1557`
- **Fields**:
  - `originRegionId Int?` - missing `@relation` to RegionTemplate
  - `targetRegionId Int?` - missing `@relation` to RegionTemplate
- **Issue**: Two foreign keys without relations

---

## Impact
These missing relations mean:
- No referential integrity enforcement at database level
- No cascading deletes
- Prisma cannot properly navigate these relations in queries
- Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field.


### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

---

## Impact
These missing relations mean:
- No referential integrity enforcement at database level
- No cascading deletes
- Prisma cannot properly navigate these relations in queries
- Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field.

```prisma
// RegionTemplate - line 535
requiredAchievementId  Int?              
achievement            AchievementTemplate? @relation(fields: [requiredAchievementId], references: [id])

// TaskQueue - line 1102  
affixMaterialId        Int?              
affixMaterial          ItemTemplate?    @relation(fields: [affixMaterialId], references: [id])

// MonsterEnrage - line 1915
unlockSkillId          Int?              
unlockSkill            SkillTemplate?   @relation(fields: [unlockSkillId], references: [id])

// DialogueChoice - lines 1542-1545
questId                Int?              
quest                  QuestTemplate?   @relation(fields: [questId], references: [id])
reputationFactionId    Int?              
faction                Faction?         @relation(fields: [reputationFactionId], references: [id])
nextNodeId             Int?              
nextNode               DialogueNode?     @relation(fields: [nextNodeId], references: [id])

// HeroBuff - line 1046
itemId                 Int?              
item                   ItemTemplate?     @relation(fields: [itemId], references: [id])

// QuestReward - lines 1238-1240
itemId                 Int?              
item                   ItemTemplate?     @relation(fields: [itemId], references: [id])
factionId              Int?              
faction                Faction?         @relation(fields: [factionId], references: [id])
```

## Summary
Found 6 models with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode
- **Issue**: Multiple foreign keys without relations

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

---

## Impact
- These missing relations mean:
  - No referential integrity enforcement at database level
  - No cascading deletes
  - Prisma cannot properly navigate these relations in queries
  - Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field.


## Summary
Found **6 models** with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode
- **Issue**: Multiple foreign keys without relations

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

---

## Impact
These missing relations mean:
- No referential integrity enforcement at database level
- No cascading deletes
- Prisma cannot properly navigate these relations in queries
- Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field:

```prisma
// RegionTemplate - line 535
requiredAchievementId  Int?              
achievement            AchievementTemplate? @relation(fields: [requiredAchievementId], references: [id])

// TaskQueue - line 1102  
affixMaterialId        Int?              
affixMaterial          ItemTemplate?    @relation(fields: [affixMaterialId], references: [id])

// MonsterEnrage - line 1915
unlockSkillId          Int?              
unlockSkill            SkillTemplate?   @relation(fields: [unlockSkillId], references: [id])

// DialogueChoice - lines 1542-1545
questId                Int?              
quest                  QuestTemplate?   @relation(fields: [questId], references: [id])
reputationFactionId    Int?              
faction                Faction?         @relation(fields: [reputationFactionId], references: [id])
nextNodeId             Int?              
nextNode               DialogueNode?     @relation(fields: [nextNodeId], references: [id])

// HeroBuff - line 1046
itemId                 Int?              
item                   ItemTemplate?     @relation(fields: [itemId], references: [id])

// QuestReward - lines 1238-1240
itemId                 Int?              
item                   ItemTemplate?     @relation(fields: [itemId], references: [id])
factionId              Int?              
faction                Faction?         @relation(fields: [factionId], references: [id])
```

## Summary
Found 6 models with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode
- **Issue**: Multiple foreign keys without relations

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

---

## Impact
- These missing relations mean:
  - No referential integrity enforcement at database level
  - No cascading deletes
  - Prisma cannot properly navigate these relations in queries
  - Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field.



## Summary
Found **13 models** with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode
- **Issue**: Multiple foreign keys without relations

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

### 7. SetBonusCondition - missing relation for bonusId
- **Location**: `server/prisma/schema.prisma:1680`
- **Field**: `bonusId Int`
- **Expected**: Should have `@relation` to `EquipmentSetBonus`
- **Issue**: Foreign key exists but no relation defined

### 8. HeroEquipmentSet - missing relations
- **Location**: `server/prisma/schema.prisma:1688-1690`
- **Fields**:
  - `setId Int` - missing `@relation` to EquipmentSetTemplate
  - `activeBonusId Int?` - missing `@relation` to EquipmentSetBonus
- **Issue**: Two foreign keys without relations

### 9. RegionalDailyTask - missing relation for targetId
- **Location**: `server/prisma/schema.prisma:443`
- **Field**: `targetId Int`
- **Expected**: Should have `@relation` (context-dependent, possibly MonsterTemplate or ItemTemplate)
- **Issue**: Foreign key exists but no relation defined

### 10. QuestObjective - missing relation for targetId
- **Location**: `server/prisma/schema.prisma:1228`
- **Field**: `targetId Int`
- **Expected**: Should have `@relation` (context-dependent, possibly MonsterTemplate or RegionTemplate)
- **Issue**: Foreign key exists but no relation defined

### 11. LoginAttempt - missing relation for userId
- **Location**: `server/prisma/schema.prisma:1988`
- **Field**: `userId Int?`
- **Expected**: Should have `@relation` to `User`
- **Issue**: Foreign key exists but no relation defined

### 12. Wagon - missing relations
- **Location**: `server/prisma/schema.prisma:1556-1557`
- **Fields**:
  - `originRegionId Int?` - missing `@relation` to RegionTemplate
  - `targetRegionId Int?` - missing `@relation` to RegionTemplate
- **Issue**: Two foreign keys without relations

### 13. NPCEventReaction - missing relation for overrideDialogueId
- **Location**: `server/prisma/schema.prisma:734`
- **Field**: `overrideDialogueId Int?`
- **Expected**: Should have `@relation` to `DialogueNode`
- **Issue**: Foreign key exists but no relation defined

---

## Impact
These missing relations mean:
- No referential integrity enforcement at database level
- No cascading deletes
- Prisma cannot properly navigate these relations in queries
- Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field.

## Summary
Found **12 models** with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode
- **Issue**: Multiple foreign keys without relations

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

### 7. SetBonusCondition - missing relation for bonusId
- **Location**: `server/prisma/schema.prisma:1680`
- **Field**: `bonusId Int`
- **Expected**: Should have `@relation` to `EquipmentSetBonus`
- **Issue**: Foreign key exists but no relation defined

### 8. HeroEquipmentSet - missing relations
- **Location**: `server/prisma/schema.prisma:1688-1690`
- **Fields**:
  - `setId Int` - missing `@relation` to EquipmentSetTemplate
  - `activeBonusId Int?` - missing `@relation` to EquipmentSetBonus
- **Issue**: Two foreign keys without relations

### 9. RegionalDailyTask - missing relation for targetId
- **Location**: `server/prisma/schema.prisma:443`
- **Field**: `targetId Int`
- **Expected**: Should have `@relation` (context-dependent, possibly MonsterTemplate or ItemTemplate)
- **Issue**: Foreign key exists but no relation defined

### 10. QuestObjective - missing relation for targetId
- **Location**: `server/prisma/schema.prisma:1228`
- **Field**: `targetId Int`
- **Expected**: Should have `@relation` (context-dependent, possibly MonsterTemplate or RegionTemplate)
- **Issue**: Foreign key exists but no relation defined

### 11. LoginAttempt - missing relation for userId
- **Location**: `server/prisma/schema.prisma:1988`
- **Field**: `userId Int?`
- **Expected**: Should have `@relation` to `User`
- **Issue**: Foreign key exists but no relation defined

### 12. Wagon - missing relations
- **Location**: `server/prisma/schema.prisma:1556-1557`
- **Fields**:
  - `originRegionId Int?` - missing `@relation` to RegionTemplate
  - `targetRegionId Int?` - missing `@relation` to RegionTemplate
- **Issue**: Two foreign keys without relations

---

## Impact
These missing relations mean:
- No referential integrity enforcement at database level
- No cascading deletes
- Prisma cannot properly navigate these relations in queries
- Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field.


### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

---

## Impact
These missing relations mean:
- No referential integrity enforcement at database level
- No cascading deletes
- Prisma cannot properly navigate these relations in queries
- Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field.

```prisma
// RegionTemplate - line 535
requiredAchievementId  Int?              
achievement            AchievementTemplate? @relation(fields: [requiredAchievementId], references: [id])

// TaskQueue - line 1102  
affixMaterialId        Int?              
affixMaterial          ItemTemplate?    @relation(fields: [affixMaterialId], references: [id])

// MonsterEnrage - line 1915
unlockSkillId          Int?              
unlockSkill            SkillTemplate?   @relation(fields: [unlockSkillId], references: [id])

// DialogueChoice - lines 1542-1545
questId                Int?              
quest                  QuestTemplate?   @relation(fields: [questId], references: [id])
reputationFactionId    Int?              
faction                Faction?         @relation(fields: [reputationFactionId], references: [id])
nextNodeId             Int?              
nextNode               DialogueNode?     @relation(fields: [nextNodeId], references: [id])

// HeroBuff - line 1046
itemId                 Int?              
item                   ItemTemplate?     @relation(fields: [itemId], references: [id])

// QuestReward - lines 1238-1240
itemId                 Int?              
item                   ItemTemplate?     @relation(fields: [itemId], references: [id])
factionId              Int?              
faction                Faction?         @relation(fields: [factionId], references: [id])
```

## Summary
Found 6 models with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode
- **Issue**: Multiple foreign keys without relations

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

---

## Impact
- These missing relations mean:
  - No referential integrity enforcement at database level
  - No cascading deletes
  - Prisma cannot properly navigate these relations in queries
  - Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field.


## Summary
Found **6 models** with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode
- **Issue**: Multiple foreign keys without relations

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

---

## Impact
These missing relations mean:
- No referential integrity enforcement at database level
- No cascading deletes
- Prisma cannot properly navigate these relations in queries
- Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field:

```prisma
// RegionTemplate - line 535
requiredAchievementId  Int?              
achievement            AchievementTemplate? @relation(fields: [requiredAchievementId], references: [id])

// TaskQueue - line 1102  
affixMaterialId        Int?              
affixMaterial          ItemTemplate?    @relation(fields: [affixMaterialId], references: [id])

// MonsterEnrage - line 1915
unlockSkillId          Int?              
unlockSkill            SkillTemplate?   @relation(fields: [unlockSkillId], references: [id])

// DialogueChoice - lines 1542-1545
questId                Int?              
quest                  QuestTemplate?   @relation(fields: [questId], references: [id])
reputationFactionId    Int?              
faction                Faction?         @relation(fields: [reputationFactionId], references: [id])
nextNodeId             Int?              
nextNode               DialogueNode?     @relation(fields: [nextNodeId], references: [id])

// HeroBuff - line 1046
itemId                 Int?              
item                   ItemTemplate?     @relation(fields: [itemId], references: [id])

// QuestReward - lines 1238-1240
itemId                 Int?              
item                   ItemTemplate?     @relation(fields: [itemId], references: [id])
factionId              Int?              
faction                Faction?         @relation(fields: [factionId], references: [id])
```

## Summary
Found 6 models with foreign key constraint issues - fields defined with ID suffix but missing @relation annotations.

---

## Issues Found

### 1. RegionTemplate - missing relation for requiredAchievementId
- **Location**: `server/prisma/schema.prisma:535`
- **Field**: `requiredAchievementId Int?`
- **Expected**: Should have `@relation` to `AchievementTemplate`
- **Issue**: Foreign key exists but no relation defined

### 2. TaskQueue - missing relation for affixMaterialId
- **Location**: `server/prisma/schema.prisma:1102`
- **Field**: `affixMaterialId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 3. MonsterEnrage - missing relation for unlockSkillId
- **Location**: `server/prisma/schema.prisma:1915`
- **Field**: `unlockSkillId Int?`
- **Expected**: Should have `@relation` to `SkillTemplate`
- **Issue**: Foreign key exists but no relation defined

### 4. DialogueChoice - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1542-1545`
- **Fields**:
  - `questId Int?` - missing `@relation` to QuestTemplate
  - `reputationFactionId Int?` - missing `@relation` to Faction
  - `nextNodeId Int?` - missing `@relation` to DialogueNode
- **Issue**: Multiple foreign keys without relations

### 5. HeroBuff - missing relation for itemId
- **Location**: `server/prisma/schema.prisma:1046`
- **Field**: `itemId Int?`
- **Expected**: Should have `@relation` to `ItemTemplate`
- **Issue**: Foreign key exists but no relation defined

### 6. QuestReward - multiple missing relations
- **Location**: `server/prisma/schema.prisma:1238-1240`
- **Fields**:
  - `itemId Int?` - missing `@relation` to ItemTemplate
  - `factionId Int?` - missing `@relation` to Faction
- **Issue**: Multiple foreign keys without relations

---

## Impact
- These missing relations mean:
  - No referential integrity enforcement at database level
  - No cascading deletes
  - Prisma cannot properly navigate these relations in queries
  - Potential for orphaned records

## Recommended Fix
Add @relation annotations to each missing foreign key field.



