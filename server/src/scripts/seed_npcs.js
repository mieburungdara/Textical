const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL NPC POPULATION ---");

  const npcs = [
    // --- JOB CHANGERS (IDs 1-5) ---
    { 
        id: 1, name: "Grandmaster Kaelen", title: "Master of Disciplines", type: "JOB_CHANGER",
        description: "An ancient warrior who knows the secrets of every combat path.",
        metadata: { allowedPromotions: [1101, 1102, 1103, 1104, 1105, 1106] } 
    },

    // --- QUEST GIVERS (IDs 6-10) ---
    { 
        id: 6, name: "Elder Thorne", title: "Village Patriarch", type: "QUEST_GIVER",
        description: "A wise leader with many tasks for willing adventurers.",
        metadata: { questIds: [1, 2, 3] }
    },

    // --- RARE TRADERS (IDs 11-15) ---
    { 
        id: 11, name: "Zev the Wandering", title: "Merchant of Shadows", type: "TRADER",
        description: "A mysterious figure selling items you won't find anywhere else.",
        metadata: { isWanderer: true, rarityTier: "LEGENDARY" }
    },

    // --- UTILITY NPCs ---
    { 
        id: 16, name: "Sister Maria", title: "Caretaker of Souls", type: "HEALER",
        description: "Her touch can mend the deepest wounds.",
        metadata: { healCost: 50 }
    },
    { 
        id: 17, name: "Master Dorn", title: "Guild Smith", type: "TRADER",
        description: "Expert in materials and weapon maintenance.",
        metadata: { shopType: "MATERIALS" }
    }
  ];

  // 1. Seed Templates
  for (const n of npcs) {
    const data = {
        ...n,
        metadata: JSON.stringify(n.metadata)
    };
    await prisma.nPCTemplate.upsert({
      where: { id: n.id },
      update: data,
      create: data
    });
  }

  // 2. Map NPC Shop Items (Zev's Rare Stash)
  await prisma.nPCShopItem.deleteMany({ where: { npcId: 11 } });
  const zevItems = [
    { npcId: 11, itemId: 4425, priceGold: 50000, stock: 1 }, // Elixir of the Gods
    { npcId: 11, itemId: 7005, priceGold: 75000, stock: 1 }, // Adamantite World-Breaker
    { npcId: 11, itemId: 4225, priceGold: 30000, stock: 5 }  // World-Tree Ambrosia
  ];

  for (const item of zevItems) {
    await prisma.nPCShopItem.create({
        data: item
    });
  }

  // 3. Map NPCs to Regions
  const regionMappings = [
    { regionId: 1, npcId: 1 }, // Kaelen in Region 1
    { regionId: 1, npcId: 6 }, // Thorne in Region 1
    { regionId: 1, npcId: 16 }, // Maria in Region 1
    { regionId: 1, npcId: 17 }, // Dorn in Region 1
  ];

  for (const rm of regionMappings) {
    await prisma.regionNPC.upsert({
        where: { regionId_npcId: { regionId: rm.regionId, npcId: rm.npcId } },
        update: {},
        create: { regionId: rm.regionId, npcId: rm.npcId, spawnChance: 1.0 }
    });
  }

  console.log("✅ NPC Population Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });