const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL CARNIVORE CODEX (v1.0 - 25 RAW MEATS) ---");

  const meats = [
    // TIER 1: Common (IDs 3701-3705)
    { id: 3701, name: "Small Game Meat", category: "MATERIAL", rarity: "COMMON", baseValue: 3, description: "Stringy meat from small forest creatures." },
    { id: 3702, name: "Wild Boar Shank", category: "MATERIAL", rarity: "COMMON", baseValue: 10, description: "Tough but flavorful meat from a wild boar." },
    { id: 3703, name: "Wolf Haunch", category: "MATERIAL", rarity: "COMMON", baseValue: 8, description: "Lean meat from a predator." },
    { id: 3704, name: "Reptile Tail", category: "MATERIAL", rarity: "COMMON", baseValue: 12, description: "Cold-blooded meat with a unique texture." },
    { id: 3705, name: "Giant Bat Wing", category: "MATERIAL", rarity: "COMMON", baseValue: 6, description: "Leathery meat from cave-dwelling bats." },

    // TIER 2: Uncommon (IDs 3706-3710)
    { id: 3706, name: "Bear Tenderloin", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 45, description: "Fatty and rich meat from a forest bear." },
    { id: 3707, name: "Prime Crocodile Tail", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 60, description: "Highly sought after delicacy from the swamp." },
    { id: 3708, name: "Stalker Flank", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 70, description: "Dark, lean meat from a night hunter." },
    { id: 3709, name: "Venom-Sac Gland", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 50, description: "Potent organ used in spicy, toxic dishes." },
    { id: 3710, name: "Frost-Wolf Ribs", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 80, description: "Meat that retains a chill even after harvest." },

    // TIER 3: Rare (IDs 3711-3715)
    { id: 3711, name: "Salamander Tongue", category: "MATERIAL", rarity: "RARE", baseValue: 250, description: "A muscle that pulses with residual heat." },
    { id: 3712, name: "Shadow-Panther Heart", category: "MATERIAL", rarity: "RARE", baseValue: 350, description: "A dense organ that hums with dark energy." },
    { id: 3713, name: "Electric Eel Fillet", category: "MATERIAL", rarity: "RARE", baseValue: 300, description: "Meat that crackles when prepared." },
    { id: 3714, name: "Gryphon Breast", category: "MATERIAL", rarity: "RARE", baseValue: 400, description: "Noble meat from a king of the skies." },
    { id: 3715, name: "Chimera Tripe", category: "MATERIAL", rarity: "RARE", baseValue: 450, description: "A complex mix of various beast flavors." },

    // TIER 4: Epic (IDs 3716-3720)
    { id: 3716, name: "Wyvern Wing-Meat", category: "MATERIAL", rarity: "EPIC", baseValue: 1800, description: "High-energy meat from a draconic predator." },
    { id: 3717, name: "Iron-Shell Marrow", category: "MATERIAL", rarity: "EPIC", baseValue: 2000, description: "Rich marrow protected by metallic bone." },
    { id: 3718, name: "Ethereal Essence-Meat", category: "MATERIAL", rarity: "EPIC", baseValue: 2500, description: "Meat that exists partially in the spirit realm." },
    { id: 3719, name: "Hydra-Regen Liver", category: "MATERIAL", rarity: "EPIC", baseValue: 3000, description: "A liver that continues to grow if not prepared quickly." },
    { id: 3720, name: "Basilisk Eye-Socket", category: "MATERIAL", rarity: "EPIC", baseValue: 2200, description: "A rare delicacy from a petrifying hunter." },

    // TIER 5: Mythical (IDs 3721-3725)
    { id: 3721, name: "Dragon Heart-Steak", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 12000, description: "The ultimate prize for any hunter." },
    { id: 3722, name: "Phoenix Gizzard", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 15000, description: "Meat that will never burn and never rot." },
    { id: 3723, name: "Kraken Tentacle-Core", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 18000, description: "Titan-class meat from the deep abyss." },
    { id: 3724, name: "Void-Stomach Lining", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 25000, description: "Material capable of digesting anything." },
    { id: 3725, name: "Celestial Rib-Eye", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 35000, description: "A cut of meat blessed by the stars themselves." }
  ];

  for (const m of meats) {
    await prisma.itemTemplate.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }

  console.log("✅ 25 Raw Meats Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
