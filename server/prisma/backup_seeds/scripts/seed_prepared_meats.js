const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL REFINED CULINARY MEATS (v1.0 - 25 COOKED MEATS) ---");

  const meats = [
    // TIER 1: Common (IDs 3801-3805)
    { id: 3801, name: "Seared Game-Bites", category: "MATERIAL", rarity: "COMMON", baseValue: 8, description: "Quickly seared bits of small game." },
    { id: 3802, name: "Boar Steak", category: "MATERIAL", rarity: "COMMON", baseValue: 25, description: "A thick, juicy wild boar steak." },
    { id: 3803, name: "Wolf Jerky", category: "MATERIAL", rarity: "COMMON", baseValue: 20, description: "Dried and salted wolf meat for long journeys." },
    { id: 3804, name: "Skewered Tail", category: "MATERIAL", rarity: "COMMON", baseValue: 30, description: "Grilled reptile tail on a stick." },
    { id: 3805, name: "Crispy Bat Wing", category: "MATERIAL", rarity: "COMMON", baseValue: 15, description: "Deep-fried bat wing, surprisingly crunchy." },

    // TIER 2: Uncommon (IDs 3806-3810)
    { id: 3806, name: "Bear Pot-Roast", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 110, description: "Slow-cooked bear meat with herbs." },
    { id: 3807, name: "Gator Fillet", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 150, description: "Refined swamp crocodile meat." },
    { id: 3808, name: "Hunter's Flank", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 180, description: "Masterfully prepared stalker flank." },
    { id: 3809, name: "Spicy Toxic-Sausage", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 130, description: "Safe-to-eat sausage made from venom glands." },
    { id: 3810, name: "Frost-Glazed Ribs", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 200, description: "Cold-smoked ribs from a frost-wolf." },

    // TIER 3: Rare (IDs 3811-3815)
    { id: 3811, name: "Salamander Stir-Fry", category: "MATERIAL", rarity: "RARE", baseValue: 600, description: "Spicy stir-fry that keeps you warm." },
    { id: 3812, name: "Heart of the Jungle", category: "MATERIAL", rarity: "RARE", baseValue: 850, description: "Prepared shadow-panther heart." },
    { id: 3813, name: "Static-Charger Steak", category: "MATERIAL", rarity: "RARE", baseValue: 750, description: "Meat that tingles on the tongue." },
    { id: 3814, name: "Noble Gryphon-Wing", category: "MATERIAL", rarity: "RARE", baseValue: 1000, description: "Fine dining fit for royalty." },
    { id: 3815, name: "Chimera Goulash", category: "MATERIAL", rarity: "RARE", baseValue: 1100, description: "A stew of impossible flavors." },

    // TIER 4: Epic (IDs 3816-3820)
    { id: 3816, name: "Wyvern Confit", category: "MATERIAL", rarity: "EPIC", baseValue: 4500, description: "Delicately preserved draconic meat." },
    { id: 3817, name: "Marrow-Infused Broth", category: "MATERIAL", rarity: "EPIC", baseValue: 5000, description: "Deeply nourishing iron-shell marrow." },
    { id: 3818, name: "Essence-Steak", category: "MATERIAL", rarity: "EPIC", baseValue: 6000, description: "Steak that feeds both body and spirit." },
    { id: 3819, name: "Hydra-Regen Roast", category: "MATERIAL", rarity: "EPIC", baseValue: 7500, description: "Meat that almost cooks itself." },
    { id: 3820, name: "Sight-Beyond-Soup", category: "MATERIAL", rarity: "EPIC", baseValue: 5500, description: "Soup made from basilisk eye-sockets." },

    // TIER 5: Mythical (IDs 3821-3825)
    { id: 3821, name: "Legendary Dragon-Roast", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 30000, description: "The pinnacle of culinary achievement." },
    { id: 3822, name: "Eternal Phoenix-Stew", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 38000, description: "A stew that never loses its heat." },
    { id: 3823, name: "Kraken-Tentacle Medallion", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 45000, description: "Massive medallions of abyssal meat." },
    { id: 3824, name: "Void-Stomach Sushi", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 60000, description: "Eating this is a dangerous experience." },
    { id: 3825, name: "Roast World-Turtle", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 80000, description: "Meat that carries the weight of history." }
  ];

  for (const m of meats) {
    await prisma.itemTemplate.upsert({
      where: { id: m.id },
      update: m,
      create: m
    });
  }

  console.log("✅ 25 Prepared Meats Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
