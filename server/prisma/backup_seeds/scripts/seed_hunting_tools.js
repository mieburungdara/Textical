const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL HUNTING TOOLS (KNIVES & CLEAVERS) ---");

  const tools = [
    // SKINNER'S KNIVES (IDs 3901-3905)
    { id: 3901, name: "Flint Skinner's Knife", category: "SKINNER_KNIFE", rarity: "COMMON", baseValue: 35, toolTier: 0, description: "A crude tool. Grants 1.1x Leather yield bonus." },
    { id: 3902, name: "Iron Skinner's Knife", category: "SKINNER_KNIFE", rarity: "COMMON", baseValue: 160, toolTier: 1, description: "A balanced knife. Grants 1.25x Leather yield bonus." },
    { id: 3903, name: "Steel Skinner's Knife", category: "SKINNER_KNIFE", rarity: "UNCOMMON", baseValue: 800, toolTier: 2, description: "Expert precision. Grants 1.5x Leather yield bonus." },
    { id: 3904, name: "Mithril Skinner's Knife", category: "SKINNER_KNIFE", rarity: "RARE", baseValue: 4000, toolTier: 3, description: "Effortless skinning. Grants 2.0x Leather yield bonus." },
    { id: 3905, name: "Adamantite Skinner's Knife", category: "SKINNER_KNIFE", rarity: "LEGENDARY", baseValue: 18000, toolTier: 4, description: "The master hunter's blade. Grants 3.0x Leather yield bonus." },

    // BUTCHER'S CLEAVERS (IDs 4101-4105)
    { id: 4101, name: "Flint Butcher's Cleaver", category: "BUTCHER_CLEAVER", rarity: "COMMON", baseValue: 40, toolTier: 0, description: "Crude weight. Grants 1.1x Meat yield bonus." },
    { id: 4102, name: "Iron Butcher's Cleaver", category: "BUTCHER_CLEAVER", rarity: "COMMON", baseValue: 180, toolTier: 1, description: "Steady cuts. Grants 1.25x Meat yield bonus." },
    { id: 4103, name: "Steel Butcher's Cleaver", category: "BUTCHER_CLEAVER", rarity: "UNCOMMON", baseValue: 900, toolTier: 2, description: "Heavy and sharp. Grants 1.5x Meat yield bonus." },
    { id: 4104, name: "Mithril Butcher's Cleaver", category: "BUTCHER_CLEAVER", rarity: "RARE", baseValue: 4500, toolTier: 3, description: "Soul-binding cuts. Grants 2.0x Meat yield bonus." },
    { id: 4105, name: "Adamantite Butcher's Cleaver", category: "BUTCHER_CLEAVER", rarity: "LEGENDARY", baseValue: 20000, toolTier: 4, description: "Perfect separation of meat from bone. Grants 3.0x Meat yield bonus." }
  ];

  for (const t of tools) {
    await prisma.itemTemplate.upsert({
      where: { id: t.id },
      update: t,
      create: t
    });
  }

  console.log("✅ 10 Hunting Tools Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
