const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- SEEDING TEXTICAL WORLD EVENT CODEX ---");

  const events = [
    { 
        id: 1, name: "Orc Raid", description: "A warband of orcs is pillaging the region!",
        metadata: { combat_def_mult: 0.8, combat_atk_mult: 1.2, loot_chance_mult: 1.5, danger_level_bonus: 2 } 
    },
    { 
        id: 2, name: "Meteor Shower", description: "Glowing fragments of the cosmos fall from the sky.",
        metadata: { mining_yield_mult: 2.0, gathering_speed_mult: 1.2, rare_spawn_chance: 0.1 } 
    },
    { 
        id: 3, name: "Mana Surge", description: "The leylines are overflowing with raw magical energy.",
        metadata: { stat_int_bonus: 20, mp_regen_mult: 2.0, skill_power_mult: 1.25 } 
    },
    { 
        id: 4, name: "Harvest Moon", description: "The flora thrives under the pale light.",
        metadata: { herbalism_yield_mult: 1.5, herbalism_speed_mult: 1.5 } 
    },
    { 
        id: 5, name: "Abyssal Eclipse", description: "Darkness covers the land, emboldening the undead.",
        metadata: { combat_atk_mult: 0.9, exp_gain_mult: 1.5, danger_level_bonus: 3 } 
    }
  ];

  for (const e of events) {
    const data = {
        id: e.id,
        name: e.name,
        description: e.description,
        combatDefMult: e.metadata.combat_def_mult,
        combatAtkMult: e.metadata.combat_atk_mult,
        lootChanceMult: e.metadata.loot_chance_mult,
        dangerLevelBonus: e.metadata.danger_level_bonus,
        miningYieldMult: e.metadata.mining_yield_mult,
        statIntBonus: e.metadata.stat_int_bonus,
        herbalismYieldMult: e.metadata.herbalism_yield_mult,
        expGainMult: e.metadata.exp_gain_mult
    };
    await prisma.worldEventTemplate.upsert({
      where: { id: e.id },
      update: data,
      create: data
    });
  }

  console.log("✅ 5 World Event Templates Seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
