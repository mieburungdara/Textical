const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL LEATHER CODEX (v1.0 - 25 UNIQUE HIDES) ---");

  const leathers = [
    // TIER 1: Scavenged (IDs 2601-2605)
    { id: 2601, name: "Ragged Hide", category: "MATERIAL", rarity: "COMMON", baseValue: 5, description: "Basic leather scraps from small animals." },
    { id: 2602, name: "Boar Skin", category: "MATERIAL", rarity: "COMMON", baseValue: 10, description: "Thick and tough skin from wild boars." },
    { id: 2603, name: "Wolf Pelt", category: "MATERIAL", rarity: "COMMON", baseValue: 12, description: "Coarse fur that provides warmth." },
    { id: 2604, name: "Serpent Scale", category: "MATERIAL", rarity: "COMMON", baseValue: 15, description: "Slick scales from forest snakes." },
    { id: 2605, name: "Bat Membrane", category: "MATERIAL", rarity: "COMMON", baseValue: 8, description: "Thin, leathery skin from cave bats." },

    // TIER 2: Hardened (IDs 2606-2610)
    { id: 2606, name: "Bear Fur", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 45, description: "Dense fur from forest bears." },
    { id: 2607, name: "Crocodile Leather", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 60, description: "Rugged hide from swamp predators." },
    { id: 2608, name: "Stalker Pelt", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 80, description: "Camouflaged fur from night hunters." },
    { id: 2609, name: "Venomous Hide", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 70, description: "Skin that secretes a mild toxin." },
    { id: 2610, name: "Frost-Wolf Fur", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 90, description: "Snow-white fur that resists the cold." },

    // TIER 3: Infused (IDs 2611-2615)
    { id: 2611, name: "Salamander Skin", category: "MATERIAL", rarity: "RARE", baseValue: 250, description: "Vibrant skin that feels warm to the touch." },
    { id: 2612, name: "Shadow-Panther Hide", category: "MATERIAL", rarity: "RARE", baseValue: 300, description: "Leather that seems to absorb light." },
    { id: 2613, name: "Electric Eel Skin", category: "MATERIAL", rarity: "RARE", baseValue: 280, description: "Crackling with residual static energy." },
    { id: 2614, name: "Gryphon Leather", category: "MATERIAL", rarity: "RARE", baseValue: 350, description: "Tough hide from noble winged beasts." },
    { id: 2615, name: "Chimera Hide", category: "MATERIAL", rarity: "RARE", baseValue: 400, description: "A patch-work of various beast textures." },

    // TIER 4: Apex (IDs 2616-2620)
    { id: 2616, name: "Wyvern Leather", category: "MATERIAL", rarity: "EPIC", baseValue: 1500, description: "Lightweight draconic hide for swiftness." },
    { id: 2617, name: "Iron-Shell Hide", category: "MATERIAL", rarity: "EPIC", baseValue: 1800, description: "As hard as steel but as flexible as leather." },
    { id: 2618, name: "Ethereal Membrane", category: "MATERIAL", rarity: "EPIC", baseValue: 2200, description: "Shimmers between reality and the void." },
    { id: 2619, name: "Hydra Skin", category: "MATERIAL", rarity: "EPIC", baseValue: 2500, description: "A rapidly healing organic material." },
    { id: 2620, name: "Basilisk Scale", category: "MATERIAL", rarity: "EPIC", baseValue: 2000, description: "Heavy scales that deflect negative energy." },

    // TIER 5: Mythical (IDs 2621-2625)
    { id: 2621, name: "Dragon Scale", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 8000, description: "The ultimate protection against physical force." },
    { id: 2622, name: "Phoenix Hide", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 9000, description: "Ever-burning hide of the eternal bird." },
    { id: 2623, name: "Kraken Leather", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 9500, description: "Untamable leather from the ocean's depth." },
    { id: 2624, name: "Void Carapace", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 12000, description: "Armor of the entities from beyond." },
    { id: 2625, name: "Celestial Hide", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 15000, description: "A radiant membrane from fallen stars." }
  ];

  for (const l of leathers) {
    await prisma.itemTemplate.upsert({
      where: { id: l.id },
      update: l,
      create: l
    });
  }

  console.log("✅ 25 Unique Leathers Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
