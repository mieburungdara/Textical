const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL WEAPON ARSENAL (T1-T5) ---");

  const weapons = [
    // --- SWORDS (IDs 7001-7005) - STR/DEX Focus ---
    { id: 7001, name: "Iron Broadsword", category: "WEAPON", rarity: "COMMON", baseValue: 150, description: "A reliable iron blade.", stats: [ { statKey: "attack_damage", statValue: 15 } ] },
    { id: 7002, name: "Steel Longsword", category: "WEAPON", rarity: "UNCOMMON", baseValue: 800, description: "Standard issue for knight-errants.", stats: [ { statKey: "attack_damage", statValue: 45 }, { statKey: "crit_chance", statValue: 0.02 } ] },
    { id: 7003, name: "Mithril Rapier", category: "WEAPON", rarity: "RARE", baseValue: 4000, description: "Light as a feather, sharp as a sting.", stats: [ { statKey: "attack_damage", statValue: 120 }, { statKey: "speed", statValue: 2 } ] },
    { id: 7004, name: "Orichalcum Claymore", category: "WEAPON", rarity: "EPIC", baseValue: 15000, description: "Heavier than it looks, and deadlier.", stats: [ { statKey: "attack_damage", statValue: 350 }, { statKey: "str", statValue: 10 } ] },
    { id: 7005, name: "Adamantite World-Breaker", category: "WEAPON", rarity: "LEGENDARY", baseValue: 50000, description: "Forged from the heart of a dying star.", stats: [ { statKey: "attack_damage", statValue: 800 }, { statKey: "ar_pen_base", statValue: 50 } ] },

    // --- BOWS (IDs 7101-7105) - DEX Focus ---
    { id: 7101, name: "Oak Recurve Bow", category: "WEAPON", rarity: "COMMON", baseValue: 140, description: "A simple wooden bow.", stats: [ { statKey: "attack_damage", statValue: 12 }, { statKey: "attack_range", statValue: 4 } ] },
    { id: 7102, name: "Birch Shortbow", category: "WEAPON", rarity: "UNCOMMON", baseValue: 750, description: "Fast and reliable.", stats: [ { statKey: "attack_damage", statValue: 35 }, { statKey: "speed", statValue: 3 } ] },
    { id: 7103, name: "Yew Greatbow", category: "WEAPON", rarity: "RARE", baseValue: 3800, description: "Capable of piercing heavy armor.", stats: [ { statKey: "attack_damage", statValue: 100 }, { statKey: "accuracy", statValue: 20 } ] },
    { id: 7104, name: "Ironwood Composite", category: "WEAPON", rarity: "EPIC", baseValue: 14000, description: "Reinforced with monster sinew.", stats: [ { statKey: "attack_damage", statValue: 300 }, { statKey: "crit_damage", statValue: 0.25 } ] },
    { id: 7105, name: "Void-String Longbow", category: "WEAPON", rarity: "LEGENDARY", baseValue: 48000, description: "Fires arrows that exist partially in the spirit realm.", stats: [ { statKey: "attack_damage", statValue: 700 }, { statKey: "dex", statValue: 25 } ] },

    // --- STAVES (IDs 7201-7205) - INT Focus ---
    { id: 7201, name: "Birch Wand", category: "WEAPON", rarity: "COMMON", baseValue: 160, description: "A beginner's catalyst.", stats: [ { statKey: "skill_power", statValue: 15 }, { statKey: "int", statValue: 2 } ] },
    { id: 7202, name: "Cedar Staff", category: "WEAPON", rarity: "UNCOMMON", baseValue: 850, description: "Smells of forest magic.", stats: [ { statKey: "skill_power", statValue: 40 }, { statKey: "mana_regen", statValue: 2 } ] },
    { id: 7203, name: "Mana-Oak Rod", category: "WEAPON", rarity: "RARE", baseValue: 4200, description: "A rod carved from wood grown in mana wells.", stats: [ { statKey: "skill_power", statValue: 110 }, { statKey: "mana_max", statValue: 100 } ] },
    { id: 7204, name: "Yggdrasil Branch", category: "WEAPON", rarity: "EPIC", baseValue: 16000, description: "A branch from the tree of life.", stats: [ { statKey: "skill_power", statValue: 320 }, { statKey: "int", statValue: 15 } ] },
    { id: 7205, name: "World-Tree Archstaff", category: "WEAPON", rarity: "LEGENDARY", baseValue: 55000, description: "The ultimate weapon for any Archmage.", stats: [ { statKey: "skill_power", statValue: 750 }, { statKey: "mana_regen", statValue: 10 } ] }
  ];

  for (const w of weapons) {
    await prisma.itemTemplate.upsert({
      where: { id: w.id },
      update: {
        name: w.name,
        category: w.category,
        rarity: w.rarity,
        baseValue: w.baseValue,
        description: w.description
      },
      create: {
        id: w.id,
        name: w.name,
        category: w.category,
        rarity: w.rarity,
        baseValue: w.baseValue,
        description: w.description
      }
    });

    // Seed stats for the weapon
    await prisma.itemStat.deleteMany({ where: { itemId: w.id } });
    for (const s of w.stats) {
        await prisma.itemStat.create({
            data: {
                itemId: w.id,
                statKey: s.statKey,
                statValue: s.statValue
            }
        });
    }
  }

  console.log("✅ 15 Weapon Templates Seeded (T1-T5).");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
