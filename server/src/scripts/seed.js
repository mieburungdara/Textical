const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- FINAL ABSOLUTE SATURATION (VERIFIED) ---");

  // 1. SYSTEM
  await prisma.premiumTierTemplate.upsert({ where: { id: 5 }, update: {}, create: { id: 5, name: "DIAMOND", queueSlots: 10, speedBonus: 0.3, vitalityRegenMult: 2.0, maxVitalityBonus: 200 } });

  // 2. WORLD
  await prisma.regionTemplate.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: "Oakhaven", description: "T", type: "TOWN" } });
  await prisma.regionTemplate.upsert({ where: { id: 2 }, update: {}, create: { id: 2, name: "Woods", description: "W", type: "WILDERNESS" } });
  await prisma.regionConnection.create({ data: { originRegionId: 1, targetRegionId: 2, travelTimeSeconds: 15 } });

  // 3. TRAITS & ITEMS
  await prisma.traitTemplate.upsert({ where: { id: 3001 }, update: {}, create: { id: 3001, name: "Fire", description: "F", category: "C" } });
  await prisma.itemTemplate.upsert({ where: { id: 2001 }, update: {}, create: { id: 2001, name: "Sword", description: "D", category: "EQUIPMENT" } });
  await prisma.itemTemplate.upsert({ where: { id: 2005 }, update: {}, create: { id: 2005, name: "Ingot", description: "M", category: "MATERIAL" } });
  
  await prisma.itemTrait.create({ data: { itemId: 2001, traitId: 3001 } });
  await prisma.itemEquipSlot.create({ data: { itemId: 2001, slotKey: "MAIN" } });
  await prisma.itemStat.create({ data: { itemId: 2001, statKey: "ATK", statValue: 10 } });

  // 4. MONSTERS
  const cat = await prisma.monsterCategory.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: "Beasts" } });
  await prisma.monsterTemplate.upsert({
    where: { id: 6001 },
    update: {},
    create: { id: 6001, name: "Slime", categoryId: 1, hp_base: 50, damage_base: 5 }
  });
  await prisma.monsterLootEntry.create({ data: { monsterId: 6001, itemId: 2005, chance: 1.0 } });

  // 5. CLASSES
  await prisma.classTemplate.upsert({ where: { id: 1001 }, update: {}, create: { id: 1001, name: "Novice" } });
  await prisma.jobTemplate.upsert({ where: { id: 5001 }, update: {}, create: { id: 5001, name: "Miner" } });

  // 6. GUILD
  await prisma.guildTemplate.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: "T" } });
  const guild = await prisma.guild.create({ data: { name: "First Legion", templateId: 1 } });

  // 7. USER
  const user = await prisma.user.upsert({ where: { username: "player1" }, update: {}, create: { username: "player1", password: "p", premiumTierId: 5, gold: 0, guildId: guild.id } });
  await prisma.transactionLedger.create({ data: { userId: user.id, type: "I", currencyTier: "G", amountDelta: 0, newBalance: 0 } });

  // 8. QUEST
  const quest = await prisma.questTemplate.upsert({ where: { id: 4001 }, update: {}, create: { id: 4001, name: "Q", description: "D" } });
  const qObj = await prisma.questObjective.create({ data: { questId: 4001, type: "K", targetId: 1, description: "D" } });
  await prisma.userQuest.create({ data: { userId: user.id, questId: 4001 } });

  // 9. HERO & FORMATION
  const hero = await prisma.hero.create({ data: { userId: user.id, name: "Arthur", classId: 1001 } });
  const preset = await prisma.formationPreset.create({ data: { userId: user.id, name: "P" } });
  await prisma.formationSlot.create({ data: { presetId: preset.id, heroId: hero.id, gridX: 1, gridY: 1 } });

  // 10. TASK
  await prisma.taskQueue.create({ data: { userId: user.id, type: "G", status: "P" } });

  console.log("--- 100% SATURATION SUCCESSFUL ---");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });
