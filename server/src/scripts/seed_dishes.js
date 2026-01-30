const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL CULINARY CODEX (v1.0 - 25 UNIQUE DISHES) ---");

  const dishes = [
    // TIER 1: Common (IDs 4201-4205)
    { id: 4201, name: "Roasted Boar Shank", category: "CONSUMABLE", rarity: "COMMON", baseValue: 20, description: "Basic roast meat. Grants +2 STR for 10 mins." },
    { id: 4202, name: "Mana-Lily Soup", category: "CONSUMABLE", rarity: "COMMON", baseValue: 25, description: "Delicate flower broth. Grants +2 INT for 10 mins." },
    { id: 4203, name: "Swift-Sardine Sticks", category: "CONSUMABLE", rarity: "COMMON", baseValue: 22, description: "Crunchy fried fish. Grants +2 DEX for 10 mins." },
    { id: 4204, name: "Herbal Tea", category: "CONSUMABLE", rarity: "COMMON", baseValue: 15, description: "Soothing brew. Grants +2 VIT for 10 mins." },
    { id: 4205, name: "Fisherman's Pie", category: "CONSUMABLE", rarity: "COMMON", baseValue: 30, description: "Hearty filling. Grants +50 Max HP for 10 mins." },

    // TIER 2: Uncommon (IDs 4206-4210)
    { id: 4206, name: "Bear Steak au Poivre", category: "CONSUMABLE", rarity: "UNCOMMON", baseValue: 120, description: "Peppery bear steak. Grants +5 STR for 15 mins." },
    { id: 4207, name: "Gator Gumbo", category: "CONSUMABLE", rarity: "UNCOMMON", baseValue: 150, description: "Spicy swamp stew. Grants +5 DEX for 15 mins." },
    { id: 4208, name: "Silverleaf Salad", category: "CONSUMABLE", rarity: "UNCOMMON", baseValue: 100, description: "Holy greens. Grants +5 INT for 15 mins." },
    { id: 4209, name: "Lobster Thermidor", category: "CONSUMABLE", rarity: "UNCOMMON", baseValue: 180, description: "Rich lobster dish. Grants +5 VIT for 15 mins." },
    { id: 4210, name: "Root Vegetable Roast", category: "CONSUMABLE", rarity: "UNCOMMON", baseValue: 90, description: "Earth's bounty. Grants +5% HP Regen for 15 mins." },

    // TIER 3: Rare (IDs 4211-4215)
    { id: 4211, name: "Shadow-Panther Sashimi", category: "CONSUMABLE", rarity: "RARE", baseValue: 600, description: "Precision-cut meat. Grants +10 DEX and +3% Crit for 20 mins." },
    { id: 4212, name: "Mandrake Risotto", category: "CONSUMABLE", rarity: "RARE", baseValue: 750, description: "Magical rice. Grants +10 INT and +5% Skill Power for 20 mins." },
    { id: 4213, name: "Electric Ray Tempura", category: "CONSUMABLE", rarity: "RARE", baseValue: 650, description: "Energizing fish. Grants +10 SPD and +5 Initiative for 20 mins." },
    { id: 4214, name: "Blood-Rose Tartare", category: "CONSUMABLE", rarity: "RARE", baseValue: 800, description: "Vitalizing dish. Grants +10 STR and +5% Lifesteal for 20 mins." },
    { id: 4215, name: "Salamander Satay", category: "CONSUMABLE", rarity: "RARE", baseValue: 700, description: "Fiery skewers. Grants +10 VIT and +20% Fire Res for 20 mins." },

    // TIER 4: Epic (IDs 4216-4220)
    { id: 4216, name: "Wyvern Wing Buffet", category: "CONSUMABLE", rarity: "EPIC", baseValue: 3500, description: "A hunter's feast. Grants +20 STR and +10% ATK for 30 mins." },
    { id: 4217, name: "Solar-Sunflower Cake", category: "CONSUMABLE", rarity: "EPIC", baseValue: 3000, description: "Light-infused pastry. Grants +20 INT and +15% Holy Dmg for 30 mins." },
    { id: 4218, name: "Ghost-Shark Sushi", category: "CONSUMABLE", rarity: "EPIC", baseValue: 4000, description: "Semi-ethereal fish. Grants +20 DEX and +10% Evasion for 30 mins." },
    { id: 4219, name: "Hydra-Regen Soup", category: "CONSUMABLE", rarity: "EPIC", baseValue: 5000, description: "Overflowing life. Grants +20 VIT and +20 HP/Tick for 30 mins." },
    { id: 4220, name: "Moon-Lily Elixir-Dish", category: "CONSUMABLE", rarity: "EPIC", baseValue: 3800, description: "Lunar feast. Grants +20 INT and +10% Mana Regen for 30 mins." },

    // TIER 5: Mythical (IDs 4221-4225)
    { id: 4221, name: "Dragon-Heart Roast", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 25000, description: "Titan's strength. Grants +50 STR and +20% ATK for 60 mins." },
    { id: 4222, name: "Eternal Phoenix Flambé", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 30000, description: "Immortality taste. Grants +50 VIT and Auto-Revive once for 60 mins." },
    { id: 4223, name: "Abyssal Kraken Carpaccio", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 35000, description: "Void power. Grants +50 INT and +25% Magic Pierce for 60 mins." },
    { id: 4224, name: "Star-Dust Consommé", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 40000, description: "Cosmic focus. Grants +50 DEX and +15% Accuracy for 60 mins." },
    { id: 4225, name: "World-Tree Ambrosia", category: "CONSUMABLE", rarity: "LEGENDARY", baseValue: 60000, description: "The fruit of gods. Grants +25 to ALL stats for 60 mins." }
  ];

  for (const d of dishes) {
    await prisma.itemTemplate.upsert({
      where: { id: d.id },
      update: d,
      create: d
    });
  }

  console.log("✅ 25 Culinary Dishes Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
