const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL REFINED LEATHERS (v1.0 - 25 TANNED MATERIALS) ---");

  const leathers = [
    // TIER 1: Foundations (IDs 3101-3105)
    { id: 3101, name: "Tanned Hide", category: "MATERIAL", rarity: "COMMON", baseValue: 12, description: "Cured ragged hide, suitable for basic gear." },
    { id: 3102, name: "Boar Leather", category: "MATERIAL", rarity: "COMMON", baseValue: 25, description: "Tough, cured boar skin." },
    { id: 3103, name: "Wolf Leather", category: "MATERIAL", rarity: "COMMON", baseValue: 30, description: "Supple leather made from wolf pelts." },
    { id: 3104, name: "Serpent Leather", category: "MATERIAL", rarity: "COMMON", baseValue: 35, description: "Slick, water-resistant serpent scales." },
    { id: 3105, name: "Cured Membrane", category: "MATERIAL", rarity: "COMMON", baseValue: 20, description: "Reinforced bat membrane for light crafts." },

    // TIER 2: Resilient (IDs 3106-3110)
    { id: 3106, name: "Bear Leather", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 100, description: "Heavy-duty leather from grizzly bears." },
    { id: 3107, name: "Crocodile Leather", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 140, description: "Rugged and durable cured reptile hide." },
    { id: 3108, name: "Stalker Leather", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 180, description: "Dark, noise-dampening predator leather." },
    { id: 3109, name: "Venom-Infused Leather", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 160, description: "Chemically treated toxic hide." },
    { id: 3110, name: "Frost-Wolf Leather", category: "MATERIAL", rarity: "UNCOMMON", baseValue: 200, description: "Cold-resistant white wolf leather." },

    // TIER 3: Specialized (IDs 3111-3115)
    { id: 3111, name: "Salamander Leather", category: "MATERIAL", rarity: "RARE", baseValue: 600, description: "Fire-proof leather from the volcanic depths." },
    { id: 3112, name: "Shadow Leather", category: "MATERIAL", rarity: "RARE", baseValue: 700, description: "Leather that seems to flicker in the light." },
    { id: 3113, name: "Electric Leather", category: "MATERIAL", rarity: "RARE", baseValue: 650, description: "Sparking leather with high conductivity." },
    { id: 3114, name: "Gryphon Leather", category: "MATERIAL", rarity: "RARE", baseValue: 800, description: "Aerodynamic and extremely tough leather." },
    { id: 3115, name: "Chimera Leather", category: "MATERIAL", rarity: "RARE", baseValue: 900, description: "A multi-textured leather with high resistance." },

    // TIER 4: Tactical (IDs 3116-3120)
    { id: 3116, name: "Wyvern Leather", category: "MATERIAL", rarity: "EPIC", baseValue: 3500, description: "Draconic leather for elite scouts." },
    { id: 3117, name: "Iron-Shell Leather", category: "MATERIAL", rarity: "EPIC", baseValue: 4000, description: "Leather as hard as plate armor." },
    { id: 3120, name: "Basilisk Leather", category: "MATERIAL", rarity: "EPIC", baseValue: 4500, description: "Petrification-resistant heavy leather." },
    { id: 3119, name: "Hydra Leather", category: "MATERIAL", rarity: "EPIC", baseValue: 5500, description: "Self-mending organic leather." },
    { id: 3118, name: "Ethereal Leather", category: "MATERIAL", rarity: "EPIC", baseValue: 5000, description: "Ghostly leather that phases slightly." },

    // TIER 5: Masterwork (IDs 3121-3125)
    { id: 3121, name: "Dragon-Scale Plate", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 18000, description: "The ultimate draconic protection." },
    { id: 3122, name: "Phoenix Leather", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 20000, description: "Warm, ever-glowing eternal leather." },
    { id: 3123, name: "Kraken Leather", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 22000, description: "Tough leather from the abyssal monarch." },
    { id: 3124, name: "Void Leather", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 28000, description: "Material harvested from the space between stars." },
    { id: 3125, name: "Celestial Leather", category: "MATERIAL", rarity: "LEGENDARY", baseValue: 35000, description: "Radiant membrane from the celestial realms." }
  ];

  for (const l of leathers) {
    await prisma.itemTemplate.upsert({
      where: { id: l.id },
      update: l,
      create: l
    });
  }

  console.log("✅ 25 Refined Leathers Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
