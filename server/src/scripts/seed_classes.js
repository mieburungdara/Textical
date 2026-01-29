const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("--- CLASS CODEX v14.0: REFINEMENT & TIER 3 ---");

  const classes = [
    // --- TIER 0 (STARTER) ---
    { id: 1001, name: "Novice", tier: 0, resourceType: "MANA", focus: "Generalist", identity: "A beginner embarking on their journey.", growthDesc: "Slow but steady growth.", mechanicDesc: "Standard Mana.", leadsTo: "23 Foundation Classes", hpGrowth: 5, mpGrowth: 2, atkGrowth: 1, defGrowth: 0.5, spdGrowth: 0.1, promotionReqLevel: 10 },

    // --- TIER 1 (FOUNDATIONS) - REFINED ---
    { id: 1101, name: "Warrior", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Durability", identity: "Defensive frontliner focusing on survival.", growthDesc: "High HP (+12) and DEF.", mechanicDesc: "+5% Block Chance.", leadsTo: "Knight, Guardian", hpGrowth: 12, mpGrowth: 1, atkGrowth: 1.5, defGrowth: 2.5, spdGrowth: 0.1, promotionReqLevel: 25 },
    { id: 1102, name: "Scout", tier: 1, resourceType: "ENERGY", parentClassId: 1001, focus: "Agility", identity: "Fast exploration.", growthDesc: "High SPD and DEX.", mechanicDesc: "Fast-regen Energy.", leadsTo: "Rogue, Explorer", hpGrowth: 7, mpGrowth: 5, atkGrowth: 2, defGrowth: 0.5, spdGrowth: 0.6, promotionReqLevel: 25 },
    { id: 1103, name: "Apprentice", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Magic", identity: "Arcane student.", growthDesc: "High MP and INT.", mechanicDesc: "+5% Mana Regen.", leadsTo: "Wizard, Sorcerer", hpGrowth: 4, mpGrowth: 15, atkGrowth: 0.5, defGrowth: 0.2, spdGrowth: 0.3, promotionReqLevel: 25 },
    { id: 1104, name: "Votary", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Resilience", identity: "Survivalist.", growthDesc: "High Regen/Tenacity.", mechanicDesc: "-15% Status Duration.", leadsTo: "Monk, Ascetic", hpGrowth: 10, mpGrowth: 5, atkGrowth: 1, defGrowth: 1, spdGrowth: 0.2, promotionReqLevel: 25 },
    { id: 1105, name: "Brute", tier: 1, resourceType: "RAGE", parentClassId: 1001, focus: "Power", identity: "Pure aggression.", growthDesc: "Massive ATK (+4) and HP.", mechanicDesc: "Uses Rage.", leadsTo: "Berserker, Destroyer", hpGrowth: 15, mpGrowth: 0, atkGrowth: 4, defGrowth: 0.2, spdGrowth: 0.1, promotionReqLevel: 25 },
    { id: 1106, name: "Duelist", tier: 1, resourceType: "ENERGY", parentClassId: 1001, focus: "Precision", identity: "Technical combat.", growthDesc: "High Crit and Acc.", mechanicDesc: "+10% Counter Chance.", leadsTo: "Swordsman, Fencer", hpGrowth: 8, mpGrowth: 2, atkGrowth: 2.5, defGrowth: 1, spdGrowth: 0.4, promotionReqLevel: 25 },
    { id: 1107, name: "Archer", tier: 1, resourceType: "ENERGY", parentClassId: 1001, focus: "Distance", identity: "Ranged foundation specializing in bows.", growthDesc: "High Range and Acc.", mechanicDesc: "+1 Base Range.", leadsTo: "Sniper, Hunter", hpGrowth: 6, mpGrowth: 2, atkGrowth: 3, defGrowth: 0.5, spdGrowth: 0.4, promotionReqLevel: 25 },
    { id: 1108, name: "Acolyte", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Restoration", identity: "Team healer.", growthDesc: "High MP and HP Regen.", mechanicDesc: "+20% Healing power.", leadsTo: "Priest, Exorcist", hpGrowth: 8, mpGrowth: 10, atkGrowth: 1, defGrowth: 1, spdGrowth: 0.2, promotionReqLevel: 25 },
    { id: 1109, name: "Occultist", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Affliction", identity: "Debuff weaver.", growthDesc: "High INT/Debuff.", mechanicDesc: "10% Poison on hit.", leadsTo: "Warlock, Necromancer", hpGrowth: 6, mpGrowth: 12, atkGrowth: 1, defGrowth: 0.5, spdGrowth: 0.3, promotionReqLevel: 25 },
    { id: 1110, name: "Trapper", tier: 1, resourceType: "ENERGY", parentClassId: 1001, focus: "Control", identity: "Grid master.", growthDesc: "High DEX/Trap DMG.", mechanicDesc: "Ignore obstacles.", leadsTo: "Saboteur, Tracker", hpGrowth: 9, mpGrowth: 4, atkGrowth: 2, defGrowth: 1, spdGrowth: 0.5, promotionReqLevel: 25 },
    { id: 1111, name: "Brawler", tier: 1, resourceType: "RAGE", parentClassId: 1001, focus: "Reflexes", identity: "Street fighter.", growthDesc: "High SPD/Dodge.", mechanicDesc: "15% multi-hit chance.", leadsTo: "Champion, Gladiator", hpGrowth: 11, mpGrowth: 0, atkGrowth: 3.5, defGrowth: 0.8, spdGrowth: 0.5, promotionReqLevel: 25 },
    { id: 1112, name: "Mystic", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Elemental", identity: "Spirit talker.", growthDesc: "Balanced Magic.", mechanicDesc: "+20% Elem DMG.", leadsTo: "Druid, Elementalist", hpGrowth: 7, mpGrowth: 10, atkGrowth: 1.5, defGrowth: 1, spdGrowth: 0.3, promotionReqLevel: 25 },
    { id: 1113, name: "Taekwondist", tier: 1, resourceType: "RAGE", parentClassId: 1001, focus: "Knockback", identity: "Kicking specialist.", growthDesc: "High Speed (+0.7).", mechanicDesc: "25% Knockback chance.", leadsTo: "Grandmaster, Kick-Master", hpGrowth: 10, mpGrowth: 0, atkGrowth: 3.2, defGrowth: 0.5, spdGrowth: 0.7, promotionReqLevel: 25 },
    { id: 1114, name: "Bard", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Auras", identity: "Musical support.", growthDesc: "High MP and Radius.", mechanicDesc: "+10 SPD Aura.", leadsTo: "Troubadour, Minstrel", hpGrowth: 8, mpGrowth: 12, atkGrowth: 1.2, defGrowth: 0.8, spdGrowth: 0.4, promotionReqLevel: 25 },
    { id: 1115, name: "Shaolin", tier: 1, resourceType: "ENERGY", parentClassId: 1001, focus: "Inner Peace", identity: "Flow master.", growthDesc: "High Dodge/Tenacity.", mechanicDesc: "Anti-Stun.", leadsTo: "Zen-Master, Soul-Fist", hpGrowth: 9, mpGrowth: 5, atkGrowth: 2.8, defGrowth: 1.2, spdGrowth: 0.5, promotionReqLevel: 25 },
    { id: 1116, name: "Necrolyte", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Life Tap", identity: "Dark student.", growthDesc: "High INT/Lifesteal.", mechanicDesc: "+5 Mana on death.", leadsTo: "Reaper, Soul-Binder", hpGrowth: 7, mpGrowth: 14, atkGrowth: 1.0, defGrowth: 0.4, spdGrowth: 0.3, promotionReqLevel: 25 },
    { id: 1117, name: "Shield-Bearer", tier: 1, resourceType: "RAGE", parentClassId: 1001, focus: "Absolute Guard", identity: "Fortress.", growthDesc: "Highest DEF (+4).", mechanicDesc: "+20% Block Chance.", leadsTo: "Bastion, Fortress", hpGrowth: 14, mpGrowth: 0, atkGrowth: 1.2, defGrowth: 4.0, spdGrowth: 0.05, promotionReqLevel: 25 },
    { id: 1118, name: "Inquisitor", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Anti-Magic", identity: "Mage hunter.", growthDesc: "High Magic RES.", mechanicDesc: "+30% DMG vs Mana.", leadsTo: "Templar, Witch-Hunter", hpGrowth: 11, mpGrowth: 5, atkGrowth: 2.5, defGrowth: 1.5, spdGrowth: 0.3, promotionReqLevel: 25 },
    { id: 1119, name: "Dancer", tier: 1, resourceType: "ENERGY", parentClassId: 1001, focus: "Evasion", identity: "Flowing strikes.", growthDesc: "Highest SPD (+0.8).", mechanicDesc: "Dodge bonus on move.", leadsTo: "Blade-Dancer, Mirage-Dancer", hpGrowth: 6, mpGrowth: 4, atkGrowth: 2.0, defGrowth: 0.2, spdGrowth: 0.8, promotionReqLevel: 25 },
    { id: 1120, name: "Wanderer", tier: 1, resourceType: "ENERGY", parentClassId: 1001, focus: "Versatility", identity: "Traveler.", growthDesc: "Balanced (+1.5).", mechanicDesc: "+10% EXP Gain.", leadsTo: "Adventurer, Vagabond", hpGrowth: 10, mpGrowth: 10, atkGrowth: 1.5, defGrowth: 1.5, spdGrowth: 0.4, promotionReqLevel: 25 },
    { id: 1125, name: "Alchemist", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Status", identity: "Chemical specialist.", growthDesc: "High INT/Tenacity.", mechanicDesc: "50% stronger items.", leadsTo: "Plague-Doctor, Chemist", hpGrowth: 9, mpGrowth: 12, atkGrowth: 1.5, defGrowth: 1.0, spdGrowth: 0.3, promotionReqLevel: 25 },
    { id: 1126, name: "Ravager", tier: 1, resourceType: "RAGE", parentClassId: 1001, focus: "Adrenaline", identity: "Death-brink warrior.", growthDesc: "Massive ATK.", mechanicDesc: "+ATK per missing HP.", leadsTo: "Reaver, Executioner", hpGrowth: 16, mpGrowth: 0, atkGrowth: 4.5, defGrowth: 0.1, spdGrowth: 0.2, promotionReqLevel: 25 },
    { id: 1130, name: "Crusader", tier: 1, resourceType: "MANA", parentClassId: 1001, focus: "Sanctity", identity: "Holy warrior.", growthDesc: "High HP/RES.", mechanicDesc: "Immune to Poison.", leadsTo: "Paladin, Vindicator", hpGrowth: 13, mpGrowth: 8, atkGrowth: 2.2, defGrowth: 2.2, spdGrowth: 0.2, promotionReqLevel: 25 },

    // --- TIER 2 (SPECIALISTS) ---
    { id: 2101, name: "Knight", tier: 2, resourceType: "RAGE", parentClassId: 1101, focus: "Protection", identity: "Superior Knight.", hpGrowth: 20, mpGrowth: 0, atkGrowth: 3, defGrowth: 4, spdGrowth: 0.2, promotionReqLevel: 50 },
    { id: 2102, name: "Guardian", tier: 2, resourceType: "RAGE", parentClassId: 1101, focus: "Shield Master", identity: "Unbreakable.", hpGrowth: 18, mpGrowth: 0, atkGrowth: 2, defGrowth: 5, spdGrowth: 0.1, promotionReqLevel: 50 },
    { id: 2113, name: "Sniper", tier: 2, resourceType: "ENERGY", parentClassId: 1107, focus: "Range", identity: "Master Sniper.", mechanicDesc: "+2 Range; Static Shot.", leadsTo: "Gunner", hpGrowth: 10, mpGrowth: 5, atkGrowth: 5, defGrowth: 0.5, spdGrowth: 0.4, promotionReqLevel: 50 },
    { id: 2114, name: "Hunter", tier: 2, resourceType: "ENERGY", parentClassId: 1107, focus: "Wilderness", identity: "Beast hunter.", hpGrowth: 14, mpGrowth: 8, atkGrowth: 4, defGrowth: 1.5, spdGrowth: 0.6, promotionReqLevel: 50 },

    // --- TIER 3 (LEGENDS) ---
    { 
        id: 3101, name: "Gunner", tier: 3, resourceType: "ENERGY", parentClassId: 2113,
        focus: "Technology", identity: "The pinnacle of ranged warfare using heavy firearms.",
        growthDesc: "Superior ATK (+8) and Range (+0.8).", 
        mechanicDesc: "Pierce: Attacks hit all units in a straight line.", leadsTo: "Master of War",
        hpGrowth: 15, mpGrowth: 10, atkGrowth: 8, defGrowth: 1, spdGrowth: 0.5, 
        promotionReqLevel: 75 
    }
  ];

  for (const c of classes) {
    await prisma.classTemplate.upsert({
      where: { id: c.id },
      update: c,
      create: c
    });
  }

  console.log("✅ Codex v14.0 Refined: Warrior, Archer, and Gunner (T3) seeded.");
}

main()
  .catch(e => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });