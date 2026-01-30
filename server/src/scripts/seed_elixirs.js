const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL ADVANCED ELIXIRS (v1.0 - 25 POTENT TRANSMUTATIONS) ---");

  const elixirs = [
    // TIER 1: Reinforced (IDs 4401-4405)
    { id: 4401, name: "Vial of Mending", category: "CONSUMABLE", rarity: "COMMON", baseValue: 50, description: "Advanced heal. Grants +5 HP Regen for 20 mins." },
    { id: 4402, name: "Mana-Surge Draught", category: "CONSUMABLE", rarity: "COMMON", baseValue: 60, description: "Advanced mana. Grants +5 Mana Regen for 20 mins." },
    { id: 4403, name: "Reflex Tonic", category: "CONSUMABLE", rarity: "COMMON", baseValue: 55, description: "Sharpens senses. Grants +5 DEX for 20 mins." },
    { id: 4404, name: "Muscle-Growth Brew", category: "CONSUMABLE", rarity: "COMMON", baseValue: 55, description: "Boosts strength. Grants +5 STR for 20 mins." },
    { id: 4405, name: "Clarity Concentrate", category: "CONSUMABLE", rarity: "COMMON", baseValue: 55, description: "Sharpens focus. Grants +5 INT for 20 mins." },

    // TIER 3: Infused (IDs 4411-4415)
    { id: 4411, name: "Giant's Blood Elixir", category: "CONSUMABLE", rarity: "RARE", baseValue: 1200, description: "Primal power. Grants +20 STR and +10% Max HP for 30 mins." },
    { id: 4412, name: "Eagle-Eye Spirit", category: "CONSUMABLE", rarity: "RARE", baseValue: 1200, description: "Elite precision. Grants +20 DEX and +10% Accuracy for 30 mins." },
    { id: 4413, name: "Archmage's Infusion", category: "CONSUMABLE", rarity: "RARE", baseValue: 1200, description: "Magical mastery. Grants +20 INT and +10% Skill Power for 30 mins." },
    { id: 4414, name: "Dragon-Scale Draught", category: "CONSUMABLE", rarity: "RARE", baseValue: 1500, description: "Draconic armor. Grants +20 VIT and +15% Physical Res for 30 mins." },
    { id: 4415, name: "Void-Step Mixture", category: "CONSUMABLE", rarity: "RARE", baseValue: 1800, description: "Phasing tonic. Grants +20 SPD and +15% Dodge for 30 mins." },

    // TIER 5: Mythical / PERMANENT (IDs 4421-4425)
    { id: 4421, name: "Elixir of Eternal Might", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 50000, description: "A divine brew. Grants +1 STR PERMANENTLY." },
    { id: 4422, name: "Elixir of Timeless Grace", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 50000, description: "A divine brew. Grants +1 DEX PERMANENTLY." },
    { id: 4423, name: "Elixir of Infinite Wisdom", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 50000, description: "A divine brew. Grants +1 INT PERMANENTLY." },
    { id: 4424, name: "Elixir of Immortal Life", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 50000, description: "A divine brew. Grants +1 VIT PERMANENTLY." },
    { id: 4425, name: "Elixir of the Gods", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 100000, description: "The ultimate transmutation. Grants +1 to ALL stats PERMANENTLY." }
  ];

  for (const e of elixirs) {
    await prisma.itemTemplate.upsert({
      where: { id: e.id },
      update: e,
      create: e
    });
  }

  console.log("✅ 15 Advanced Elixirs Seeded (including PERMANENT types).");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
