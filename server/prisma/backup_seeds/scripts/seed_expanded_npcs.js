const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING EXPANDED TEXTICAL NPC POPULATION ---");

  const npcs = [
    // --- GAMBLERS (IDs 21-23) ---
    { 
        id: 21, name: "Gorton the Bold", title: "High-Stakes Gambler", type: "GAMBLER",
        description: "Double your gold or lose it all. Fortune favors the brave!",
        metadata: { minBet: 100, maxBet: 10000, winMultiplier: 2.0, winChance: 0.45 } 
    },
    { 
        id: 22, name: "Lucky Lennie", title: "Street Hustler", type: "GAMBLER",
        description: "A simple game of cups. Easy gold, if you're quick enough.",
        metadata: { minBet: 10, maxBet: 500, winMultiplier: 3.0, winChance: 0.3 } 
    },

    // --- TELEPORTERS (IDs 24-26) ---
    { 
        id: 24, name: "Zephyr", title: "Rift-Walker", type: "TELEPORTER",
        description: "I can bend space to my will. Where do you wish to go?",
        metadata: { destinationRegions: [1, 2, 3, 4, 5], costPerTravel: 200 }
    },
    { 
        id: 25, name: "Mystic Orym", title: "Circle Guardian", type: "TELEPORTER",
        description: "Ancient leylines connect this world. I am but a guide.",
        metadata: { destinationRegions: [1, 10, 15], costPerTravel: 500 }
    },

    // --- BUFFERS (IDs 27-29) ---
    { 
        id: 27, name: "Priestess Elara", title: "Light-Bearer", type: "BUFFER",
        description: "May the sun's grace strengthen your resolve.",
        metadata: { buffName: "Sun's Grace", statKey: "vit", statValue: 10, durationSeconds: 1800, costGold: 300 }
    },
    { 
        id: 28, name: "Old Man Hobb", title: "Herbalist Sage", type: "BUFFER",
        description: "A sniff of this root will sharpen your eyes, lad.",
        metadata: { buffName: "Root Focus", statKey: "dex", statValue: 15, durationSeconds: 1200, costGold: 450 }
    },

    // --- UPGRADERS (IDs 30-32) ---
    { 
        id: 30, name: "Borin Anvil-Hand", title: "Legendary Smith", type: "UPGRADER",
        description: "Your blade is dull. Let me show you what real steel feels like.",
        metadata: { upgradeSuccessChance: 0.6, upgradeCostGold: 2000, upgradeStatBonus: 5 }
    },

    // --- LORE TELLERS / COLLECTORS (IDs 33-35) ---
    { 
        id: 33, name: "Collector Silas", title: "Antique Enthusiast", type: "COLLECTOR",
        description: "I pay premium gold for items with... historical significance.",
        metadata: { targetCategory: "WEAPON", priceMultiplier: 1.5 }
    },
    { 
        id: 34, name: "Chronicler Varis", title: "Keeper of Records", type: "LORE_TELLER",
        description: "The history of Textical is written in blood and magic.",
        metadata: { stories: ["The Fall of Eldoria", "The Dragon Wars"] }
    },

    // --- WILDERNESS SURVIVALISTS (IDs 36-40) ---
    { 
        id: 36, name: "Tracker Kael", title: "Survival Specialist", type: "QUEST_GIVER",
        description: "The forest is changing. We need eyes everywhere.",
        metadata: { questIds: [4, 5] }
    },
    { 
        id: 37, name: "Hermit Willow", title: "Forest Speaker", type: "HEALER",
        description: "Nature provides for those who respect it.",
        metadata: { healCost: 0, healRequirement: "ITEM_2801" } // Heal for a Green Herb
    }
  ];

  for (const n of npcs) {
    const { metadata, ...npcData } = n;
    await prisma.nPCTemplate.upsert({
      where: { id: n.id },
      update: npcData,
      create: npcData
    });
  }

  console.log(`✅ ${npcs.length} New Unique NPCs Seeded.`);
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
