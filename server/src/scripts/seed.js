const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- FINAL MEGA CONTENT EXPANSION (DURATIONS FIXED) ---");

  // 0. CLEANUP (Aggressive to avoid FK errors)
  await prisma.taskQueue.deleteMany({});
  await prisma.formationSlot.deleteMany({});
  await prisma.formationPreset.deleteMany({});
  await prisma.tavernMercenary.deleteMany({});
  await prisma.heroEquipment.deleteMany({});
  await prisma.heroTrait.deleteMany({});
  await prisma.hero.deleteMany({});
  await prisma.regionConnection.deleteMany({});
  await prisma.regionResource.deleteMany({});

  // 1. PRE-REQUISITES (Premium & Class)
  console.log("[1/6] Pre-requisites...");
  await prisma.premiumTierTemplate.upsert({ where: { id: 5 }, update: {}, create: { id: 5, name: "DIAMOND", queueSlots: 10, speedBonus: 0.3, vitalityRegenMult: 2.0, maxVitalityBonus: 200 } });
  await prisma.classTemplate.upsert({ where: { id: 1001 }, update: {}, create: { id: 1001, name: "Novice" } });

  // 2. REGIONS & WORLD WEB
  console.log("[2/6] Building World Web (5 Regions)...");
  await prisma.regionTemplate.upsert({ 
    where: { id: 1 }, update: {}, create: { 
      id: 1, name: "Oakhaven Hub", description: "The Town", type: "TOWN",
      metadata: JSON.stringify({
        lore: "Oakhaven was founded 200 years ago by the legendary logger, Silas Elm.",
        tips: ["Tavern recovery is 10x faster than outside.", "Check the Quest Board daily for gold."],
        history: "A peaceful sanctuary untouched by the Dark Grove's corruption."
      })
    } 
  });
  await prisma.regionTemplate.upsert({ 
    where: { id: 2 }, update: {}, create: { 
      id: 2, name: "Iron Mine", description: "Ore Mine", type: "WILDERNESS", dangerLevel: 2,
      metadata: JSON.stringify({
        lore: "Deep beneath the earth lies the vein of Titan's Blood, also known as Iron.",
        tips: ["Gimli gets a gathering bonus in mines.", "Watch out for Cave Spiders in the deep."],
        history: "Abandoned during the Great Gem War, now reclaimed by scavengers."
      })
    } 
  });
  await prisma.regionTemplate.upsert({ 
    where: { id: 3 }, update: {}, create: { 
      id: 3, name: "Crystal Depths", description: "Gems", type: "WILDERNESS", dangerLevel: 5,
      metadata: JSON.stringify({
        lore: "Where light itself crystallizes into Mana.",
        tips: ["Mana Crystals are heavy but valuable.", "Light-trait heroes excel here."],
        history: "The birthplace of the first Wizards."
      })
    } 
  });
  await prisma.regionTemplate.upsert({ 
    where: { id: 4 }, update: {}, create: { 
      id: 4, name: "Elm Forest", description: "Lumber", type: "WILDERNESS", dangerLevel: 3,
      metadata: JSON.stringify({
        lore: "A dense canopy where the trees whisper ancient secrets.",
        tips: ["Fire-trait skills are dangerous but effective here.", "Elm wood is perfect for bows."],
        history: "Formerly the hunting grounds of the Solar Vanguard."
      })
    } 
  });
  await prisma.regionTemplate.upsert({ 
    where: { id: 5 }, update: {}, create: { 
      id: 5, name: "Forbidden Grove", description: "Dark", type: "WILDERNESS", dangerLevel: 8,
      metadata: JSON.stringify({
        lore: "A place where reality itself starts to fray at the edges.",
        tips: ["Never travel here without a full team.", "The darkness drains vitality faster."],
        history: "The epicentre of the corruption that ended the Age of Kings."
      })
    } 
  });

  const connections = [
    { originRegionId: 1, targetRegionId: 2, travelTimeSeconds: 5 }, 
    { originRegionId: 2, targetRegionId: 1, travelTimeSeconds: 5 },
    { originRegionId: 2, targetRegionId: 3, travelTimeSeconds: 5 }, 
    { originRegionId: 3, targetRegionId: 2, travelTimeSeconds: 5 },
    { originRegionId: 1, targetRegionId: 4, travelTimeSeconds: 5 }, 
    { originRegionId: 4, targetRegionId: 1, travelTimeSeconds: 5 },
    { originRegionId: 4, targetRegionId: 5, travelTimeSeconds: 5 }, 
    { originRegionId: 5, targetRegionId: 4, travelTimeSeconds: 5 }
  ];
  for (const conn of connections) {
    await prisma.regionConnection.create({ data: conn });
  }

  // 3. JOBS & SPECIALISTS
  console.log("[3/6] Establishing Specialist Jobs...");
  await prisma.jobTemplate.upsert({ where: { id: 5001 }, update: {}, create: { id: 5001, name: "Miner", category: "COLLECTION" } });
  await prisma.jobTemplate.upsert({ where: { id: 5002 }, update: {}, create: { id: 5002, name: "Woodcutter", category: "COLLECTION" } });

  // 4. ITEMS & RESOURCES
  console.log("[4/6] Seeding Tiered Items & Resources...");
  await prisma.itemTemplate.upsert({ where: { id: 2005 }, update: {}, create: { id: 2005, name: "Iron Ingot", description: "Metal.", category: "MATERIAL", baseValue: 20 } });
  await prisma.itemTemplate.upsert({ where: { id: 2010 }, update: {}, create: { id: 2010, name: "Elm Log", description: "Wood.", category: "MATERIAL", baseValue: 15 } });
  await prisma.itemTemplate.upsert({ where: { id: 2011 }, update: {}, create: { id: 2011, name: "Mana Crystal", description: "Energy.", category: "MATERIAL", baseValue: 100 } });
  
  const resources = [
    { regionId: 2, itemId: 2005, gatherTimeSeconds: 5 },
    { regionId: 3, itemId: 2011, gatherTimeSeconds: 5 },
    { regionId: 4, itemId: 2010, gatherTimeSeconds: 5 }
  ];
  for (const res of resources) {
    await prisma.regionResource.create({ data: res });
  }

  // 5. MONSTERS
  console.log("[5/6] Spawning Monsters...");
  await prisma.monsterCategory.upsert({ where: { id: 1 }, update: {}, create: { id: 1, name: "Beasts" } });
  await prisma.monsterTemplate.upsert({ where: { id: 6001 }, update: {}, create: { id: 6001, name: "Slime", categoryId: 1, hp_base: 50, damage_base: 5 } });
  await prisma.monsterTemplate.upsert({ where: { id: 6002 }, update: {}, create: { id: 6002, name: "Cave Spider", categoryId: 1, hp_base: 150, damage_base: 15 } });

  // 6. USER & TEAM
  console.log("[6/6] Finalizing Player State...");
  const user = await prisma.user.upsert({ where: { username: "player1" }, update: { password: "password123", gold: 1000, currentRegion: 1 }, create: { username: "player1", password: "password123", premiumTierId: 5, gold: 1000, currentRegion: 1 } });
  const arthur = await prisma.hero.create({ data: { userId: user.id, name: "Arthur", classId: 1001 } });
  const gimli = await prisma.hero.create({ data: { userId: user.id, name: "Gimli", classId: 1001, jobId: 5001 } });

  const preset = await prisma.formationPreset.create({ data: { userId: user.id, name: "Frontline" } });
  await prisma.formationSlot.create({ data: { presetId: preset.id, heroId: arthur.id, gridX: 1, gridY: 0 } });
  await prisma.formationSlot.create({ data: { presetId: preset.id, heroId: gimli.id, gridX: 1, gridY: 1 } });

  console.log("--- EXPANSION COMPLETE! ---");
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => { await prisma.$disconnect(); });