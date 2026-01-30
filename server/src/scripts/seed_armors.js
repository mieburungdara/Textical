const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL ARMOR ARMORY (T1-T5) ---");

  const armors = [
    // --- HEAVY ARMOR (IDs 7301-7315) - VIT/DEF Focus ---
    { id: 7301, name: "Iron Plate", category: "ARMOR", rarity: "COMMON", baseValue: 200, stats: [ { statKey: "defense", statValue: 10 }, { statKey: "vit", statValue: 2 } ] },
    { id: 7302, name: "Iron Leggings", category: "ARMOR", rarity: "COMMON", baseValue: 150, stats: [ { statKey: "defense", statValue: 7 }, { statKey: "vit", statValue: 1 } ] },
    { id: 7303, name: "Iron Helm", category: "ARMOR", rarity: "COMMON", baseValue: 100, stats: [ { statKey: "defense", statValue: 5 }, { statKey: "vit", statValue: 1 } ] },
    
    { id: 7313, name: "Adamantite Cuirass", category: "ARMOR", rarity: "LEGENDARY", baseValue: 60000, stats: [ { statKey: "defense", statValue: 300 }, { statKey: "vit", statValue: 50 }, { statKey: "tenacity", statValue: 20 } ] },
    { id: 7314, name: "Adamantite Greaves", category: "ARMOR", rarity: "LEGENDARY", baseValue: 45000, stats: [ { statKey: "defense", statValue: 200 }, { statKey: "vit", statValue: 30 } ] },
    { id: 7315, name: "Adamantite Greathelm", category: "ARMOR", rarity: "LEGENDARY", baseValue: 35000, stats: [ { statKey: "defense", statValue: 150 }, { statKey: "vit", statValue: 20 } ] },

    // --- MEDIUM ARMOR (IDs 7401-7415) - DEX/DEF Focus ---
    { id: 7401, name: "Boar-Hide Tunic", category: "ARMOR", rarity: "COMMON", baseValue: 180, stats: [ { statKey: "defense", statValue: 6 }, { statKey: "dex", statValue: 2 } ] },
    { id: 7402, name: "Boar-Hide Chaps", category: "ARMOR", rarity: "COMMON", baseValue: 140, stats: [ { statKey: "defense", statValue: 4 }, { statKey: "dex", statValue: 1 } ] },
    { id: 7403, name: "Boar-Hide Cap", category: "ARMOR", rarity: "COMMON", baseValue: 90, stats: [ { statKey: "defense", statValue: 3 }, { statKey: "dex", statValue: 1 } ] },

    { id: 7413, name: "Dragon-Scale Jerkin", category: "ARMOR", rarity: "LEGENDARY", baseValue: 55000, stats: [ { statKey: "defense", statValue: 150 }, { statKey: "dex", statValue: 40 }, { statKey: "dodge_rate", statValue: 0.10 } ] },
    { id: 7414, name: "Dragon-Scale Pants", category: "ARMOR", rarity: "LEGENDARY", baseValue: 40000, stats: [ { statKey: "defense", statValue: 100 }, { statKey: "dex", statValue: 25 } ] },
    { id: 7415, name: "Dragon-Scale Hood", category: "ARMOR", rarity: "LEGENDARY", baseValue: 30000, stats: [ { statKey: "defense", statValue: 80 }, { statKey: "dex", statValue: 20 } ] },

    // --- LIGHT ARMOR (IDs 7501-7515) - INT/DEF Focus ---
    { id: 7501, name: "Green-Thread Robe", category: "ARMOR", rarity: "COMMON", baseValue: 160, stats: [ { statKey: "defense", statValue: 3 }, { statKey: "int", statValue: 3 } ] },
    { id: 7502, name: "Green-Thread Pants", category: "ARMOR", rarity: "COMMON", baseValue: 120, stats: [ { statKey: "defense", statValue: 2 }, { statKey: "int", statValue: 2 } ] },
    { id: 7503, name: "Green-Thread Circlet", category: "ARMOR", rarity: "COMMON", baseValue: 80, stats: [ { statKey: "defense", statValue: 1 }, { statKey: "int", statValue: 1 } ] },

    { id: 7513, name: "World-Tree Raiment", category: "ARMOR", rarity: "LEGENDARY", baseValue: 65000, stats: [ { statKey: "defense", statValue: 80 }, { statKey: "int", statValue: 60 }, { statKey: "mana_regen", statValue: 15 } ] },
    { id: 7514, name: "World-Tree Leggings", category: "ARMOR", rarity: "LEGENDARY", baseValue: 48000, stats: [ { statKey: "defense", statValue: 50 }, { statKey: "int", statValue: 40 } ] },
    { id: 7515, name: "World-Tree Crown", category: "ARMOR", rarity: "LEGENDARY", baseValue: 38000, stats: [ { statKey: "defense", statValue: 40 }, { statKey: "int", statValue: 30 } ] }
  ];

  for (const a of armors) {
    await prisma.itemTemplate.upsert({
      where: { id: a.id },
      update: { name: a.name, category: a.category, rarity: a.rarity, baseValue: a.baseValue, description: `A sturdy piece of ${a.category.toLowerCase()}.` },
      create: { id: a.id, name: a.name, category: a.category, rarity: a.rarity, baseValue: a.baseValue, description: `A sturdy piece of ${a.category.toLowerCase()}.` }
    });

    await prisma.itemStat.deleteMany({ where: { itemId: a.id } });
    for (const s of a.stats) {
        await prisma.itemStat.create({
            data: {
                itemId: a.id,
                statKey: s.statKey,
                statValue: s.statValue
            }
        });
    }
  }

  console.log("✅ Armor Templates Seeded (T1 & T5 Sample Sets).");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
