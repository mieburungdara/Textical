const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL HERBALISM TOOLS (SICKLES) ---");

  const sickles = [
    { 
        id: 3601, name: "Flint Sickle", category: "HERBALISM_SICKLE", 
        rarity: "COMMON", baseValue: 30, toolTier: 0, 
        description: "A crude stone sickle. Grants 1.1x INT bonus for herbalism." 
    },
    { 
        id: 3602, name: "Iron Sickle", category: "HERBALISM_SICKLE", 
        rarity: "COMMON", baseValue: 150, toolTier: 1, 
        description: "A sharp iron sickle. Grants 1.25x INT bonus for herbalism." 
    },
    { 
        id: 3603, name: "Steel Sickle", category: "HERBALISM_SICKLE", 
        rarity: "UNCOMMON", baseValue: 700, toolTier: 2, 
        description: "Professional grade steel sickle. Grants 1.5x INT bonus for herbalism." 
    },
    { 
        id: 3604, name: "Mithril Sickle", category: "HERBALISM_SICKLE", 
        rarity: "RARE", baseValue: 3500, toolTier: 3, 
        description: "An incredibly light mithril sickle. Grants 2.0x INT bonus for herbalism." 
    },
    { 
        id: 3605, name: "Adamantite Sickle", category: "HERBALISM_SICKLE", 
        rarity: "LEGENDARY", baseValue: 15000, toolTier: 4, 
        description: "Divine Adamantite blade. Grants 3.0x INT bonus for herbalism." 
    }
  ];

  for (const s of sickles) {
    await prisma.itemTemplate.upsert({
      where: { id: s.id },
      update: s,
      create: s
    });
  }

  console.log("✅ 5 Herbalism Sickles Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
