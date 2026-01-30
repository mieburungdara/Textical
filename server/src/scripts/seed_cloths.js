const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL REFINED CLOTHS (v1.0 - 25 TEXTILES) ---");

  const cloths = [
    // TIER 1: Common (IDs 3201-3205)
    { id: 3201, name: "Green Thread", category: "MATERIAL", rarity: "COMMON", baseValue: 10, description: "Basic herbal thread for simple tailoring." },
    { id: 3202, name: "Blue Mana-Thread", category: "MATERIAL", rarity: "COMMON", baseValue: 12, description: "Thread that hums with low-level mana." },
    { id: 3203, name: "Red Energy-Fiber", category: "MATERIAL", rarity: "COMMON", baseValue: 15, description: "Fibrous material that boosts stamina gear." },
    { id: 3204, name: "Yellow Swift-String", category: "MATERIAL", rarity: "COMMON", baseValue: 15, description: "Elastic string used in scout equipment." },
    { id: 3205, name: "Purple Toxic-Lace", category: "MATERIAL", rarity: "COMMON", baseValue: 18, description: "Delicate lace treated with nightshade." },

    // TIER 2: Uncommon (IDs 3206-3210)
    { id: 3206, name: "Ginseng Fiber", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 60, description: "Strong root fibers for durable robes." },
    { id: 3207, name: "Silver-Silk", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 80, description: "Shimmering silk that wards off minor curses." },
    { id: 3208, name: "Warding Yarn", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 50, description: "Pungent yarn used to deter pests and spirits." },
    { id: 3209, name: "Peace-Cloth", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 40, description: "Soft cloth that promotes restful sleep." },
    { id: 3210, name: "Fungal Membrane", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 85, description: "Tough, leathery fabric from Amanita spores." },

    // TIER 3: Rare (IDs 3211-3215)
    { id: 3211, name: "Mandrake Sinew", category: "MATERIAL", rarity: "RARE", baseValue: 450, description: "Vocal cords turned into unbreakable string." },
    { id: 3212, name: "Fire-Silk", category: "MATERIAL", rarity: "RARE", baseValue: 500, description: "Silk that glows like embers." },
    { id: 3213, name: "Frost-Fabric", category: "MATERIAL", rarity: "RARE", baseValue: 500, description: "Fabric that never gets warm." },
    { id: 3214, name: "Static-Thread", category: "MATERIAL", rarity: "RARE", baseValue: 480, description: "Thread that stands on end with lightning." },
    { id: 3215, name: "Void-Weave", category: "MATERIAL", rarity: "RARE", baseValue: 550, description: "Material that eats the surrounding light." },

    // TIER 4: Epic (IDs 3216-3220)
    { id: 3216, name: "Solar-Cloth", category: "MATERIAL", rarity: "EPIC", baseValue: 3000, description: "Cloth woven from pure sunlight." },
    { id: 3217, name: "Lunar-Silk", category: "MATERIAL", rarity: "EPIC", baseValue: 3000, description: "Silk that captures the wisdom of the moon." },
    { id: 3218, name: "Blood-Satin", category: "MATERIAL", rarity: "EPIC", baseValue: 3800, description: "Deep red fabric that pulses with vitality." },
    { id: 3219, name: "Dragon-Scale Thread", category: "MATERIAL", rarity: "EPIC", baseValue: 4500, description: "Indestructible thread made from dragon scales." },
    { id: 3220, name: "Ghost-Veil", category: "MATERIAL", rarity: "EPIC", baseValue: 3500, description: "Fabric that allows passage through walls." },

    // TIER 5: Legendary (IDs 3221-3225)
    { id: 3221, name: "Stone-Fiber Cloth", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 15000, description: "Woven from the impossible moss of ages." },
    { id: 3222, name: "Sky-Fabric", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 18000, description: "Light enough to make the wearer float." },
    { id: 3223, name: "Spirit-Mesh", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 20000, description: "A mesh that exists in two worlds at once." },
    { id: 3224, name: "Abyssal Webbing", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 22000, description: "Tough webbing from the crushing void." },
    { id: 3225, name: "World-Tree Raiment", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 40000, description: "A garment fit for a god." }
  ];

  for (const c of cloths) {
    await prisma.itemTemplate.upsert({
      where: { id: c.id },
      update: c,
      create: c
    });
  }

  console.log("✅ 25 Refined Cloths Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
